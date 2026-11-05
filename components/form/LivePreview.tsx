'use client';

import { EditorialPortfolio } from '@/components/portfolio/EditorialPortfolio';
import type { PortfolioWithProjects } from '@/types/portfolio';
import { Laptop, RotateCcw, Smartphone, Tablet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from './FormContext';
import styles from './live-preview.module.css';

const devices = [
  { name: 'Desktop', width: 1120, Icon: Laptop },
  { name: 'Tablet', width: 768, Icon: Tablet },
  { name: 'Phone', width: 390, Icon: Smartphone },
] as const;

export function LivePreview({ publishedUsername }: { publishedUsername: string | null }) {
  const { formData } = useFormContext();
  const [device, setDevice] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [previewRun, setPreviewRun] = useState(0);
  const [fileUrls, setFileUrls] = useState(new Map<File, string>());
  const viewport = useRef<HTMLDivElement>(null);
  const objectUrls = useRef(new Map<File, string>());
  const { profile_photo, projects, resume } = formData;

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const files = [profile_photo, resume, ...projects.flatMap((project) => [project.cover_image, ...project.carousel_images])];
    const activeFiles = new Set(files.filter((file): file is File => Boolean(file)));
    const urls = objectUrls.current;
    for (const [file, url] of urls) {
      if (activeFiles.has(file)) continue;
      URL.revokeObjectURL(url);
      urls.delete(file);
    }
    for (const file of activeFiles) {
      if (!urls.has(file)) urls.set(file, URL.createObjectURL(file));
    }
    const frame = requestAnimationFrame(() => setFileUrls(new Map(urls)));
    return () => cancelAnimationFrame(frame);
  }, [profile_photo, projects, resume]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  function previewUrl(file: File | null | undefined, savedUrl = '') {
    return (file && fileUrls.get(file)) || savedUrl;
  }

  const previewData: PortfolioWithProjects = {
    ...formData,
    username: publishedUsername || formData.username || 'your-name',
    profile_photo_url: previewUrl(formData.profile_photo, formData.profile_photo_url),
    resume_url: previewUrl(formData.resume, formData.resume_url),
    view_count: 0,
    experiences: formData.experiences
      .filter((experience) => experience.company.trim() || experience.role.trim() || experience.description.trim())
      .map((experience, index) => ({ ...experience, order_index: index })),
    projects: formData.projects
      .filter((project) => project.name.trim() || project.description.trim() || project.cover_image || project.cover_image_url)
      .map((project, index) => ({
        ...project,
        name: project.name || 'Untitled project',
        cover_image_url: previewUrl(project.cover_image, project.cover_image_url),
        carousel_images: Array.from(
          { length: Math.max(project.carousel_images.length, project.carousel_image_urls.length) },
          (_, slot) => previewUrl(project.carousel_images[slot], project.carousel_image_urls[slot]),
        ).filter(Boolean),
        order_index: index,
      })),
  };

  const frameWidth = devices[device].width;
  const zoom = viewportWidth ? Math.min(1, viewportWidth / frameWidth) : 0.25;

  function replay() {
    viewport.current?.scrollTo({ top: 0 });
    setPreviewRun((run) => run + 1);
  }

  return (
    <aside id="live-portfolio-preview" className={styles.preview} aria-label="Live portfolio preview">
      <div className={styles.toolbar}>
        <span>Live preview</span>
        <div className={styles.tools}>
          <button type="button" className={styles.replay} onClick={replay}>
            <RotateCcw size={15} aria-hidden="true" /> Replay
          </button>
          <div className={styles.devices} role="group" aria-label="Preview size">
            {devices.map(({ name, Icon }, index) => (
              <button key={name} type="button" aria-label={name} title={name} aria-pressed={index === device} onClick={() => setDevice(index)}>
                <Icon size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={viewport} className={styles.viewport} tabIndex={0} role="region" aria-label="Scrollable portfolio preview">
        <div className={styles.frame} style={{ width: frameWidth, zoom }}>
          <EditorialPortfolio key={previewRun} portfolio={previewData} mode="preview" />
        </div>
      </div>
      <p className={styles.caption}>This is how your published page will look.</p>
    </aside>
  );
}
