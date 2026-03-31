import { GAME_WIDTH, COLOR_SILK } from '../core/Constants';
import { RunManager } from '../meta/RunManager';

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  height: number,
  runManager: RunManager,
  isInWebCatch: boolean,
  webCatchTimer: number,
  slingshotActive: boolean,
  slingshotPower: number
): void {
  ctx.save();

  // Height
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`${height}m`, 10, 30);

  // Silk earned this run
  if (runManager.silkEarned > 0) {
    ctx.fillStyle = COLOR_SILK;
    ctx.textAlign = 'right';
    ctx.fillText(`+${runManager.silkEarned} silk`, GAME_WIDTH - 10, 30);
  }

  // Web catches remaining
  ctx.textAlign = 'left';
  for (let i = 0; i < runManager.webCatchesLeft; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(15 + i * 18, 50, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#66ccff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Slingshot power
  if (slingshotActive) {
    const power = Math.round(slingshotPower * 100);
    const barWidth = 120;
    const barX = GAME_WIDTH / 2 - barWidth / 2;
    const barY = 15;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, 14);

    // Fill
    const r = Math.round(102 + slingshotPower * 153);
    const g = Math.round(204 - slingshotPower * 155);
    const b = Math.round(255 - slingshotPower * 211);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(barX, barY, barWidth * slingshotPower, 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${power}%`, GAME_WIDTH / 2, barY + 9);
  }

  // Web catch warning
  if (isInWebCatch) {
    const flash = Math.sin(Date.now() * 0.02) > 0;
    ctx.fillStyle = flash ? '#ff4444' : '#ff8844';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TAP TO SAVE!', GAME_WIDTH / 2, 120);

    // Timer bar
    const timerPct = webCatchTimer / 0.4;
    ctx.fillStyle = `rgba(255,68,68,${0.5 + timerPct * 0.5})`;
    ctx.fillRect(GAME_WIDTH / 2 - 60, 130, 120 * timerPct, 6);
  }

  ctx.restore();
}
