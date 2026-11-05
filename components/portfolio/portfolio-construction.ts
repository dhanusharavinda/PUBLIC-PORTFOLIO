export type ConstructionKind = 'type' | 'drag' | 'draw' | 'layout';
export type ConstructionStage = 'guide' | 'measure' | 'drag' | 'place' | 'type';
export type ConstructionPhase = 'building' | 'complete' | 'static';

export type ConstructionRect = {
  x: number;
  y: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ConstructionTask = {
  rect: ConstructionRect;
  kind: ConstructionKind;
  stage: ConstructionStage;
  index: number;
  progress: number;
  pieceProgress: number;
  offsetX: number;
  offsetY: number;
  typeCaret?: { x: number; y: number; height: number };
};

export type ConstructionFrame = {
  tasks: ConstructionTask[];
  bounds: ConstructionRect;
  complete: boolean;
  progress: number;
  scrollProgress: number;
};

type Options = {
  onFrame: (frame: ConstructionFrame) => void;
  onPhase?: (phase: ConstructionPhase) => void;
  scrollRoot?: HTMLElement | Window;
  startStatic?: boolean;
};

type Line = { x: number; y: number; width: number; height: number; steps: number };
type Piece = {
  node: HTMLElement;
  kind: ConstructionKind;
  index: number;
  layout: ConstructionRect;
  lines: Line[];
  scale: number;
  start: number | null;
  duration: number;
  progress: number;
  inline: { name: string; value: string; priority: string }[];
};

const selector = '[data-construction-piece]';
const properties = ['visibility', 'opacity', 'translate', 'clip-path', 'pointer-events'];
const openingRate = .68;
const scrollingRate = 1.65;
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = (value: number) => 1 - (1 - value) ** 3;

function rect(x: number, y: number, width: number, height: number): ConstructionRect {
  return { x, y, left: x, top: y, width, height };
}

function intersection(a: ConstructionRect, b: ConstructionRect) {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  return rect(x, y, Math.max(0, Math.min(a.x + a.width, b.x + b.width) - x),
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - y));
}

function restore(piece: Piece) {
  for (const { name, value, priority } of piece.inline) {
    if (value) piece.node.style.setProperty(name, value, priority);
    else piece.node.style.removeProperty(name);
  }
  delete piece.node.dataset.constructionState;
}

function pending(piece: Piece) {
  piece.node.style.visibility = 'hidden';
  piece.node.style.pointerEvents = 'none';
  piece.node.dataset.constructionState = 'pending';
}

function measuredLines(node: HTMLElement, bounds: DOMRect, scale: number) {
  const range = document.createRange();
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const fragments: DOMRect[] = [];
  while (walker.nextNode()) {
    range.selectNodeContents(walker.currentNode);
    fragments.push(...Array.from(range.getClientRects()).filter((box) => box.width && box.height));
  }
  fragments.sort((a, b) => a.top - b.top || a.left - b.left);

  const rows: { x: number; y: number; right: number; bottom: number }[] = [];
  for (const box of fragments) {
    const row = rows.at(-1);
    if (row && Math.abs(row.y - box.top) < Math.max(2, box.height * .3)) {
      row.x = Math.min(row.x, box.left);
      row.y = Math.min(row.y, box.top);
      row.right = Math.max(row.right, box.right);
      row.bottom = Math.max(row.bottom, box.bottom);
    } else {
      rows.push({ x: box.left, y: box.top, right: box.right, bottom: box.bottom });
    }
  }
  const glyph = Math.max(4, parseFloat(getComputedStyle(node).fontSize) * scale * .48);
  return rows.map((row) => ({
    x: row.x - bounds.left,
    y: row.y - bounds.top,
    width: row.right - row.x,
    height: row.bottom - row.y,
    steps: Math.max(1, Math.round((row.right - row.x) / glyph)),
  }));
}

