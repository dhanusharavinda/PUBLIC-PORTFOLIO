import Image from 'next/image';
import { sampleProjects } from './sample';
import styles from './landing.module.css';

type Project = (typeof sampleProjects)[number];

export function ProjectCover({ project, preview = false }: { project: Project; preview?: boolean }) {
  return (
    <div className={styles.cover} data-project={project.id}>
      <Image
        src={project.image}
        alt={preview ? '' : project.alt}
        fill
        unoptimized
        loading={preview ? 'eager' : 'lazy'}
      />
      <div className={styles.coverType} aria-hidden="true">
        {project.id === 'high-water' ? <span>HIGH<br />WATER</span> : <span>{project.name}</span>}
      </div>
    </div>
  );
}
