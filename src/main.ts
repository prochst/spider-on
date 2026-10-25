// Placeholder for phase 1: draws the empty neon web so the deploy pipeline has
// something to show. The game loop, rendering and themes arrive in phase 2.
import { GATE_SPOKES, RING_COUNT, SPOKE_COUNT } from "./game/config";
import { ringPoint, ringRadius, SPOKE_STEP } from "./game/geometry";

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) throw new Error("Missing #game canvas");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D is not supported");

function draw(context: CanvasRenderingContext2D, target: HTMLCanvasElement): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = target.clientWidth;
  const height = target.clientHeight;
  target.width = Math.round(width * dpr);
  target.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const size = Math.min(width, height);
  const unit = (size / 2) * 0.9;
  const cx = width / 2;
  const cy = height / 2;

  context.fillStyle = "#07060f";
  context.fillRect(0, 0, width, height);
  context.lineCap = "round";

  for (let spoke = 0; spoke < SPOKE_COUNT; spoke++) {
    const isGate = (GATE_SPOKES as readonly number[]).includes(spoke);
    const angle = spoke * SPOKE_STEP;
    const from = isGate ? ringRadius(0) : 0.06;
    const to = isGate ? ringRadius(RING_COUNT - 1) : 1.02;
    context.strokeStyle = isGate ? "#ff6ad5" : "rgba(90, 220, 255, 0.3)";
    context.shadowColor = isGate ? "#ff6ad5" : "transparent";
    context.shadowBlur = isGate ? 10 : 0;
    context.lineWidth = isGate ? 2 : 1;
    context.beginPath();
    context.moveTo(cx + Math.cos(angle) * from * unit, cy + Math.sin(angle) * from * unit);
    context.lineTo(cx + Math.cos(angle) * to * unit, cy + Math.sin(angle) * to * unit);
    context.stroke();
  }

  context.strokeStyle = "rgba(120, 235, 255, 0.95)";
  context.shadowColor = "#4fe3ff";
  context.shadowBlur = 8;
  context.lineWidth = 1.6;
  for (let ring = 0; ring < RING_COUNT; ring++) {
    context.beginPath();
    for (let i = 0; i <= 240; i++) {
      const p = ringPoint(ring, (i / 240) * Math.PI * 2);
      const x = cx + p.x * unit;
      const y = cy + p.y * unit;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }

  context.shadowBlur = 12;
  context.fillStyle = "#c9f6ff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `700 ${Math.round(size * 0.06)}px system-ui, sans-serif`;
  context.fillText("SPIDER ON", cx, cy);
}

const render = () => draw(ctx, canvas);
window.addEventListener("resize", render);
render();