function typeReveal(piece: Piece, progress: number, bounds: ConstructionRect) {
  const lines = piece.lines;
  if (!lines.length) {
    return {
      clip: `inset(-8% ${(1 - progress) * 100}% -8% -3%)`,
      caret: { x: bounds.x + bounds.width * progress, y: bounds.y, height: bounds.height },
    };
  }

  let step = Math.floor(progress * lines.reduce((total, line) => total + line.steps, 0));
  let index = 0;
  while (index < lines.length - 1 && step > lines[index].steps) {
    step -= lines[index].steps;
    index++;
  }
  const line = lines[index];
  const x = line.x + line.width * clamp(step / line.steps);
  const top = line.y - 2;
  const bottom = line.y + line.height + 2;
  const xPct = (x / bounds.width) * 100;
  const topPct = (top / bounds.height) * 100;
  const bottomPct = (bottom / bounds.height) * 100;
  return {
    clip: `polygon(-4% -12%, 104% -12%, 104% ${topPct}%, ${xPct}% ${topPct}%, ${xPct}% ${bottomPct}%, -4% ${bottomPct}%)`,
    caret: { x: bounds.x + x, y: bounds.y + line.y, height: line.height },
  };
}

function paintPiece(piece: Piece, bounds: ConstructionRect): ConstructionTask {
  const pieceProgress = piece.progress;
  const { kind, index, node } = piece;
  const placing = pieceProgress >= .84;
  const moving = clamp((pieceProgress - .36) / .48);
  const settling = ease(clamp((pieceProgress - .84) / .16));
  const direction = index % 2 === 0 ? 1 : -1;
  const stage = pieceProgress < .15 ? 'guide' : pieceProgress < .36 ? 'measure' : placing ? 'place' :
    kind === 'type' ? 'type' : kind === 'draw' ? 'measure' : 'drag';
  const progress = stage === 'guide' ? pieceProgress / .15 :
    stage === 'measure' ? (pieceProgress - .15) / (kind === 'draw' ? .69 : .21) :
    stage === 'place' ? (pieceProgress - .84) / .16 : moving;

  let offsetX = 0;
  let offsetY = 0;
  let typeCaret: ConstructionTask['typeCaret'];
  if (pieceProgress >= .36) {
    node.style.visibility = 'visible';
    node.style.opacity = String(.68 + .32 * Math.max(ease(moving), settling));
    if (kind === 'type') {
      const reveal = typeReveal(piece, moving, bounds);
      node.style.clipPath = reveal.clip;
      if (node.hasAttribute('data-construction-title')) {
        offsetY = 18 * (1 - ease(moving));
        node.style.translate = `0 ${offsetY / piece.scale}px`;
      }
      typeCaret = { ...reveal.caret, y: reveal.caret.y + offsetY };
    } else if (kind === 'draw') {
      const remaining = (1 - ease(moving)) * 100;
      node.style.clipPath = `inset(0 ${remaining}% ${remaining * .32}% 0)`;
    } else {
      const slide = (1 - ease(moving));
      const drift = kind === 'drag' ? clamp(bounds.width * .19, 30, 115) : clamp(bounds.width * .08, 14, 46);
      offsetX = direction * (drift * slide - 7 * (1 - slide)) * (1 - settling);
      offsetY = ((kind === 'drag' ? 46 : 25) * slide - 3 * (1 - slide)) * (1 - settling);
      node.style.translate = `${offsetX / piece.scale}px ${offsetY / piece.scale}px`;
    }
  }
  node.dataset.constructionState = 'working';
  return { rect: bounds, kind, stage, progress: clamp(progress), pieceProgress, index, offsetX, offsetY, typeCaret };
}

