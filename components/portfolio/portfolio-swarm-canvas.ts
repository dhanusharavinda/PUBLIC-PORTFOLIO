import type { ConstructionTask } from './portfolio-construction';

type Point = { x: number; y: number };
type CanvasFrame = {
  mode: 'idle' | 'building' | 'complete';
  tasks: readonly ConstructionTask[];
  pointer: Point | null;
  bounds?: Surface;
};
type Cursor = Point & { vx: number; vy: number; angle: number };
type Surface = Point & { width: number; height: number };

const colors = ['#0088ed', '#f35439', '#00a866', '#a35af7', '#ff8b14', '#ec4788', '#00abc4', '#deb016'];
const cursorCount = 16;
const goldenAngle = 2.399963;

function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value));
}

function line(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
}

function arrow(ctx: CanvasRenderingContext2D, point: Point, color: string, angle = 0, scale = 1) {
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#15213438';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(3.8, 17.6);
  ctx.lineTo(8.2, 12.1);
  ctx.lineTo(14.9, 10.5);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function toolCursor(
  ctx: CanvasRenderingContext2D,
  at: Point,
  color: string,
  tool: 'draw' | 'type' | 'resize',
  height = 14,
) {
  const { x, y } = at;
  ctx.beginPath();
  if (tool === 'type') {
    const halfHeight = clamp(height / 2, 6, 15);
    line(ctx, { x, y: y - halfHeight }, { x, y: y + halfHeight });
    line(ctx, { x: x - 3, y: y - halfHeight }, { x: x + 3, y: y - halfHeight });
    line(ctx, { x: x - 3, y: y + halfHeight }, { x: x + 3, y: y + halfHeight });
  } else if (tool === 'resize') {
    line(ctx, { x: x - 8, y }, { x: x + 8, y });
    line(ctx, { x: x - 8, y }, { x: x - 4, y: y - 3 });
    line(ctx, { x: x - 8, y }, { x: x - 4, y: y + 3 });
    line(ctx, { x: x + 8, y }, { x: x + 4, y: y - 3 });
    line(ctx, { x: x + 8, y }, { x: x + 4, y: y + 3 });
  } else {
    line(ctx, { x: x - 7, y }, { x: x + 7, y });
    line(ctx, { x, y: y - 7 }, { x, y: y + 7 });
  }
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function ruler(ctx: CanvasRenderingContext2D, surface: Surface) {
  ctx.save();
  ctx.strokeStyle = '#59657958';
  ctx.fillStyle = '#596579a8';
  ctx.lineWidth = 1;
  ctx.font = '8px ui-monospace, monospace';
  ctx.beginPath();
  for (let x = 20; x < surface.width; x += 20) {
    const major = x % 100 === 0;
    const tick = surface.x + x;
    line(ctx, { x: tick, y: surface.y }, { x: tick, y: surface.y + (major ? 9 : 4) });
    if (major) ctx.fillText(String(x), tick + 3, surface.y + 8);
  }
  for (let y = 20; y < surface.height; y += 20) {
    const major = y % 100 === 0;
    const tick = surface.y + y;
    line(ctx, { x: surface.x, y: tick }, { x: surface.x + (major ? 9 : 4), y: tick });
    if (major) ctx.fillText(String(y), surface.x + 3, tick - 3);
  }
  ctx.stroke();
  ctx.restore();
}

function guides(ctx: CanvasRenderingContext2D, surface: Surface, anchor: Point, color: string) {
  ctx.save();
  ctx.globalAlpha *= 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  line(ctx, { x: anchor.x, y: 0 }, { x: anchor.x, y: surface.height });
  line(ctx, { x: 0, y: anchor.y }, { x: surface.width, y: anchor.y });
  ctx.stroke();
  ctx.restore();
}

function selection(ctx: CanvasRenderingContext2D, at: Point, width: number, height: number, color: string) {
  ctx.strokeStyle = color;
  ctx.fillStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(at.x, at.y, width, height);
  for (const x of [at.x, at.x + width]) {
    for (const y of [at.y, at.y + height]) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.strokeRect(x - 2, y - 2, 4, 4);
    }
  }
}

function dimension(
  ctx: CanvasRenderingContext2D,
  area: Surface,
  anchor: Point,
  width: number,
  height: number,
  color: string,
) {
  const label = `${Math.round(width)} × ${Math.round(height)}`;
  ctx.font = '600 10px ui-monospace, monospace';
  const labelWidth = ctx.measureText(label).width + 10;
  const x = clamp(anchor.x - labelWidth / 2, area.x + 4, area.x + Math.max(4, area.width - labelWidth - 4));
  const y = clamp(anchor.y, area.y + 6, area.y + Math.max(6, area.height - 22));
  ctx.fillStyle = color;
  ctx.fillRect(x, y, labelWidth, 16);
  ctx.fillStyle = color === colors[4] || color === colors[7] ? '#1d2430' : '#fff';
  ctx.fillText(label, x + 5, y + 11);
}

function drawTask(ctx: CanvasRenderingContext2D, surface: Surface, area: Surface, task: ConstructionTask): Point | null {
  const { width, height } = task.rect;
  const at = { x: task.rect.x - surface.x, y: task.rect.y - surface.y };
  const displaced = { x: at.x + task.offsetX, y: at.y + task.offsetY };
  if (at.x + width < -80 || at.y + height < -80 || at.x > surface.width + 80 || at.y > surface.height + 80) {
    return null;
  }

  const color = colors[task.index % colors.length];
  const progress = clamp(task.progress, 0, 1);
  let cursor = displaced;
  ctx.save();
  ctx.globalAlpha = Math.min(1, 0.55 + task.pieceProgress * 2, (1 - task.pieceProgress) * 4 + 0.2);
  guides(ctx, surface, at, color);

  if (task.stage === 'guide' || task.stage === 'measure') {
    const drawnWidth = Math.max(4, width * progress);
    const drawnHeight = Math.max(4, height * progress);
    selection(ctx, at, drawnWidth, drawnHeight, color);
    cursor = { x: at.x + drawnWidth, y: at.y + drawnHeight };
    toolCursor(ctx, cursor, color, task.stage === 'guide' ? 'draw' : 'resize');
  } else if (task.stage === 'type') {
    selection(ctx, at, width, height, color);
    if (task.typeCaret) {
      cursor = { x: task.typeCaret.x - surface.x, y: task.typeCaret.y - surface.y + task.typeCaret.height / 2 };
    } else {
      cursor = { x: at.x + 4 + (width - 8) * progress, y: at.y + height / 2 };
    }
    toolCursor(ctx, cursor, color, 'type', task.typeCaret?.height);
  } else {
    if (task.stage === 'drag') {
      ctx.save();
      ctx.globalAlpha *= 0.44;
      ctx.strokeStyle = color;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(at.x, at.y, width, height);
      ctx.restore();
    }
    selection(ctx, displaced, width, height, color);
    cursor = { x: displaced.x + Math.min(width * 0.68, width - 8), y: displaced.y + Math.min(12, height / 2) };
    arrow(ctx, cursor, color);
  }

  const labelY = task.stage === 'drag' ? displaced.y + height : at.y + height;
  dimension(ctx, area, { x: at.x + width / 2, y: labelY + 5 }, width, height, color);
  ctx.restore();
  return cursor;
}

function pushAway(cursor: Cursor, from: Point, to: Point, radius: number, strength: number) {
  const sweepX = to.x - from.x;
  const sweepY = to.y - from.y;
  const lengthSquared = sweepX * sweepX + sweepY * sweepY;
  const projection = lengthSquared
    ? clamp(((cursor.x - from.x) * sweepX + (cursor.y - from.y) * sweepY) / lengthSquared, 0, 1)
    : 0;
  const dx = cursor.x - from.x - sweepX * projection;
  const dy = cursor.y - from.y - sweepY * projection;
  const distance = Math.hypot(dx, dy);
  if (distance >= radius) return;
  const force = strength * (1 - distance / radius);
  const angle = distance > 0.01 ? Math.atan2(dy, dx) : cursor.angle;
  cursor.vx += Math.cos(angle) * force;
  cursor.vy += Math.sin(angle) * force;
}

export function createPortfolioSwarmCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const flock: Cursor[] = [];
  let lastPointer: Point | null = null;
  let lastConstructionPoint: Point | null = null;
  let target: Point | null = null;
  let lastFrame = 0;
  let lastActivity = 0;
  let followX = 0;
  let followY = 0;

  function clear() {
    if (ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    flock.length = 0;
    lastPointer = null;
    lastConstructionPoint = null;
    target = null;
    lastFrame = 0;
    lastActivity = 0;
    followX = 0;
    followY = 0;
  }

  function drawFlock(area: Surface, pointer: Point | null, now: number) {
    if (!ctx) return false;
    if (!flock.length) {
      const origin = lastConstructionPoint || { x: area.x + area.width * 0.5, y: area.y + area.height * 0.5 };
      target = pointer || origin;
      for (let index = 0; index < cursorCount; index++) {
        const angle = index * goldenAngle;
        const radius = 12 + index * 4;
        flock.push({
          x: origin.x + Math.cos(angle) * radius,
          y: origin.y + Math.sin(angle) * radius,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2,
          angle,
        });
      }
      lastActivity = now;
    }

    const dt = lastFrame ? clamp((now - lastFrame) / 16.67, 0.35, 2.3) : 1;
    lastFrame = now;

    if (pointer && lastPointer) {
      const dx = pointer.x - lastPointer.x;
      const dy = pointer.y - lastPointer.y;
      const travel = Math.hypot(dx, dy);
      if (travel > 0.25) {
        lastActivity = now;
        const kick = Math.min(62, 3 + travel * 0.64);
        const reach = Math.min(112, 26 + travel * 0.5);
        for (const cursor of flock) pushAway(cursor, lastPointer, pointer, reach, kick);
        followX = followX * 0.5 + clamp(dx * 2.8, -56, 56) * 0.5;
        followY = followY * 0.5 + clamp(dy * 2.8, -56, 56) * 0.5;
      }
    } else if (pointer) {
      lastActivity = now;
    }
    lastPointer = pointer;
    if (pointer) target = pointer;
    if (!target) return false;

    followX *= 0.92 ** dt;
    followY *= 0.92 ** dt;
    for (let index = 0; index < flock.length; index++) {
      const cursor = flock[index];
      const angle = index * goldenAngle + Math.sin(now / 1100 + index) * 0.12;
      const radius = 31 + (index % 5) * 9;
      const x = clamp(target.x - followX + Math.cos(angle) * radius, area.x + 12, area.x + Math.max(12, area.width - 16));
      const y = clamp(target.y - followY + Math.sin(angle) * radius * 0.8, area.y + 12, area.y + Math.max(12, area.height - 16));
      cursor.vx += (x - cursor.x) * 0.036 * dt;
      cursor.vy += (y - cursor.y) * 0.036 * dt;
      if (pointer) pushAway(cursor, pointer, pointer, 26, 4.2 * dt);
    }

    for (let index = 0; index < flock.length; index++) {
      const cursor = flock[index];
      cursor.vx *= 0.79 ** dt;
      cursor.vy *= 0.79 ** dt;
      cursor.x = clamp(cursor.x + cursor.vx * dt, area.x + 6, area.x + Math.max(6, area.width - 12));
      cursor.y = clamp(cursor.y + cursor.vy * dt, area.y + 6, area.y + Math.max(6, area.height - 12));
      if (Math.hypot(cursor.vx, cursor.vy) > 0.32) {
        const heading = Math.atan2(cursor.vy, cursor.vx) + Math.PI * 0.75;
        const turn = Math.atan2(Math.sin(heading - cursor.angle), Math.cos(heading - cursor.angle));
        cursor.angle += turn * 0.19 * dt;
      }
      arrow(ctx, cursor, colors[index % colors.length], cursor.angle, 0.79 + (index % 4) * 0.055);
    }

    return now - lastActivity < 1550;
  }

  function render(frame: CanvasFrame, now: number) {
    if (!ctx) return false;
    const { left, top, width, height } = canvas.getBoundingClientRect();
    if (width < 1 || height < 1) return false;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelsWide = Math.round(width * ratio);
    const pixelsHigh = Math.round(height * ratio);
    if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
      canvas.width = pixelsWide;
      canvas.height = pixelsHigh;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pixelsWide, pixelsHigh);
    ctx.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);

    const surface = { x: left, y: top, width, height };
    if (frame.mode !== 'complete' && flock.length) clear();
    if (frame.mode === 'idle') return false;
    const area = frame.bounds
      ? { ...frame.bounds, x: frame.bounds.x - left, y: frame.bounds.y - top }
      : { x: 0, y: 0, width, height };
    if (area.width < 1 || area.height < 1) return false;
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.x, area.y, area.width, area.height);
    ctx.clip();

    if (frame.mode === 'complete') {
      const pointer = frame.pointer && { x: frame.pointer.x - left, y: frame.pointer.y - top };
      const active = drawFlock(area, pointer, now);
      ctx.restore();
      return active;
    }

    if (!frame.tasks.length && !lastConstructionPoint) {
      const anchor = { x: area.x + area.width * 0.46, y: area.y + area.height * 0.33 };
      for (let index = 0; index < 7; index++) {
        const angle = index * goldenAngle;
        const radius = 15 + index * 8;
        arrow(ctx, { x: anchor.x + Math.cos(angle) * radius, y: anchor.y + Math.sin(angle) * radius }, colors[index], angle, 0.85);
      }
    }
    if (frame.tasks.length) ruler(ctx, area);
    for (const task of frame.tasks) {
      lastConstructionPoint = drawTask(ctx, surface, area, task) || lastConstructionPoint;
    }
    ctx.restore();
    return false;
  }

  return { render, clear };
}
