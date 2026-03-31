import { GameLoop } from './core/GameLoop';
import { Input } from './core/Input';
import { Camera } from './core/Camera';
import { Vec2 } from './core/Vec2';
import { GAME_WIDTH, GAME_HEIGHT, SHAFT_WIDTH, SILK_PER_ZONE, DEATH_FLOOR_SPEED } from './core/Constants';
import { Spider } from './entities/Spider';
import { Moth } from './entities/Moth';
import { Wasp } from './entities/Wasp';
import { WebEater } from './entities/WebEater';
import { BigSpider } from './entities/BigSpider';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { Renderer } from './rendering/Renderer';
import { drawSpider, drawTrail } from './rendering/SpiderRenderer';
import { drawWeb, drawWebProjectile, drawAnchors, drawWalls } from './rendering/WebRenderer';
import { drawBackground } from './rendering/BackgroundRenderer';
import { ParticleSystem } from './rendering/ParticleSystem';
import { drawHUD } from './rendering/HUD';
import { drawTitleScreen, drawDeathScreen, drawUpgradeScreen, UpgradeButton } from './rendering/UIScreens';
import { LevelManager } from './level/LevelManager';
import { RunManager } from './meta/RunManager';
import { getUpgradeCost, getUpgradeLevel, UPGRADES } from './meta/UpgradeSystem';
import { PokiSDK } from './meta/PokiIntegration';
import { Audio } from './audio/AudioManager';
import { circlesOverlap } from './physics/Collision';
import { pointToSegmentDistSq } from './core/Vec2';

// --- Setup ---
const canvas = document.getElementById('game') as HTMLCanvasElement;
const renderer = new Renderer(canvas);
const input = new Input(canvas);
const camera = new Camera();
const particles = new ParticleSystem();
const levelManager = new LevelManager();
const runManager = new RunManager();
const poki = new PokiSDK();

// Spider
let spider = new Spider(GAME_WIDTH / 2, 0);
let physics = new PhysicsWorld(spider.body);

// Enemies (active instances)
let moths: Moth[] = [];
let wasps: Wasp[] = [];
let webEaters: WebEater[] = [];
let bigSpiders: BigSpider[] = [];

let gameTime = 0;
let deathFloorY = 800;
let lastZoneIndex = -1;
let upgradeButtons: UpgradeButton[] = [];

// Initialize
poki.init();

function syncInputScale(): void {
  input.scale = renderer.scale;
  input.offsetX = renderer.offsetX;
  input.offsetY = renderer.offsetY;
}

function startRun(): void {
  spider = new Spider(GAME_WIDTH / 2, 0);
  physics = new PhysicsWorld(spider.body);
  moths = [];
  wasps = [];
  webEaters = [];
  bigSpiders = [];
  deathFloorY = 800;
  lastZoneIndex = -1;
  gameTime = 0;

  // Apply upgrade effects
  physics.slingshot.maxStretch = runManager.effects.slingshotMaxStretch;

  levelManager.reset();
  levelManager.ensureZonesAround(0);
  physics.anchors = levelManager.allAnchors;
  physics.walls = levelManager.allWalls;

  camera.levelLeft = 0;
  camera.levelRight = SHAFT_WIDTH;
  camera.levelTop = -100000;
  camera.levelBottom = 500;
  camera.pos.set(GAME_WIDTH / 2, 0);

  // Spawn enemies for initial zones
  spawnEnemiesForVisibleZones();

  runManager.startRun();
  poki.gameplayStart();
  Audio.unlock();
}

function spawnEnemiesForVisibleZones(): void {
  for (const zone of levelManager.getActiveZones()) {
    for (const spawn of zone.enemies) {
      // Check if already spawned (simple dedup by position)
      const exists = (arr: { pos: Vec2 }[]) =>
        arr.some(e => Math.abs(e.pos.x - spawn.x) < 1 && Math.abs(e.pos.y - spawn.y) < 1);

      switch (spawn.type) {
        case 'moth':
          if (!exists(moths)) moths.push(new Moth(spawn.x, spawn.y));
          break;
        case 'wasp':
          if (!exists(wasps)) wasps.push(new Wasp(spawn.x, spawn.y));
          break;
        case 'webEater':
          if (!exists(webEaters)) webEaters.push(new WebEater(spawn.x, spawn.y, 0));
          break;
        case 'bigSpider':
          if (!exists(bigSpiders)) bigSpiders.push(new BigSpider(spawn.x, spawn.y));
          break;
      }
    }
  }
}

function handleDeath(): void {
  const height = Math.max(0, Math.floor(-spider.y / 10));
  Audio.death();
  particles.emitDeath(spider.body.pos);
  poki.gameplayStop();
  runManager.onDeath(height, [...spider.trailPositions]);
}

