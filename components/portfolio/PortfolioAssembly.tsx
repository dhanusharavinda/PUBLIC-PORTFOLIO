'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import styles from './editorial.module.css';

const motionQuery = '(prefers-reduced-motion: no-preference)';
const ease = 'cubic-bezier(.2,.72,.22,1)';
type Scene = 'identity' | 'work';

function animationTarget(section: Element) {
  return section.querySelector('[data-assembly-trigger]') || section;
}

export function usePortfolioAssembly(root: RefObject<HTMLElement | null>) {
  const [runs, setRuns] = useState({ identity: 0, work: 0 });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const playing = useRef<Record<Scene, Animation[]>>({ identity: [], work: [] });

  const play = useCallback((section: Element, scene: Scene) => {
    if (!window.matchMedia(motionQuery).matches) return;

    playing.current[scene].forEach((animation) => animation.cancel());
    playing.current[scene] = Array.from(section.querySelectorAll('[data-assembly-piece]'))
      .slice(0, 3)
      .map((piece, index) => {
        const type = piece.getAttribute('data-assembly-piece') === 'type';
        const frames = type
          ? [{ clipPath: 'inset(-14% 78% -18% -6%)' }, { clipPath: 'inset(-14% -6% -18% -6%)' }]
          : [
              { transform: index % 2 === 0 ? 'translateY(15px)' : 'translate(12px, 16px)', opacity: .7 },
              { transform: 'none', opacity: 1 },
            ];
        return piece.animate(frames, { duration: type ? 720 : 630, delay: index * 105, easing: ease, fill: 'backwards' });
      });
    setRuns((current) => ({ ...current, [scene]: current[scene] + 1 }));
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia(motionQuery);

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !preference.matches) continue;
        observer.unobserve(entry.target);
        const section = entry.target.closest('[data-assembly-scene]');
        const scene = section?.getAttribute('data-assembly-scene');
        if (section && (scene === 'identity' || scene === 'work')) play(section, scene);
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    observerRef.current = observer;

    function watch() {
      observer.disconnect();
      if (preference.matches) {
        element?.querySelectorAll('[data-assembly-scene]').forEach((section) => observer.observe(animationTarget(section)));
      } else {
        Object.values(playing.current).flat().forEach((animation) => animation.cancel());
      }
    }

    // A draft can gain its work section while the editor stays mounted.
    const content = new MutationObserver((changes) => {
      if (!preference.matches) return;
      for (const change of changes) {
        for (const node of change.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('[data-assembly-trigger]')) observer.observe(node);
          if (node.matches('[data-assembly-scene]')) observer.observe(animationTarget(node));
        }
      }
    });
    content.observe(element, { childList: true, subtree: true });
    watch();
    preference.addEventListener('change', watch);
    const animations = playing.current;

    return () => {
      observer.disconnect();
      content.disconnect();
      observerRef.current = null;
      preference.removeEventListener('change', watch);
      Object.values(animations).flat().forEach((animation) => animation.cancel());
    };
  }, [play, root]);

  function replay() {
    const identity = root.current?.querySelector('[data-assembly-scene="identity"]');
    const work = root.current?.querySelector('[data-assembly-scene="work"]');
    if (identity) {
      observerRef.current?.unobserve(identity);
      identity.scrollIntoView({ block: 'start', behavior: 'auto' });
      play(identity, 'identity');
    }
    if (work) observerRef.current?.observe(animationTarget(work));
  }

  return { runs, replay };
}

export function AssemblyCursor({ role }: { role: 'Type' | 'Images' | 'Layout' }) {
  return (
    <span className={styles.assemblyMark} data-cursor={role} aria-hidden="true">
      <span className={styles.assemblyOutline} />
      <span className={styles.assemblyCursor}>
        <svg viewBox="0 0 21 24" width="21" height="24">
          <path d="M2 2v17l5.2-4.4 3.2 6.5 3.4-1.6-3.3-6.4H18L2 2Z" fill="currentColor" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
        <span>{role}</span>
      </span>
    </span>
  );
}
