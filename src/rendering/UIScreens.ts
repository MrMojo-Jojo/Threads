import { GAME_WIDTH, GAME_HEIGHT, COLOR_SILK } from '../core/Constants';
import { RunManager } from '../meta/RunManager';
import { UPGRADES, getUpgradeCost, getUpgradeLevel } from '../meta/UpgradeSystem';

export function drawTitleScreen(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THREAD', GAME_WIDTH / 2, GAME_HEIGHT / 3);

  // Subtitle
  ctx.fillStyle = '#66ccff';
  ctx.font = '14px monospace';
  ctx.fillText('A Spider\'s Climb', GAME_WIDTH / 2, GAME_HEIGHT / 3 + 35);

  // Animated spider silk line
  const silkY = GAME_HEIGHT / 3 - 60;
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH / 2, 0);
  ctx.lineTo(GAME_WIDTH / 2, silkY);
  ctx.stroke();

  // Start prompt
  const alpha = Math.sin(time * 3) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.font = '16px monospace';
  ctx.fillText('Tap to Start', GAME_WIDTH / 2, GAME_HEIGHT * 0.65);

  // Instructions
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px monospace';
  ctx.fillText('Tap to shoot web', GAME_WIDTH / 2, GAME_HEIGHT * 0.75);
  ctx.fillText('Hold + drag back to slingshot', GAME_WIDTH / 2, GAME_HEIGHT * 0.75 + 20);
}

export function drawDeathScreen(
  ctx: CanvasRenderingContext2D,
  runManager: RunManager,
  time: number
): void {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const centerY = GAME_HEIGHT / 2;

  // Fell text
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('YOU FELL', GAME_WIDTH / 2, centerY - 80);

  // Stats
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText(`Height: ${runManager.currentHeight}m`, GAME_WIDTH / 2, centerY - 40);

  if (runManager.currentHeight >= runManager.save.bestHeight) {
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('NEW BEST!', GAME_WIDTH / 2, centerY - 15);
  }

  // Silk earned
  ctx.fillStyle = COLOR_SILK;
  ctx.fillText(`+${runManager.silkEarned} Thread Silk`, GAME_WIDTH / 2, centerY + 15);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '12px monospace';
  ctx.fillText(`Total: ${runManager.save.silk}`, GAME_WIDTH / 2, centerY + 35);

  // Buttons
  const btnY = centerY + 70;
  const alpha = Math.sin(time * 3) * 0.2 + 0.8;

  // Retry button
  ctx.fillStyle = `rgba(102,204,255,${alpha})`;
  ctx.font = '16px monospace';
  ctx.fillText('Tap to Retry', GAME_WIDTH / 2, btnY);

  // Upgrades button
  ctx.fillStyle = 'rgba(255,204,0,0.7)';
  ctx.font = '14px monospace';
  ctx.fillText('[Upgrades]', GAME_WIDTH / 2, btnY + 35);
}

export interface UpgradeButton {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function drawUpgradeScreen(
  ctx: CanvasRenderingContext2D,
  runManager: RunManager,
  _time: number
): UpgradeButton[] {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const buttons: UpgradeButton[] = [];

  // Title
  ctx.fillStyle = COLOR_SILK;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('UPGRADES', GAME_WIDTH / 2, 50);

  // Silk balance
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px monospace';
  ctx.fillText(`Thread Silk: ${runManager.save.silk}`, GAME_WIDTH / 2, 80);

  // Upgrade list
  const startY = 110;
  const itemHeight = 80;

  for (let i = 0; i < UPGRADES.length; i++) {
    const upgrade = UPGRADES[i];
    const level = getUpgradeLevel(runManager.save.upgrades, upgrade.id);
    const maxed = level >= upgrade.maxLevel;
    const cost = maxed ? 0 : getUpgradeCost(upgrade, level);
    const canAfford = runManager.save.silk >= cost;

    const y = startY + i * itemHeight;
    const btnX = 20;
    const btnW = GAME_WIDTH - 40;
    const btnH = itemHeight - 10;

    // Background
    ctx.fillStyle = maxed
      ? 'rgba(68,170,68,0.15)'
      : canAfford
        ? 'rgba(102,204,255,0.1)'
        : 'rgba(255,255,255,0.05)';
    ctx.fillRect(btnX, y, btnW, btnH);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(btnX, y, btnW, btnH);

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(upgrade.name, btnX + 10, y + 22);

    // Level pips
    for (let l = 0; l < upgrade.maxLevel; l++) {
      ctx.fillStyle = l < level ? '#66ccff' : 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(btnX + 10 + l * 14, y + 38, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Description
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px monospace';
    ctx.fillText(upgrade.description, btnX + 10, y + 58);

    // Cost / Max
    ctx.textAlign = 'right';
    if (maxed) {
      ctx.fillStyle = '#44aa44';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('MAX', btnX + btnW - 10, y + 22);
    } else {
      ctx.fillStyle = canAfford ? COLOR_SILK : '#666666';
      ctx.font = '12px monospace';
      ctx.fillText(`${cost} silk`, btnX + btnW - 10, y + 22);
    }

    if (!maxed) {
      buttons.push({ id: upgrade.id, x: btnX, y, width: btnW, height: btnH });
    }
  }

  // Back button
  const backY = GAME_HEIGHT - 60;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[Back]', GAME_WIDTH / 2, backY);

  buttons.push({ id: '__back', x: GAME_WIDTH / 2 - 50, y: backY - 20, width: 100, height: 30 });

  return buttons;
}