// --- Update ---
function update(dt: number): void {
  gameTime += dt;
  syncInputScale();

  // --- Screen-based state machine ---
  if (runManager.screen === 'title') {
    if (input.consumeTap()) {
      startRun();
    }
    input.update(dt);
    return;
  }

  if (runManager.screen === 'dead') {
    if (input.consumeTap()) {
      const tapPos = input.pos;
      // Check if tap is in lower area (upgrades button region)
      if (tapPos.y > GAME_HEIGHT * 0.6) {
        runManager.goToUpgrades();
      } else {
        poki.commercialBreak().then(() => {
          startRun();
        });
      }
    }
    input.update(dt);
    return;
  }

  if (runManager.screen === 'upgrades') {
    if (input.consumeTap()) {
      const tapX = input.pos.x;
      const tapY = input.pos.y;
      let handled = false;

      for (const btn of upgradeButtons) {
        if (tapX >= btn.x && tapX <= btn.x + btn.width &&
            tapY >= btn.y && tapY <= btn.y + btn.height) {
          if (btn.id === '__back') {
            runManager.screen = 'dead';
            handled = true;
          } else {
            const upgrade = UPGRADES.find(u => u.id === btn.id);
            if (upgrade) {
              const level = getUpgradeLevel(runManager.save.upgrades, btn.id);
              const cost = getUpgradeCost(upgrade, level);
              if (runManager.purchaseUpgrade(btn.id, cost)) {
                Audio.upgrade();
                particles.emitBurst(new Vec2(tapX, tapY), 10, 100, '#ffcc00');
              }
            }
            handled = true;
          }
          break;
        }
      }

      if (!handled) {
        // Tap anywhere outside buttons = back
      }
    }
    input.update(dt);
    particles.update(dt);
    return;
  }

  // --- Playing ---
  if (physics.isDead && runManager.screen === 'playing') {
    handleDeath();
    input.update(dt);
    return;
  }

  // Physics update
  physics.update(dt, input, camera);
  spider.update(dt);

  // Level streaming
  levelManager.ensureZonesAround(spider.y);
  physics.anchors = levelManager.allAnchors;
  physics.walls = levelManager.allWalls;
  levelManager.updateAnchors(dt);

  // Zone tracking
  const currentZone = levelManager.currentZoneIndex;
  if (currentZone > lastZoneIndex) {
    if (lastZoneIndex >= 0) {
      runManager.onZoneCleared(lastZoneIndex);
      Audio.zoneComplete();
    }
    lastZoneIndex = currentZone;
    spawnEnemiesForVisibleZones();
  }

  // Update enemies
  for (const moth of moths) moth.update(dt);
  for (const wasp of wasps) wasp.update(dt, spider.body.pos);
  for (const we of webEaters) we.update(dt);
  for (const bs of bigSpiders) bs.update(dt);

  // --- Enemy collisions ---

  // Moths snap web
  if (physics.rope.active) {
    for (const moth of moths) {
      if (!moth.alive) continue;
      const distSq = pointToSegmentDistSq(moth.pos, physics.rope.anchorPos, spider.body.pos);
      if (distSq < (moth.radius + 2) * (moth.radius + 2)) {
        physics.rope.detach();
        moth.alive = false;
        Audio.webSnap();
        particles.emitWebSnap(moth.pos);
        break;
      }
    }
  }

  // Wasps hit spider
  for (const wasp of wasps) {
    if (!wasp.alive) continue;
    if (circlesOverlap(spider.body.pos, spider.body.radius, wasp.pos, wasp.radius)) {
      wasp.alive = false;
      if (runManager.useWebCatch()) {
        physics.triggerWebCatch();
        Audio.webCatchWarning();
      } else {
        physics.isDead = true;
      }
    }
  }

  // Big spider collision
  for (const bs of bigSpiders) {
    if (!bs.alive) continue;
    // Check if spider hit weak point (via slingshot launch)
    const spiderSpeed = spider.body.getVelocity().length();
    if (spiderSpeed > 5) {
      const wp = bs.getWeakPointPos();
      if (circlesOverlap(spider.body.pos, spider.body.radius, wp, 12)) {
        if (bs.hit()) {
          particles.emitBurst(bs.pos, 30, 200, '#884488');
          runManager.silkEarned += SILK_PER_ZONE * 2;
        } else {
          particles.emitBurst(wp, 15, 100, '#ffcc00');
        }
        Audio.bossHit();
        // Bounce spider back
        const bounceDir = spider.body.pos.sub(bs.pos).normalize();
        spider.body.applyImpulse(bounceDir.scale(8));
        continue;
      }
    }
    // Body collision = death
    if (!bs.isStunned && circlesOverlap(spider.body.pos, spider.body.radius, bs.pos, bs.radius)) {
      if (runManager.useWebCatch()) {
        physics.triggerWebCatch();
        Audio.webCatchWarning();
        // Bounce away
        const bounceDir = spider.body.pos.sub(bs.pos).normalize();
        spider.body.applyImpulse(bounceDir.scale(6));
      } else {
        physics.isDead = true;
      }
    }
  }

  // Death floor
  deathFloorY = Math.min(deathFloorY, spider.y + 600);
  deathFloorY -= DEATH_FLOOR_SPEED * dt;

  if (spider.y > deathFloorY + 100) {
    physics.isDead = true;
  }

  // Particles
  particles.update(dt);

  // Slingshot launch detection (for particles)
  if (physics.slingshot.active && physics.slingshot.stretchAmount > 10) {
    Audio.slingshotStretch();
  }

  input.update(dt);
}

