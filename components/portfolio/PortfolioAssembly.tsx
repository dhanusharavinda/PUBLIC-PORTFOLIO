'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { createPortfolioConstruction } from './portfolio-construction';
import type { ConstructionFrame } from './portfolio-construction';
import { createPortfolioSwarmCanvas } from './portfolio-swarm-canvas';

type Phase = 'unavailable' | 'building' | 'complete' | 'static';

export function usePortfolioAssembly(
  root: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  previewScroll?: RefObject<HTMLDivElement | null>,
) {
  const [phase, setPhase] = useState<Phase>('unavailable');
  const [cursorsHidden, setCursorsHidden] = useState(false);
  const controls = useRef<{ finish(): void; replay(): void; toggleCursors(): void } | null>(null);

  useEffect(() => {
    const article = root.current;
    const canvas = canvasRef.current;
    if (!article || !canvas) return;

    const scrollRoot = previewScroll?.current ?? window;
    const preference = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const renderer = createPortfolioSwarmCanvas(canvas);
    let construction: ReturnType<typeof createPortfolioConstruction> | null = null;
    let snapshot: ConstructionFrame | null = null;
    let activePhase: Phase = 'unavailable';
    let pointer: { x: number; y: number } | null = null;
    let muted = false;
    let renderFrame = 0;

    function queueRender() {
      if (!renderFrame) renderFrame = window.requestAnimationFrame(render);
    }

    function render(now: number) {
      renderFrame = 0;
      if (!snapshot || muted || activePhase === 'unavailable' || activePhase === 'static') {
        renderer.clear();
        return;
      }

      const { bounds, tasks } = snapshot;
      const bar = article?.querySelector('[data-construction-controls]');
      const top = Math.max(bounds.y, bar?.getBoundingClientRect().bottom ?? bounds.y);
      const keepMoving = renderer.render({
        mode: activePhase === 'building' ? 'building' : 'complete',
        tasks,
        pointer,
        bounds: { x: bounds.x, y: top, width: bounds.width, height: Math.max(0, bounds.y + bounds.height - top) },
      }, now);
      if (keepMoving && activePhase === 'complete') queueRender();
    }

    function updatePointer(event: PointerEvent) {
      if (event.pointerType === 'touch' && !event.isPrimary) return;
      pointer = { x: event.clientX, y: event.clientY };
      queueRender();
    }

    function leave() {
      pointer = null;
      queueRender();
    }

    function configure() {
      construction?.destroy();
      construction = null;
      snapshot = null;
      activePhase = 'unavailable';
      muted = false;
      renderer.clear();
      setCursorsHidden(false);

      if (!preference.matches || !article) {
        setPhase('unavailable');
        return;
      }

      construction = createPortfolioConstruction(article, {
        scrollRoot,
        onFrame(frame) {
          snapshot = frame;
          queueRender();
        },
        onPhase(next) {
          activePhase = next;
          setPhase(next);
          queueRender();
        },
      });
    }

    controls.current = {
      finish() {
        construction?.finish();
      },
      replay() {
        muted = false;
        setCursorsHidden(false);
        renderer.clear();
        construction?.replay();
      },
      toggleCursors() {
        muted = !muted;
        setCursorsHidden(muted);
        queueRender();
      },
    };

    const setupFrame = window.requestAnimationFrame(configure);
    preference.addEventListener('change', configure);
    article.addEventListener('pointermove', updatePointer, { passive: true });
    article.addEventListener('pointerdown', updatePointer, { passive: true });
    article.addEventListener('pointerleave', leave);
    article.addEventListener('pointercancel', leave);

    return () => {
      window.cancelAnimationFrame(setupFrame);
      window.cancelAnimationFrame(renderFrame);
      preference.removeEventListener('change', configure);
      article.removeEventListener('pointermove', updatePointer);
      article.removeEventListener('pointerdown', updatePointer);
      article.removeEventListener('pointerleave', leave);
      article.removeEventListener('pointercancel', leave);
      construction?.destroy();
      renderer.clear();
      controls.current = null;
    };
  }, [root, canvasRef, previewScroll]);

  return {
    phase,
    cursorsHidden,
    skip: () => controls.current?.finish(),
    replay: () => controls.current?.replay(),
    toggleCursors: () => controls.current?.toggleCursors(),
  };
}
