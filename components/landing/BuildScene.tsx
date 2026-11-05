'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProjectCover } from './ProjectCover';
import { sampleCreator, sampleProjects } from './sample';
import styles from './landing.module.css';

const stages = [
  { anchor: '#identity', label: 'Identity', status: 'Setting the type' },
  { anchor: '#work', label: 'Work', status: 'Placing the projects' },
  { anchor: '#publish', label: 'Publish', status: 'Ready to share' },
] as const;

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function Cursor({ role }: { role: 'Type' | 'Images' | 'Layout' }) {
  return (
    <span className={styles.cursor} data-cursor={role}>
      <svg viewBox="0 0 21 24" width="21" height="24">
        <path d="M2 2v17l5.2-4.4 3.2 6.5 3.4-1.6-3.3-6.4H18L2 2Z" fill="currentColor" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <span>{role}</span>
    </span>
  );
}

export function BuildScene() {
  const scene = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const isInteractive = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);

  useEffect(() => {
    const story = scene.current?.closest('[data-build-story]');
    if (!story) return;

    const work = story.querySelector('#work');
    const publish = story.querySelector('#publish');
    if (!work || !publish) return;

    const desktopMotion = window.matchMedia('(min-width: 61rem) and (min-height: 35rem) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let previousStage = 0;

    function updateStage() {
      frame = 0;
      if (!desktopMotion.matches || !work || !publish) return;

      const readingLine = window.innerHeight * 0.6;
      const nextStage = publish.getBoundingClientRect().top <= readingLine
        ? 2
        : work.getBoundingClientRect().top <= readingLine ? 1 : 0;

      if (nextStage !== previousStage) {
        previousStage = nextStage;
        setActiveStage(nextStage);
      }
    }

    function scheduleUpdate() {
      if (!frame && desktopMotion.matches) frame = window.requestAnimationFrame(updateStage);
    }

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    desktopMotion.addEventListener('change', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      desktopMotion.removeEventListener('change', scheduleUpdate);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function chooseStage(stage: number) {
    setActiveStage(stage);
    setAnnouncement(stages[stage].status);
  }

  return (
    <div className={styles.scene} ref={scene} data-stage={activeStage} data-ui>
      <div className={styles.sceneHeader}>
        <span>Portfolio in progress</span>
        <span>{stages[activeStage].status}</span>
      </div>

      <div className={styles.board} aria-hidden="true">
        <div className={styles.artboard}>
          <div className={styles.artboardHeader}>
            <span>nora-chen / portfolio</span>
            <span>2026</span>
          </div>

          <div className={styles.artboardIdentity}>
            <span className={styles.artboardName}>{sampleCreator.name}</span>
            <span className={styles.artboardRole}>{sampleCreator.role}</span>
          </div>

          <div className={styles.artboardWork}>
            <ProjectCover project={sampleProjects[0]} preview />
            <div className={styles.artboardStack}>
              {sampleProjects.slice(1).map((project) => (
                <ProjectCover key={project.id} project={project} preview />
              ))}
            </div>
          </div>

          <div className={styles.artboardFooter}>
            <span>Selected work / {activeStage === 0 ? '01' : '01–03'}</span>
            <ArrowUpRight size={13} />
          </div>
        </div>

        <div className={styles.selection} />
        <div className={styles.layoutGuide} />
        <Cursor role="Type" />
        <Cursor role="Images" />
        <Cursor role="Layout" />
      </div>

      <div className={styles.stageControls} role="group" aria-label="Portfolio assembly steps">
        {stages.map((stage, index) => {
          const label = <><span aria-hidden="true">0{index + 1}</span>{stage.label}</>;

          return isInteractive ? (
            <button
              key={stage.anchor}
              type="button"
              onClick={() => chooseStage(index)}
              aria-pressed={activeStage === index}
            >
              {label}
            </button>
          ) : (
            <a key={stage.anchor} href={stage.anchor}>
              {label}
            </a>
          );
        })}
      </div>
      <span className="sr-only" role="status">{announcement}</span>
    </div>
  );
}