// --- Render ---
function render(_interp: number): void {
  const ctx = renderer.ctx;
  renderer.beginFrame();

  if (runManager.screen === 'title') {
    drawTitleScreen(ctx, gameTime);
    renderer.endFrame();
    return;
  }

  if (runManager.screen === 'upgrades') {
    upgradeButtons = drawUpgradeScreen(ctx, runManager, gameTime);
    particles.draw(ctx);
    renderer.endFrame();
    return;
  }

  // --- Game rendering ---

  // Background
  drawBackground(ctx, camera, levelManager.getActiveZones());

  // Apply camera
  ctx.save();
  renderer.applyCamera(camera);

  // Get current zone theme for wall color
  const currentZone = levelManager.getCurrentZone();
  const wallColor = currentZone?.theme.wallColor ?? '#1a1a3a';

  // Walls
  drawWalls(ctx, physics.walls as { x: number; y: number; width: number; height: number }[], camera, wallColor);

  // Death floor
  ctx.fillStyle = 'rgba(255,34,0,0.15)';
  ctx.fillRect(-50, deathFloorY, SHAFT_WIDTH + 100, 2000);
  ctx.strokeStyle = '#ff2200';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-50, deathFloorY);
  ctx.lineTo(SHAFT_WIDTH + 50, deathFloorY);
  ctx.stroke();

  // Ghost trail from last run
  if (runManager.effects.ghostWebEnabled && runManager.lastRunTrail.length > 1) {
    ctx.strokeStyle = 'rgba(102,204,255,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(runManager.lastRunTrail[0].x, runManager.lastRunTrail[0].y);
    for (let i = 1; i < runManager.lastRunTrail.length; i++) {
      ctx.lineTo(runManager.lastRunTrail[i].x, runManager.lastRunTrail[i].y);
    }
    ctx.stroke();
  }

  // Anchors
  drawAnchors(ctx, physics.anchors, camera, spider.body.pos, gameTime);

  // Enemies
  for (const moth of moths) {
    if (camera.isVisible(moth.pos, 50)) moth.draw(ctx);
  }
  for (const wasp of wasps) {
    if (camera.isVisible(wasp.pos, 50)) wasp.draw(ctx);
  }
  for (const we of webEaters) {
    if (camera.isVisible(we.pos, 50)) we.draw(ctx);
  }
  for (const bs of bigSpiders) {
    if (camera.isVisible(bs.pos, 100)) bs.draw(ctx);
  }

  // Web projectile
  drawWebProjectile(ctx, physics.webShooter, spider.body.pos);

  // Web line
  drawWeb(ctx, spider.body.pos, physics.rope, physics.slingshot);

  // Spider trail
  drawTrail(ctx, spider);

  // Spider
  if (!physics.isDead) {
    drawSpider(ctx, spider);
  }

  // Particles (world space)
  particles.draw(ctx);

  ctx.restore();

  // HUD (screen space)
  if (runManager.screen === 'playing' && !physics.isDead) {
    const height = Math.max(0, Math.floor(-spider.y / 10));
    drawHUD(
      ctx,
      height,
      runManager,
      physics.isInWebCatch,
      physics.webCatchTimer,
      physics.slingshot.active,
      physics.slingshot.stretchAmount / physics.slingshot.maxStretch
    );

    // Zone indicator
    if (currentZone) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Zone ${currentZone.index + 1}: ${currentZone.theme.name}`, GAME_WIDTH - 10, GAME_HEIGHT - 15);
    }
  }

  // Death screen overlay
  if (runManager.screen === 'dead') {
    drawDeathScreen(ctx, runManager, gameTime);
  }

  renderer.endFrame();
}

// --- Start ---
const loop = new GameLoop(update, render);
loop.start();