export function createPortfolioConstruction(root: HTMLElement, options: Options) {
  const scrollRoot = options.scrollRoot ?? window;
  const container = scrollRoot instanceof HTMLElement ? scrollRoot : null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const originalPhase = root.dataset.construction;
  const pieces = new Map<HTMLElement, Piece>();
  let phase: ConstructionPhase | undefined;
  let rootLayout = rect(0, 0, 0, 0);
  let animation = 0;
  let needsLayout = true;
  let hasScrolled = false;
  let timeline = 0;
  let lastFrame: number | null = null;
  let destroyed = false;

  function viewport() {
    const screen = rect(0, 0, document.documentElement.clientWidth, window.innerHeight);
    const box = container?.getBoundingClientRect();
    const frame = container && box
      ? rect(box.left + container.clientLeft, box.top + container.clientTop, container.clientWidth, container.clientHeight)
      : screen;
    const scrollX = container ? container.scrollLeft : window.scrollX;
    const scrollY = container ? container.scrollTop : window.scrollY;
    const maxScroll = container
      ? container.scrollHeight - container.clientHeight
      : (document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight) - window.innerHeight;
    return { frame, visible: intersection(frame, screen), scrollX, scrollY, maxScroll };
  }

  let previousScroll = viewport().scrollY;
  let deepestScroll = previousScroll;

  function setPhase(next: ConstructionPhase) {
    if (phase === next) return;
    phase = next;
    root.dataset.construction = next;
    options.onPhase?.(next);
  }

  function settle(piece: Piece) {
    piece.progress = 1;
    piece.start = null;
    restore(piece);
    piece.node.dataset.constructionState = 'built';
  }

  function layout(view: ReturnType<typeof viewport>) {
    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const present = new Set(targets);
    for (const [node, piece] of pieces) {
      if (!present.has(node)) {
        restore(piece);
        pieces.delete(node);
      } else if (piece.start !== null) {
        const translate = piece.inline.find(({ name }) => name === 'translate');
        if (translate?.value) node.style.setProperty('translate', translate.value, translate.priority);
        else node.style.removeProperty('translate');
      }
    }

    const box = root.getBoundingClientRect();
    rootLayout = rect(box.x - view.frame.x + view.scrollX, box.y - view.frame.y + view.scrollY, box.width, box.height);
    targets.forEach((node, index) => {
      const box = node.getBoundingClientRect();
      const kind = node.dataset.constructionPiece as ConstructionKind;
      const current = pieces.get(node);
      const scale = node.offsetWidth ? box.width / node.offsetWidth : 1;
      const piece: Piece = current || {
        node, kind, index, layout: rect(0, 0, 0, 0), lines: [], scale: 1, start: null, progress: 0, duration: 0,
        inline: properties.map((name) => ({
          name, value: node.style.getPropertyValue(name), priority: node.style.getPropertyPriority(name),
        })),
      };
      piece.kind = kind;
      piece.index = index;
      piece.scale = scale > 0 ? scale : 1;
      piece.layout = rect(box.x - view.frame.x + view.scrollX, box.y - view.frame.y + view.scrollY, box.width, box.height);
      piece.lines = kind === 'type' && box.width && box.height ? measuredLines(node, box, piece.scale) : [];
      piece.duration = kind === 'type'
        ? 1270 + Math.min(610, (node.textContent?.trim().length ?? 0) * 5)
        : kind === 'drag' ? 1420 : 1220;
      pieces.set(node, piece);

      if (phase !== 'building' || !box.width || !box.height) settle(piece);
      else if (!current && view.scrollY > rootLayout.y + 12 && box.bottom <= view.visible.y + 6) settle(piece);
      else if (piece.progress === 0) pending(piece);
    });
  }

  function withinView(layout: ConstructionRect, view: ReturnType<typeof viewport>) {
    return rect(layout.x + view.frame.x - view.scrollX, layout.y + view.frame.y - view.scrollY, layout.width, layout.height);
  }

  function tick(now: number) {
    animation = 0;
    if (destroyed) return;
    // Advance the same timeline at either speed so scrolling never restarts an active piece.
    if (lastFrame !== null) {
      const elapsed = Math.min(64, Math.max(0, now - lastFrame));
      timeline += elapsed * (hasScrolled ? scrollingRate : openingRate);
    }
    const view = viewport();
    if (needsLayout) {
      layout(view);
      needsLayout = false;
    }
    const bounds = intersection(withinView(rootLayout, view), view.visible);
    const inViewport = bounds.width > 0 && bounds.height > 0;
    const tasks: ConstructionTask[] = [];
    let active = false;
    let built = 0;
    let aggregate = 0;
    let batchIndex = 0;
    const atBottom = view.scrollY >= view.maxScroll - 2;

    for (const piece of pieces.values()) {
      const screen = withinView(piece.layout, view);
      if (phase === 'building' && piece.progress < 1) {
        const above = screen.y + screen.height < view.visible.y - 10;
        const visible = screen.y < view.visible.y + view.visible.height - (atBottom ? 0 : 20);
        if (inViewport && above) settle(piece);
        else if (inViewport && visible && piece.start === null) {
          piece.start = timeline + Math.min(batchIndex++, 8) * 72;
        }

        if (piece.start !== null) {
          piece.progress = Math.max(piece.progress, clamp((timeline - piece.start) / piece.duration));
          if (piece.progress >= 1) settle(piece);
          else {
            active = true;
            if (piece.progress > 0) {
              const task = paintPiece(piece, screen);
              if (intersection(screen, bounds).height > 0) tasks.push(task);
            } else pending(piece);
          }
        }
      }
      if (piece.progress === 1) built++;
      aggregate += piece.progress;
    }

    if (phase === 'building' && pieces.size && built === pieces.size) setPhase('complete');
    const scrollDistance = Math.max(1, Math.min(view.maxScroll - rootLayout.y, rootLayout.height - view.frame.height * .65));
    options.onFrame({
      tasks,
      bounds,
      complete: phase === 'complete',
      progress: pieces.size ? aggregate / pieces.size : 1,
      scrollProgress: clamp((deepestScroll - rootLayout.y) / scrollDistance),
    });
    lastFrame = active ? now : null;
    if (active) schedule();
  }

  function schedule() {
    if (!animation && !destroyed) animation = requestAnimationFrame(tick);
  }

  function refresh() {
    needsLayout = true;
    schedule();
  }

  function scroll() {
    const current = container ? container.scrollTop : window.scrollY;
    if (Math.abs(current - previousScroll) > .25) {
      previousScroll = current;
      deepestScroll = Math.max(deepestScroll, current);
      if (phase === 'building') hasScrolled = true;
    }
    schedule();
  }

  function finish() {
    if (destroyed) return;
    setPhase('static');
    for (const piece of pieces.values()) settle(piece);
    schedule();
  }

  function replay() {
    if (destroyed || reduce.matches) return;
    const view = viewport();
    const top = view.scrollY + root.getBoundingClientRect().top - view.frame.y;
    scrollRoot.scrollTo({ top, behavior: 'instant' });
    previousScroll = viewport().scrollY;
    deepestScroll = previousScroll;
    hasScrolled = false;
    timeline = 0;
    lastFrame = null;
    for (const piece of pieces.values()) restore(piece);
    pieces.clear();
    setPhase('building');
    refresh();
  }

  function preferenceChanged() {
    if (reduce.matches) finish();
  }

  function keyboard(event: KeyboardEvent) {
    if (event.key !== 'Tab' || phase !== 'building') return;
    const view = viewport();
    const bounds = intersection(withinView(rootLayout, view), view.visible);
    if (root.contains(document.activeElement) || bounds.height > 0) finish();
  }

  function focus(event: FocusEvent) {
    if (phase === 'building' && event.target instanceof Element && event.target.closest(selector)) finish();
  }

  const resize = new ResizeObserver(refresh);
  resize.observe(root);
  if (container) resize.observe(container);
  const mutations = new MutationObserver(refresh);
  mutations.observe(root, { childList: true, characterData: true, attributes: true, subtree: true, attributeFilter: ['data-construction-piece'] });
  document.fonts.ready.then(refresh);
  scrollRoot.addEventListener('scroll', scroll, { passive: true });
  if (container) window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh);
  window.addEventListener('keydown', keyboard, true);
  root.addEventListener('focusin', focus);
  reduce.addEventListener('change', preferenceChanged);
  setPhase(reduce.matches || options.startStatic ? 'static' : 'building');
  tick(performance.now());

  return {
    finish,
    replay,
    refresh,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(animation);
      resize.disconnect();
      mutations.disconnect();
      scrollRoot.removeEventListener('scroll', scroll);
      if (container) window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('keydown', keyboard, true);
      root.removeEventListener('focusin', focus);
      reduce.removeEventListener('change', preferenceChanged);
      for (const piece of pieces.values()) restore(piece);
      if (originalPhase === undefined) delete root.dataset.construction;
      else root.dataset.construction = originalPhase;
    },
  };
}
