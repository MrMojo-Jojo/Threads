import { Camera } from '../core/Camera';
import { Zone } from '../level/Zone';
import { GAME_WIDTH, GAME_HEIGHT } from '../core/Constants';

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  zones: Zone[]
): void {
  // Default background
  const defaultGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  defaultGrad.addColorStop(0, '#0a0a1a');
  defaultGrad.addColorStop(1, '#1a1a2a');
  ctx.fillStyle = defaultGrad;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Draw zone-specific backgrounds
  for (const zone of zones) {
    const screenTop = zone.topY - camera.pos.y + GAME_HEIGHT / 2;
    const screenBottom = zone.bottomY - camera.pos.y + GAME_HEIGHT / 2;

    // Skip if not visible
    if (screenBottom < -100 || screenTop > GAME_HEIGHT + 100) continue;

    const grad = ctx.createLinearGradient(0, Math.max(0, screenTop), 0, Math.min(GAME_HEIGHT, screenBottom));
    grad.addColorStop(0, zone.theme.bgTop);
    grad.addColorStop(1, zone.theme.bgBottom);
    ctx.fillStyle = grad;

    const drawTop = Math.max(0, screenTop);
    const drawBottom = Math.min(GAME_HEIGHT, screenBottom);
    ctx.fillRect(0, drawTop, GAME_WIDTH, drawBottom - drawTop);

    // Zone label
    const labelY = (screenTop + screenBottom) / 2;
    if (labelY > 0 && labelY < GAME_HEIGHT) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(zone.theme.name, GAME_WIDTH / 2, labelY);
    }
  }

  // Parallax stars
  drawStars(ctx, camera);
}

function drawStars(ctx: CanvasRenderingContext2D, camera: Camera): void {
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  const seed = 12345;
  for (let i = 0; i < 60; i++) {
    const hash = (seed * (i + 1) * 16807) % 2147483647;
    const x = (hash % GAME_WIDTH);
    const y = ((hash * 7) % 2000) - camera.pos.y * 0.1 % 2000;
    const normalizedY = ((y % GAME_HEIGHT) + GAME_HEIGHT) % GAME_HEIGHT;
    const size = 1 + (hash % 3) * 0.5;
    ctx.beginPath();
    ctx.arc(x, normalizedY, size, 0, Math.PI * 2);
    ctx.fill();
  }
}
