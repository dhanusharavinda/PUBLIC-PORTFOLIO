'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Plus, RotateCcw, Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { normalizeSectionVisibility } from '@/types/portfolio';
import type { PortfolioWithProjects, Project } from '@/types/portfolio';
import { CopyEmailButton } from './CopyEmailButton';
import { ViewCounter } from './ViewCounter';
import { AssemblyCursor, usePortfolioAssembly } from './PortfolioAssembly';
import styles from './editorial.module.css';

export type EditorialProject = Project & {
  coverAlt?: string;
  coverTitle?: string;
  photoCredit?: { name: string; href: string };
};

type PortfolioMode = 'published' | 'preview' | 'example';

function httpUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : undefined;
  } catch {
    return undefined;
  }
}

function imageUrl(value?: string) {
  if (value?.startsWith('blob:') || (value?.startsWith('/') && !value.startsWith('//'))) return value;
  return httpUrl(value);
}

function optimizedImage(src: string) {
  if (!src.startsWith('https://')) return false;
  const url = new URL(src);
  return url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/v1/object/public/');
}

function PortfolioImage({ src, alt, eager = false, sizes }: {
  src: string; alt: string; eager?: boolean; sizes: string;
}) {
  return <Image src={src} alt={alt} fill unoptimized={!optimizedImage(src)} loading={eager ? 'eager' : 'lazy'} sizes={sizes} />;
}

function ProjectCover({ project, eager = false, decorative = false }: {
  project: EditorialProject; eager?: boolean; decorative?: boolean;
}) {
  const cover = imageUrl(project.cover_image_url);
  return (
    <span className={styles.projectCover} data-has-image={Boolean(cover)} aria-hidden={decorative || undefined}>
      {cover ? <PortfolioImage src={cover} alt={decorative ? '' : project.coverAlt || ''} eager={eager} sizes="(max-width: 700px) 100vw, 52vw" /> : null}
      {(!cover || project.coverTitle) && <span className={styles.coverTitle}>{project.coverTitle || project.name}</span>}
    </span>
  );
}

function ProjectEntry({ project, cursor, run }: {
  project: EditorialProject; cursor?: 'Images' | 'Layout'; run: number;
}) {
  const cover = imageUrl(project.cover_image_url);
  const images = [...new Set((project.carousel_images || []).map(imageUrl).filter((url): url is string => Boolean(url) && url !== cover))];
  const source = httpUrl(project.github_url);
  const demo = httpUrl(project.demo_url);

  return (
    <article className={styles.project} data-assembly-piece={cursor ? '' : undefined}>
      <details className={styles.projectDetails}>
        <summary aria-label={project.name}>
          <ProjectCover project={project} decorative />
          <span className={styles.projectCaption}>
            <span>
              <span className={styles.projectName}>{project.name}</span>
              {project.label && <span className={styles.projectLabel}>{project.label}</span>}
            </span>
            <Plus size={20} aria-hidden="true" />
          </span>
        </summary>
        <div className={styles.projectBody}>
          {project.description && <p>{project.description}</p>}
          {project.impact_stat && <p className={styles.impact}>{project.impact_stat}</p>}
          {project.tech_stack?.length > 0 && <ul className={styles.tags} aria-label="Project tools">
            {project.tech_stack.map((tech, index) => <li key={index}>{tech}</li>)}
          </ul>}
          {(cover || source || demo || project.photoCredit) && <div className={styles.links}>
            {source && <a href={source}>GitHub <ArrowUpRight size={15} aria-hidden="true" /></a>}
            {demo && <a href={demo}>Live demo <ArrowUpRight size={15} aria-hidden="true" /></a>}
            {cover && <a href={cover}>Open cover image <ArrowUpRight size={15} aria-hidden="true" /></a>}
            {project.photoCredit && <a href={project.photoCredit.href}>Photo by {project.photoCredit.name}</a>}
          </div>}
          {images.length > 0 && <ul className={styles.gallery} aria-label="Additional project images">
            {images.map((src, index) => <li key={src}>
              <a href={src} aria-label={`Open image ${index + 2} for ${project.name}`}>
                <PortfolioImage src={src} alt={`${project.name}, image ${index + 2}`} sizes="(max-width: 700px) 90vw, 340px" />
              </a>
            </li>)}
          </ul>}
          {!project.description && !project.impact_stat && !project.tech_stack?.length && !cover && !source && !demo && !project.photoCredit && !images.length && <p>Details will be added here.</p>}
        </div>
      </details>
      {cursor && run > 0 && <AssemblyCursor key={run} role={cursor} />}
    </article>
  );
}

