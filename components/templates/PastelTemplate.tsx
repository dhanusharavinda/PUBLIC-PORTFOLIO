'use client';

import { PortfolioWithProjects } from '@/types/portfolio';
import { AvailabilityBadge } from '@/components/portfolio/AvailabilityBadge';
import { CopyEmailButton } from '@/components/portfolio/CopyEmailButton';
import { ViewCounter } from '@/components/portfolio/ViewCounter';
import { ProjectModal } from '@/components/portfolio/ProjectModal';
import { cn, formatDate, truncate } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Linkedin, Github, FileText, MapPin, Sparkles, Eye, Send, Link2, Share2 } from 'lucide-react';
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const portfolioUrl = `${baseUrl}/${portfolio.username}`;

  // Group skills by category
  const skillGroups = portfolio.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  const categoryColors: Record<string, string> = {
    Languages: 'bg-[#0f2b2a] text-[#7dd3c7]',
    Tools: 'bg-[#113331] text-[#7dd3c7]',
    Frameworks: 'bg-[#123b39] text-[#7dd3c7]',
    'Soft Skills': 'bg-[#1a2f2e] text-[#f9a8d4]',
    Other: 'bg-[#0f2423] text-[#7dd3c7]',
  };

  const sortedExperiences = useMemo(
    () => [...(portfolio.experiences || [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [portfolio.experiences]
  );

  const featuredProject = portfolio.projects.find((p) => p.is_featured);
  const otherProjects = portfolio.projects.filter((p) => !p.is_featured);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          portfolio_username: portfolio.username,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Message sent successfully!');
        form.reset();
      } else {
        toast.error(result.error || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Portfolio link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-[#001514] text-slate-100 transition-colors duration-300 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#001514]/90 backdrop-blur-md border-b border-[#0f2b2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0f2b2a] rounded-xl flex items-center justify-center text-[#4fd1c5]">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight hidden sm:block">portlyfolio.site</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {['Bio', 'Skills', 'Experience', 'Projects', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="px-2 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold hover:text-[#4fd1c5] hover:bg-[#0f2b2a] transition-colors whitespace-nowrap"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#4fd1c5] text-[#001514] rounded-full text-xs font-bold hover:bg-[#3fc1b5] transition-colors h-8"
            >
              <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <span className="text-xs font-semibold text-[#4fd1c5] bg-[#0f2b2a] px-2 sm:px-3 rounded-full hidden md:block h-8 flex items-center">
              portlyfolio.site
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          {/* Profile Photo */}
          <div className="relative inline-block mb-6 sm:mb-10">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl shadow-purple-200 dark:shadow-none">
              {portfolio.profile_photo_url ? (
                <Image
                  src={portfolio.profile_photo_url}
                  alt={portfolio.full_name}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-purple-400">
                    {portfolio.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {portfolio.open_to_work && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 text-white text-[10px] sm:text-[11px] px-2 sm:px-3 py-1 font-semibold shadow">
                Open to Work
              </span>
            )}
          </div>

          {/* Name & Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-2 sm:mb-3 text-white px-2">
            {portfolio.full_name}
          </h1>
          <p className="text-lg sm:text-xl text-[#4fd1c5] font-medium italic mb-2 px-4">
            {portfolio.tagline}
          </p>
          <p className="text-sm sm:text-base text-slate-300 font-medium bg-[#0f2b2a] px-3 sm:px-4 py-1 rounded-full inline-block mb-4 sm:mb-6">
            {portfolio.job_title} {portfolio.location && `• ${portfolio.location}`}
          </p>

          {/* Availability Badge */}
          <div className="mb-8">
            <AvailabilityBadge status={portfolio.availability_status} variant="professional" />
          </div>

          {/* Social Links */}
          <div className="flex gap-6 justify-center mb-8">
            {portfolio.linkedin_url && (
              <a
                href={portfolio.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="p-4 rounded-full bg-white dark:bg-slate-800 border border-purple-100 shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all transform group-hover:-translate-y-1">
                  <Linkedin className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase tracking-widest font-bold text-slate-400 group-hover:text-purple-500">
                  LinkedIn
                </span>
              </a>
            )}
            {portfolio.github_username && (
              <a
                href={`https://github.com/${portfolio.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="p-4 rounded-full bg-white dark:bg-slate-800 border border-purple-100 shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all transform group-hover:-translate-y-1">
                  <Github className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase tracking-widest font-bold text-slate-400 group-hover:text-purple-500">
                  GitHub
                </span>
              </a>
            )}
            {portfolio.resume_url && (
              <a
                href={portfolio.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="p-4 rounded-full bg-white dark:bg-slate-800 border border-purple-100 shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all transform group-hover:-translate-y-1">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs uppercase tracking-widest font-bold text-slate-400 group-hover:text-purple-500">
                  Resume
                </span>
              </a>
            )}
            <CopyEmailButton email={portfolio.email} variant="icon" />
          </div>

          {/* View Counter & Last Updated */}
          <div className="flex flex-col items-center gap-1 text-sm text-slate-400">
            {!isPreview && (
              <ViewCounter username={portfolio.username} initialCount={portfolio.view_count} />
            )}
            {isPreview && <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {portfolio.view_count} views</span>}
            <span>Last updated {formatDate(portfolio.updated_at || new Date())}</span>
          </div>
        </div>
      </section>

      {/* Bio Section - Expanded */}
      <section id="bio" className="py-16 sm:py-20 md:py-24 border-t border-purple-100 dark:border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-500 mb-3 sm:mb-4">About Me</h2>
            <div className="w-20 sm:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
          </div>
          <div className="bg-white/60 dark:bg-white/5 p-6 sm:p-8 md:p-12 lg:p-16 rounded-2xl sm:rounded-3xl border border-white/50 dark:border-white/10 shadow-lg">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {portfolio.bio}
            </p>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-12 sm:py-16 border-t border-purple-100 dark:border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-purple-500">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {portfolio.skills.map((skill) => (
              <span
                key={skill.name}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-shadow',
                  categoryColors[skill.category] || 'bg-slate-100 text-slate-700'
                )}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      {sortedExperiences.length > 0 && (
        <section id="experience" className="py-12 sm:py-16 border-t border-purple-100 dark:border-purple-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-purple-500">Experience</h2>
            <div className="space-y-4">
              {sortedExperiences.map((exp) => (
                <div key={exp.id} className="bg-white/60 dark:bg-white/5 p-4 rounded-2xl border border-white/50 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{exp.role}</h3>
                    <span className="text-slate-400">@</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{exp.company}</span>
                    {exp.is_current && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section id="projects" className="py-12 sm:py-16 border-t border-purple-100 dark:border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-purple-500">Projects</h2>

          {/* Featured Project */}
          {featuredProject && (
            <div
              onClick={() => {
                setSelectedProject(featuredProject);
                setIsModalOpen(true);
              }}
              className="group cursor-pointer bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-purple-100 dark:border-purple-900/30 mb-8"
            >
              <div className="grid md:grid-cols-2 items-center">
                <div className="aspect-video md:aspect-auto md:min-h-[280px] relative overflow-hidden">
                  {featuredProject.cover_image_url ? (
                    <Image
                      src={featuredProject.cover_image_url}
                      alt={featuredProject.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <span className="text-purple-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <span className="text-xs font-bold tracking-widest text-purple-600 uppercase bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                    Featured Case Study
                  </span>
                  <h3 className="text-3xl font-bold mt-4 mb-2 text-slate-800 dark:text-white">
                    {featuredProject.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {truncate(featuredProject.description, 200)}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {featuredProject.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {otherProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setIsModalOpen(true);
                }}
                className="group cursor-pointer bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-purple-100 dark:border-purple-900/30"
              >
                <div className="aspect-video relative overflow-hidden">
                  {project.cover_image_url ? (
                    <Image
                      src={project.cover_image_url}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <span className="text-purple-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {truncate(project.description, 120)}
                  </p>
                  <div className="flex gap-2">
                    {project.tech_stack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-bold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="py-12 sm:py-16 border-t border-purple-200 dark:border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 dark:text-white">Contact</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Have a question or want to work together? Feel free to reach out!</p>
          </div>
          <form onSubmit={handleContactSubmit} className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-lg border border-purple-100 dark:border-purple-900/30 mb-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 block">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full bg-purple-50 dark:bg-slate-700/50 border border-purple-100 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 block">Email</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className="w-full bg-purple-50 dark:bg-slate-700/50 border border-purple-100 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-400 text-sm"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 block">Message</label>
              <textarea
                placeholder="Your message here..."
                required
                rows={4}
                maxLength={1000}
                className="w-full bg-purple-50 dark:bg-slate-700/50 border border-purple-100 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-400 text-sm resize-none"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 text-right mt-1">Max 1000 characters</p>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </form>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <span>Last updated {formatDate(portfolio.updated_at || new Date())}</span>
            <div className="flex items-center gap-3">
              {canEditPortfolio(portfolio.email) && (
                <Link href={`/?edit=${portfolio.username}`} className="text-purple-500 hover:text-purple-600 normal-case font-medium">
                  Edit Portfolio
                </Link>
              )}
              <a href="/" className="hover:text-purple-500 transition-colors">
                Built with portlyfolio.site
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template="professional"
      />
    </div>
  );
}
