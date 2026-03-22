'use client';

import { PortfolioWithProjects } from '@/types/portfolio';
import { CopyEmailButton } from '@/components/portfolio/CopyEmailButton';
import { ViewCounter } from '@/components/portfolio/ViewCounter';
import { ProjectModal } from '@/components/portfolio/ProjectModal';
import { cn, formatDate, truncate } from '@/lib/utils';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Linkedin, Github, FileText, MapPin, Eye, Mail, Share2, ArrowUpRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface PastelTemplateProps {
  portfolio: PortfolioWithProjects;
  isPreview?: boolean;
}

export function PastelTemplate({ portfolio, isPreview = false }: PastelTemplateProps) {
  const { canEditPortfolio } = useAuth();
  const [selectedProject, setSelectedProject] = useState(portfolio.projects[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [navActive, setNavActive] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  // Sorted data
  const sortedExperiences = useMemo(
    () => [...(portfolio.experiences || [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [portfolio.experiences]
  );
  const sortedProjects = useMemo(
    () => [...(portfolio.projects || [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [portfolio.projects]
  );

  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const projectLabels = useMemo(() => {
    const labels = new Set<string>();
    sortedProjects.forEach((p) => { if (p.label?.trim()) labels.add(p.label.trim()); });
    return Array.from(labels);
  }, [sortedProjects]);
  const hasLabels = projectLabels.length > 0;
  const filteredProjects = useMemo(() => {
    if (activeLabel === null) return hasLabels ? sortedProjects.filter((p) => !p.label?.trim()) : sortedProjects;
    if (activeLabel === '__all__') return sortedProjects;
    return sortedProjects.filter((p) => p.label?.trim() === activeLabel);
  }, [sortedProjects, activeLabel, hasLabels]);
  const featuredProject = filteredProjects.find((p) => p.is_featured) || filteredProjects[0] || null;
  const otherProjects = filteredProjects.filter((p) => p.id !== featuredProject?.id);

  // Skills grouped by category
  const skillGroups = useMemo(() => {
    return portfolio.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);
  }, [portfolio.skills]);

  // GSAP + Lenis initialization
  useEffect(() => {
    if (isPreview || animatedRef.current) return;
    animatedRef.current = true;

    let lenisInstance: any = null;
    let rafId: number;

    const init = async () => {
      try {
        const [gsapModule, LenisModule] = await Promise.all([
          import('gsap'),
          import('lenis') as Promise<any>,
        ]);
        const gsap = gsapModule.default || gsapModule.gsap;
        const Lenis = LenisModule.default;

        // Lenis smooth scroll
        lenisInstance = new Lenis({
          duration: 1.1,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        function raf(time: number) {
          lenisInstance?.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        // GSAP entrance animations — lightweight, one-shot
        const container = containerRef.current;
        if (!container || !gsap) return;

        // Hero reveal
        gsap.from(container.querySelectorAll('[data-anim="hero"]'), {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.15,
        });

        // Section reveals on scroll — using IntersectionObserver (no ScrollTrigger = lighter)
        const sections = container.querySelectorAll('[data-anim="section"]');
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                gsap.from(entry.target, {
                  y: 30,
                  opacity: 0,
                  duration: 0.6,
                  ease: 'power2.out',
                });
                // Stagger children
                const children = entry.target.querySelectorAll('[data-anim="item"]');
                if (children.length > 0) {
                  gsap.from(children, {
                    y: 20,
                    opacity: 0,
                    duration: 0.45,
                    stagger: 0.06,
                    ease: 'power2.out',
                    delay: 0.15,
                  });
                }
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );
        sections.forEach((s) => observer.observe(s));
      } catch {
        // GSAP/Lenis not available — graceful fallback, page still works
      }
    };

    init();

    return () => {
      if (lenisInstance) lenisInstance.destroy();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPreview]);

  // Nav scroll tracking
  useEffect(() => {
    if (isPreview) return;
    const handleScroll = () => {
      const sections = ['about', 'skills', 'experience', 'projects', 'contact'];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 200) {
          setNavActive(id);
          return;
        }
      }
      setNavActive('');
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPreview]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Portfolio link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const navItems = ['About', 'Skills', ...(sortedExperiences.length > 0 ? ['Experience'] : []), 'Projects', 'Contact'];

  const categoryAccents: Record<string, string> = {
    Languages: 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300',
    Tools: 'border-sky-400/30 bg-sky-400/5 text-sky-300',
    Frameworks: 'border-violet-400/30 bg-violet-400/5 text-violet-300',
    'Soft Skills': 'border-rose-400/30 bg-rose-400/5 text-rose-300',
    Other: 'border-amber-400/30 bg-amber-400/5 text-amber-300',
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0B0F14] text-[#C8CCD4] selection:bg-teal-500/30 selection:text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ━━ Navigation ━━ */}
      <nav className="sticky top-0 z-50 bg-[#0B0F14]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-[#5EEAD4] text-xs font-bold tracking-widest uppercase hover:opacity-70 transition-opacity">
            portlyfolio
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const id = item.toLowerCase();
              return (
                <button
                  key={item}
                  onClick={() => scrollTo(id)}
                  className={cn(
                    'px-3 py-1.5 rounded text-xs font-medium transition-all',
                    navActive === id
                      ? 'text-[#5EEAD4] bg-[#5EEAD4]/10'
                      : 'text-[#5A6170] hover:text-[#C8CCD4]'
                  )}
                >
                  {item}
                </button>
              );
            })}
            <button
              onClick={handleShare}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-[#5EEAD4]/10 text-[#5EEAD4] rounded text-xs font-semibold hover:bg-[#5EEAD4]/20 transition-colors"
            >
              <Share2 className="w-3 h-3" />
              Share
            </button>
          </div>
        </div>
      </nav>

      {/* ━━ Hero ━━ */}
      <section className="relative overflow-hidden">
        {/* Gradient orb — subtle, perf-safe */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.03] blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-10 sm:pb-14">
          <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-end">
            <div>
              {/* Availability tag */}
              {portfolio.open_to_work && (
                <div data-anim="hero" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open to opportunities
                </div>
              )}

              <h1 data-anim="hero" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-3" style={{ fontFamily: "'Syne', system-ui, sans-serif" }}>
                {portfolio.full_name}
              </h1>

              <p data-anim="hero" className="text-lg sm:text-xl text-[#5EEAD4] font-medium mb-2">
                {portfolio.job_title}
              </p>

              {portfolio.tagline && (
                <p data-anim="hero" className="text-base text-[#5A6170] max-w-lg mb-4 leading-relaxed">
                  {portfolio.tagline}
                </p>
              )}

              <div data-anim="hero" className="flex items-center gap-3 text-sm text-[#5A6170] mb-5">
                {portfolio.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {portfolio.location}
                  </span>
                )}
                {!isPreview && (
                  <ViewCounter
                    username={portfolio.username}
                    initialCount={portfolio.view_count}
                    className="flex items-center gap-1.5 text-[#5A6170]"
                  />
                )}
                {isPreview && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> {portfolio.view_count} views
                  </span>
                )}
              </div>

              {/* Social links — horizontal, minimal */}
              <div data-anim="hero" className="flex items-center gap-2">
                {portfolio.linkedin_url && (
                  <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-[#5EEAD4]/30 hover:text-[#5EEAD4] transition-all">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {portfolio.github_username && (
                  <a href={`https://github.com/${portfolio.github_username}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-[#5EEAD4]/30 hover:text-[#5EEAD4] transition-all">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {portfolio.resume_url && (
                  <a href={portfolio.resume_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-[#5EEAD4]/30 hover:text-[#5EEAD4] transition-all">
                    <FileText className="w-4 h-4" />
                  </a>
                )}
                <CopyEmailButton email={portfolio.email} variant="minimal" iconSize="md" />
                <a
                  href={`mailto:${portfolio.email}`}
                  className="ml-2 flex items-center gap-2 px-4 py-2.5 bg-[#5EEAD4] text-[#0B0F14] rounded-lg text-xs font-bold hover:bg-[#4DD8C2] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Get in Touch
                </a>
              </div>
            </div>

            {/* Profile photo — clean, not centered */}
            <div data-anim="hero" className="hidden lg:block">
              <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-white/[0.06] ring-1 ring-white/[0.03] ring-offset-4 ring-offset-[#0B0F14]">
                {portfolio.profile_photo_url ? (
                  <Image src={portfolio.profile_photo_url} alt={portfolio.full_name} width={176} height={176} quality={85} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-900/40 to-violet-900/40 flex items-center justify-center">
                    <span className="text-4xl font-bold text-[#5EEAD4]">{portfolio.full_name.charAt(0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center pb-8">
          <button onClick={() => scrollTo('about')} className="text-[#5A6170] hover:text-[#5EEAD4] transition-colors animate-bounce">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ━━ About ━━ */}
      <section id="about" data-anim="section" className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="grid lg:grid-cols-[200px,1fr] gap-8">
            <div>
              <h2 className="text-xs font-bold text-[#5A6170] uppercase tracking-[0.2em]">About</h2>
            </div>
            <div>
              <p className="text-lg sm:text-xl leading-relaxed text-[#A0A8B8] whitespace-pre-wrap" data-anim="item">
                {portfolio.bio || 'No bio added yet.'}
              </p>
            </div>
          </div>

          {/* Mobile profile photo */}
          <div className="lg:hidden mt-8 flex justify-center">
            <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-white/[0.06]">
              {portfolio.profile_photo_url ? (
                <Image src={portfolio.profile_photo_url} alt={portfolio.full_name} width={112} height={112} quality={85} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-900/40 to-violet-900/40 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#5EEAD4]">{portfolio.full_name.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Skills ━━ */}
      <section id="skills" data-anim="section" className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="grid lg:grid-cols-[200px,1fr] gap-8">
            <div>
              <h2 className="text-xs font-bold text-[#5A6170] uppercase tracking-[0.2em]">Skills</h2>
            </div>
            <div className="space-y-6">
              {Object.entries(skillGroups).map(([category, skills]) => (
                <div key={category} data-anim="item">
                  <p className="text-xs font-medium text-[#5A6170] uppercase tracking-wider mb-3">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((name) => (
                      <span key={name} className={cn('px-3 py-1.5 rounded-md border text-sm font-medium', categoryAccents[category] || 'border-white/10 bg-white/[0.02] text-[#A0A8B8]')}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {portfolio.skills.length === 0 && (
                <p className="text-[#5A6170]">No skills added yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Experience ━━ */}
      {sortedExperiences.length > 0 && (
        <section id="experience" data-anim="section" className="border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
            <div className="grid lg:grid-cols-[200px,1fr] gap-8">
              <div>
                <h2 className="text-xs font-bold text-[#5A6170] uppercase tracking-[0.2em]">Experience</h2>
              </div>
              <div className="space-y-0">
                {sortedExperiences.map((exp, i) => (
                  <div
                    key={exp.id}
                    data-anim="item"
                    className={cn(
                      'relative pl-6 pb-8',
                      i < sortedExperiences.length - 1 && 'border-l border-white/[0.06]'
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      'absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2',
                      exp.is_current
                        ? 'bg-[#5EEAD4] border-[#5EEAD4]'
                        : 'bg-[#0B0F14] border-[#5A6170]'
                    )} />

                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                      <h3 className="text-base font-semibold text-white">{exp.role}</h3>
                      <span className="text-[#5EEAD4] text-sm font-medium">{exp.company}</span>
                      {exp.is_current && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5A6170] mb-2">
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                      {exp.location && ` · ${exp.location}`}
                    </p>
                    <p className="text-sm text-[#8891A0] leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ━━ Projects ━━ */}
      <section id="projects" data-anim="section" className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-xs font-bold text-[#5A6170] uppercase tracking-[0.2em]">Projects</h2>
            {hasLabels && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => setActiveLabel(null)}
                  className={cn('px-3 py-1 rounded text-xs font-semibold transition-colors', activeLabel === null ? 'bg-[#5EEAD4]/10 text-[#5EEAD4]' : 'text-[#5A6170] hover:text-[#C8CCD4]')}
                >
                  All
                </button>
                {projectLabels.map((label) => (
                  <button
                    key={label}
                    onClick={() => setActiveLabel(label)}
                    className={cn('px-3 py-1 rounded text-xs font-semibold transition-colors', activeLabel === label ? 'bg-[#5EEAD4]/10 text-[#5EEAD4]' : 'text-[#5A6170] hover:text-[#C8CCD4]')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredProjects.length === 0 && sortedProjects.length > 0 && (
            <p className="text-[#5A6170]">No projects match this filter.</p>
          )}

          {/* Featured */}
          {featuredProject && (
            <div
              data-anim="item"
              onClick={() => { setSelectedProject(featuredProject); setIsModalOpen(true); }}
              className="group cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.015] hover:border-[#5EEAD4]/20 transition-all mb-6 overflow-hidden"
            >
              <div className="grid md:grid-cols-[1.1fr,1fr]">
                <div className="aspect-video md:aspect-auto md:min-h-[280px] relative overflow-hidden bg-[#111520]">
                  {featuredProject.cover_image_url ? (
                    <Image
                      src={featuredProject.cover_image_url}
                      alt={featuredProject.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 55vw"
                      quality={85}
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5A6170] text-sm">No image</div>
                  )}
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-center">
                  <span className="text-[10px] font-bold tracking-widest text-[#5EEAD4] uppercase mb-3">Featured</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#5EEAD4] transition-colors" style={{ fontFamily: "'Syne', system-ui" }}>
                    {featuredProject.name}
                    <ArrowUpRight className="inline-block w-5 h-5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-[#8891A0] leading-relaxed mb-5">
                    {truncate(featuredProject.description, 200)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {featuredProject.tech_stack.map((tech) => (
                      <span key={tech} className="px-2.5 py-1 rounded border border-white/[0.06] bg-white/[0.02] text-xs text-[#A0A8B8] font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          {otherProjects.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherProjects.map((project) => (
                <div
                  key={project.id}
                  data-anim="item"
                  onClick={() => { setSelectedProject(project); setIsModalOpen(true); }}
                  className="group cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.015] hover:border-[#5EEAD4]/20 transition-all overflow-hidden"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-[#111520]">
                    {project.cover_image_url ? (
                      <Image
                        src={project.cover_image_url}
                        alt={project.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={85}
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5A6170] text-xs">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-[#5EEAD4] transition-colors flex items-center gap-1">
                      {project.name}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-[#8891A0] mb-3 line-clamp-2 leading-relaxed">
                      {truncate(project.description, 100)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.tech_stack.slice(0, 3).map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded border border-white/[0.05] text-[10px] text-[#A0A8B8] font-medium">
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] text-[#5A6170]">+{project.tech_stack.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProjects.length === 0 && sortedProjects.length === 0 && (
            <p className="text-[#5A6170]">No projects added yet.</p>
          )}
        </div>
      </section>

      {/* ━━ Contact ━━ */}
      <section id="contact" data-anim="section" className="border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="max-w-xl">
            <p className="text-xs font-bold text-[#5A6170] uppercase tracking-[0.2em] mb-4">Get in touch</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Syne', system-ui" }}>
              Let&apos;s work together.
            </h2>
            <p className="text-[#8891A0] mb-8 leading-relaxed">
              Have a question or want to collaborate? I&apos;d love to hear from you.
            </p>
            <a
              href={`mailto:${portfolio.email}?subject=Contact from portlyfolio.site`}
              className="inline-flex items-center gap-2.5 bg-[#5EEAD4] text-[#0B0F14] px-6 py-3 rounded-lg text-sm font-bold hover:bg-[#4DD8C2] transition-colors"
            >
              <Mail className="w-4 h-4" />
              {portfolio.email}
            </a>
          </div>
        </div>
      </section>

      {/* ━━ Footer ━━ */}
      <footer className="border-t border-white/[0.04] py-6">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-[#5A6170]">
          <span>Updated {formatDate(portfolio.updated_at || new Date())}</span>
          <div className="flex items-center gap-4">
            {canEditPortfolio(portfolio.email) && (
              <Link href={`/?edit=${portfolio.username}`} className="text-[#5EEAD4] hover:text-[#4DD8C2] font-medium transition-colors">
                Edit
              </Link>
            )}
            <a href="/" className="hover:text-[#5EEAD4] transition-colors">portlyfolio.site</a>
          </div>
        </div>
      </footer>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template="professional"
      />
    </div>
  );
}