export function EditorialPortfolio({ portfolio, mode = 'published' }: {
  portfolio: PortfolioWithProjects & { projects: EditorialProject[] };
  mode?: PortfolioMode;
}) {
  const root = useRef<HTMLElement>(null);
  const { runs, replay } = usePortfolioAssembly(root);
  const { canEditPortfolio } = useAuth();
  const [label, setLabel] = useState<string | null>(null);
  const visibility = normalizeSectionVisibility(portfolio.section_visibility);
  const preview = mode === 'preview';
  const published = mode === 'published';
  const dark = ['professional', 'pastel'].includes(portfolio.template);
  const sectionId = (section: string) => published ? section : `${mode}-${section}`;
  const Heading = published ? 'h1' : 'h2';
  const SectionHeading = published ? 'h2' : 'h3';
  const projects = (portfolio.projects || [])
    .map((project) => project.name?.trim() ? project : { ...project, name: 'Untitled project' })
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const experiences = [...(portfolio.experiences || [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const labels = [...new Set(projects.map((project) => project.label?.trim()).filter((value): value is string => Boolean(value)))];
  const selectedLabel = label && labels.includes(label) ? label : null;
  const filtered = selectedLabel ? projects.filter((project) => project.label?.trim() === selectedLabel) : projects;
  const feature = projects.find((project) => project.is_featured) || projects[0];
  const ordered = filtered.includes(feature) ? [feature, ...filtered.filter((project) => project !== feature)] : filtered;
  const showWork = visibility.projects && (projects.length > 0 || preview);
  const showAbout = visibility.about && Boolean(portfolio.bio);
  const showSkills = visibility.skills && Boolean(portfolio.skills?.length);
  const showExperience = visibility.experience && experiences.length > 0;
  const linkedin = httpUrl(portfolio.linkedin_url);
  const github = portfolio.github_username ? `https://github.com/${encodeURIComponent(portfolio.github_username)}` : undefined;
  const resume = preview ? imageUrl(portfolio.resume_url) : httpUrl(portfolio.resume_url);
  const email = visibility.contact && portfolio.email ? portfolio.email.trim() : '';
  const showContact = visibility.contact && Boolean(email || linkedin || github);
  const showNavigation = showWork || showAbout || showExperience || showContact;
  const portrait = imageUrl(portfolio.profile_photo_url);
  const name = portfolio.full_name || 'Your name';
  const availability = portfolio.availability_status === 'freelance' ? 'Open for freelance work' : 'Open to work';
  const heroFeature = showWork ? feature : undefined;

  async function share() {
    try {
      const url = new URL(window.location.pathname, window.location.origin).href;
      await navigator.clipboard.writeText(url);
      toast.success('Portfolio link copied');
    } catch {
      toast.error('Could not copy the link. You can copy it from the address bar.');
    }
  }

  return (
    <article ref={root} className={styles.portfolio} data-portfolio-theme={dark ? 'ink' : 'paper'} data-portfolio-mode={mode} aria-labelledby={sectionId('portfolio-name')}>
      <header className={styles.header}>
        <span className={styles.handle}>{mode === 'example' ? 'Sample portfolio' : `@${portfolio.username || 'your-name'}`}</span>
        {showNavigation && <nav className={styles.navigation} aria-label="Portfolio sections">
          {showWork && <a href={`#${sectionId('projects')}`}>Work</a>}
          {showAbout && <a href={`#${sectionId('about')}`}>About</a>}
          {showExperience && <a href={`#${sectionId('experience')}`}>Experience</a>}
          {showContact && <a href={`#${sectionId('contact')}`}>Contact</a>}
        </nav>}
        {published && <button type="button" className={styles.utility} onClick={share}>
          <Share2 size={15} aria-hidden="true" /> Share
        </button>}
      </header>

      <section className={styles.hero} data-assembly-scene="identity" data-has-feature={Boolean(heroFeature)}>
        <div className={styles.heroInner}>
          <div className={styles.identity}>
            <div className={styles.name}>
              <Heading id={sectionId('portfolio-name')} data-assembly-piece="type">{name}</Heading>
              {runs.identity > 0 && <AssemblyCursor key={runs.identity} role="Type" />}
            </div>
            <div className={styles.identityDetails} data-assembly-piece>
              {portrait && <span className={styles.portrait}>
                <PortfolioImage src={portrait} alt={`Portrait of ${name}`} eager sizes="80px" />
              </span>}
              <div>
                {portfolio.job_title && <p className={styles.role}>{portfolio.job_title}</p>}
                {portfolio.tagline && <p className={styles.tagline}>{portfolio.tagline}</p>}
                {(portfolio.location || portfolio.open_to_work) && <p className={styles.meta}>
                  {portfolio.location && <span>{portfolio.location}</span>}
                  {portfolio.open_to_work && <span className={styles.availability}>{availability}</span>}
                </p>}
              </div>
              {runs.identity > 0 && (portfolio.job_title || portfolio.tagline || portfolio.location || portfolio.open_to_work || portrait) && (
                <AssemblyCursor key={runs.identity} role="Layout" />
              )}
            </div>
            <div className={styles.heroActions}>
              {showWork && <a className={styles.action} href={`#${sectionId('projects')}`}>View work <ArrowDown size={17} aria-hidden="true" /></a>}
              {resume && <a href={resume}>Résumé <ArrowUpRight size={15} aria-hidden="true" /></a>}
              {showContact && !showWork && <a href={`#${sectionId('contact')}`}>Get in touch <ArrowDown size={15} aria-hidden="true" /></a>}
            </div>
          </div>

          {heroFeature && <div className={styles.heroFeature} data-assembly-piece>
            <a href={`#${sectionId('projects')}`} aria-label={`View work, including ${heroFeature.name}`}>
              <ProjectCover project={heroFeature} eager />
              <span className={styles.heroCaption}>
                <span>{heroFeature.name}</span><ArrowDown size={16} aria-hidden="true" />
              </span>
            </a>
            {runs.identity > 0 && <AssemblyCursor key={runs.identity} role="Images" />}
          </div>}
        </div>
        {!preview && <button type="button" className={styles.replay} disabled={runs.identity === 0} onClick={replay}>
          <RotateCcw size={14} aria-hidden="true" /> Replay assembly
        </button>}
      </section>

      {showWork && <section className={styles.work} id={sectionId('projects')} data-assembly-scene="work">
        <div className={styles.inner}>
          <div className={styles.sectionTitle}>
            <SectionHeading>Selected work</SectionHeading>
            {ordered.length > 0 && <span>{ordered.length} {ordered.length === 1 ? 'project' : 'projects'}</span>}
          </div>
          {labels.length > 0 && <div className={styles.filters} aria-label="Filter projects" role="group">
            <button type="button" onClick={() => setLabel(null)} aria-pressed={selectedLabel === null}>All</button>
            {labels.map((item) => <button type="button" key={item} onClick={() => setLabel(item)} aria-pressed={item === selectedLabel}>{item}</button>)}
          </div>}
          {ordered.length > 0 ? <div className={styles.projects} data-project-count={ordered.length} data-assembly-trigger>
            {ordered.map((project, index) => <ProjectEntry
              key={project.id || `${project.order_index}-${index}`}
              project={project}
              cursor={index === 0 ? 'Images' : index === 1 ? 'Layout' : undefined}
              run={runs.work}
            />)}
          </div> : <p className={styles.empty}>Your projects will appear here as you add them.</p>}
        </div>
      </section>}

      {(showAbout || showSkills || showExperience) && <div className={styles.inner}>
        {showAbout && <section className={styles.textSection} id={sectionId('about')}>
          <SectionHeading>About</SectionHeading>
          <p className={styles.prose}>{portfolio.bio}</p>
        </section>}
        {showSkills && <section className={styles.textSection} id={sectionId('skills')}>
          <SectionHeading>Skills</SectionHeading>
          <ul className={styles.tags}>
            {portfolio.skills.map((skill, index) => <li key={index}>{skill.name}</li>)}
          </ul>
        </section>}
        {showExperience && <section className={styles.textSection} id={sectionId('experience')}>
          <SectionHeading>Experience</SectionHeading>
          <ol className={styles.experience}>
            {experiences.map((experience, index) => {
              const dates = [experience.start_date, experience.is_current ? 'Present' : experience.end_date].filter(Boolean).join(' to ');
              return <li key={experience.id || index}>
                <p className={styles.dates}>{[dates, experience.location].filter(Boolean).join(' · ')}</p>
                <p className={styles.position}>{[experience.role, experience.company].filter(Boolean).join(' at ')}</p>
                {experience.description && <p className={styles.prose}>{experience.description}</p>}
              </li>;
            })}
          </ol>
        </section>}
      </div>}

      {showContact && <section className={styles.contact} id={sectionId('contact')}>
        <div className={styles.inner}>
          <SectionHeading>Get in touch</SectionHeading>
          <div className={styles.links}>
            {email && <a href={`mailto:${email}`}>{email} <ArrowUpRight size={17} aria-hidden="true" /></a>}
            {published && email && <CopyEmailButton email={email} variant="minimal" className={styles.utility} />}
            {linkedin && <a href={linkedin}>LinkedIn <ArrowUpRight size={17} aria-hidden="true" /></a>}
            {github && <a href={github}>GitHub <ArrowUpRight size={17} aria-hidden="true" /></a>}
          </div>
        </div>
      </section>}

      {published && <footer className={styles.footer}>
        <Link href="/">Built with Portlyfolio</Link>
        <ViewCounter username={portfolio.username} initialCount={portfolio.view_count || 0} className={styles.views} />
        {canEditPortfolio(portfolio.email) && <Link href={`/?edit=${encodeURIComponent(portfolio.username)}`}>Edit portfolio</Link>}
      </footer>}
    </article>
  );
}
