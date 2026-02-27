'use client';

import { PortfolioWithProjects } from '@/types/portfolio';
import { AvailabilityBadge } from '@/components/portfolio/AvailabilityBadge';
import { CopyEmailButton } from '@/components/portfolio/CopyEmailButton';
import { ViewCounter } from '@/components/portfolio/ViewCounter';
import { ProjectModal } from '@/components/portfolio/ProjectModal';
import { cn, formatDate, truncate } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Linkedin, Github, FileText, MapPin, Code2, Eye, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface ProfessionalTemplateProps {
  portfolio: PortfolioWithProjects;
  isPreview?: boolean;
}

export function ProfessionalTemplate({ portfolio, isPreview = false }: ProfessionalTemplateProps) {
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] dark:bg-[#0F0F0F] text-white transition-colors duration-300 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#7C6AFF]/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-[#7C6AFF]" />
            <span className="text-xl font-bold tracking-tight">{portfolio.full_name}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 font-mono text-xs sm:text-sm overflow-x-auto max-w-[50vw] sm:max-w-none">
            {['ABOUT', 'SKILLS', 'EXPERIENCE', 'PROJECTS', 'CONTACT'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="hover:text-[#7C6AFF] transition-colors whitespace-nowrap"
              >
                {item}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-[#7C6AFF] border border-[#7C6AFF]/40 px-3 py-1">
            buildfol.io
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-[#7C6AFF]/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Profile Photo */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-none overflow-hidden border-2 border-[#7C6AFF]">
                {portfolio.profile_photo_url ? (
                  <Image
                    src={portfolio.profile_photo_url}
                    alt={portfolio.full_name}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#7C6AFF]/20 flex items-center justify-center">
                    <span className="text-5xl font-bold text-[#7C6AFF]">
                      {portfolio.full_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {portfolio.open_to_work && (
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#39FF14] text-black text-[11px] font-mono font-bold px-2 py-1">
                  OPEN TO WORK
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                {portfolio.full_name}
              </h1>
              <p className="text-2xl text-[#7C6AFF] font-mono mb-2">
                {portfolio.tagline}
              </p>
              <p className="text-stone-400 font-mono text-sm mb-6 flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4" />
                {portfolio.job_title} {portfolio.location && `// ${portfolio.location}`}
              </p>

              <div className="mb-6">
                <AvailabilityBadge status={portfolio.availability_status} variant="professional" />
              </div>

              {/* Social Links */}
              <div className="flex gap-4 justify-center md:justify-start mb-6">
                {portfolio.linkedin_url && (
                  <a
                    href={portfolio.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-[#7C6AFF]/30 hover:bg-[#7C6AFF] hover:text-white transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {portfolio.github_username && (
                  <a
                    href={`https://github.com/${portfolio.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-[#7C6AFF]/30 hover:bg-[#7C6AFF] hover:text-white transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {portfolio.resume_url && (
                  <a
                    href={portfolio.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-[#7C6AFF]/30 hover:bg-[#7C6AFF] hover:text-white transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                  </a>
                )}
                <div className="p-3 border border-[#7C6AFF]/30 hover:bg-[#7C6AFF] hover:text-white transition-colors cursor-pointer">
                  <CopyEmailButton
                    email={portfolio.email}
                    variant="minimal"
                    iconSize="md"
                    className="text-current"
                  />
                </div>
              </div>

              {/* View Counter & Last Updated */}
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-stone-500 font-mono">
                {!isPreview && (
                  <ViewCounter username={portfolio.username} initialCount={portfolio.view_count} />
                )}
{isPreview && <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {portfolio.view_count} views</span>}
            <span>Last updated {portfolio.updated_at ? formatDate(portfolio.updated_at || new Date()) : 'Recently'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-10 border-b border-[#7C6AFF]/20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-sm font-mono text-[#7C6AFF] uppercase tracking-widest mb-4">
            // About
          </h2>
          <p className="text-lg leading-relaxed text-stone-300 max-w-3xl">
            {portfolio.bio}
          </p>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-10 border-b border-[#7C6AFF]/20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-sm font-mono text-[#7C6AFF] uppercase tracking-widest mb-4">
            // Skills
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(skillGroups).map(([category, skills]) => (
              <div key={category} className="border border-[#7C6AFF]/20 p-6">
                <h3 className="text-xs font-mono text-stone-500 uppercase tracking-widest mb-4">
                  {category}
                </h3>
                <div className="space-y-2">
                  {skills.map((skill, i) => (
                    <div
                      key={skill}
                      className="font-mono text-sm text-[#7C6AFF]"
                    >
                      <span className="text-stone-600 mr-2">{String(i + 1).padStart(2, '0')}.</span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      {sortedExperiences.length > 0 && (
        <section id="experience" className="py-10 border-b border-[#7C6AFF]/20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-sm font-mono text-[#7C6AFF] uppercase tracking-widest mb-4">
              // Experience
            </h2>
            <div className="space-y-4">
              {sortedExperiences.map((exp) => (
                <div key={exp.id} className="border border-[#7C6AFF]/20 p-4 hover:border-[#7C6AFF]/40 transition-colors">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                    <h3 className="font-bold text-lg">{exp.role}</h3>
                    <span className="text-stone-500">@</span>
                    <span className="font-semibold text-[#7C6AFF]">{exp.company}</span>
                    {exp.is_current && (
                      <span className="text-[10px] bg-[#39FF14]/20 text-[#39FF14] px-2 py-0.5 font-mono">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-stone-500 mb-2">
                    {exp.start_date} - {exp.is_current ? 'PRESENT' : exp.end_date}
                    {exp.location && ` // ${exp.location}`}
                  </p>
                  <p className="text-sm text-stone-400">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section id="projects" className="py-10 border-b border-[#7C6AFF]/20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-sm font-mono text-[#7C6AFF] uppercase tracking-widest mb-4">
            // Projects
          </h2>

          {/* Featured Project */}
          {featuredProject && (
            <div
              onClick={() => {
                setSelectedProject(featuredProject);
                setIsModalOpen(true);
              }}
              className="group cursor-pointer border-2 border-[#7C6AFF]/30 hover:border-[#7C6AFF] transition-all mb-8"
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-video relative overflow-hidden">
                  {featuredProject.cover_image_url ? (
                    <Image
                      src={featuredProject.cover_image_url}
                      alt={featuredProject.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#7C6AFF]/10 flex items-center justify-center">
                      <span className="text-[#7C6AFF] font-mono">NO_IMAGE</span>
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <span className="text-xs font-mono text-[#39FF14] uppercase">
                    // Featured
                  </span>
                  <h3 className="text-3xl font-bold mt-2 mb-4">{featuredProject.name}</h3>
                  <p className="text-stone-400 mb-6">
                    {truncate(featuredProject.description, 200)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {featuredProject.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-[#7C6AFF]/10 text-[#7C6AFF] text-xs font-mono"
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
                className="group cursor-pointer border border-[#7C6AFF]/20 hover:border-[#7C6AFF] transition-all"
              >
                <div className="aspect-video relative overflow-hidden">
                  {project.cover_image_url ? (
                    <Image
                      src={project.cover_image_url}
                      alt={project.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#7C6AFF]/10 flex items-center justify-center">
                      <span className="text-[#7C6AFF] font-mono">NO_IMAGE</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                  <p className="text-sm text-stone-400 mb-4">
                    {truncate(project.description, 120)}
                  </p>
                  <div className="flex gap-2">
                    {project.tech_stack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-stone-800 text-stone-400 text-xs font-mono"
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
      <footer id="contact" className="py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">// Contact</h2>
            <p className="text-stone-400 font-mono text-sm">Have a question or want to work together? Feel free to reach out!</p>
          </div>
          <form onSubmit={handleContactSubmit} className="bg-[#1a1a1a] rounded-none p-5 sm:p-6 border border-[#7C6AFF]/30 mb-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-mono text-[#7C6AFF] uppercase mb-2 block">NAME</label>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  className="w-full bg-[#0F0F0F] border border-[#7C6AFF]/30 px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-[#7C6AFF] text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[#7C6AFF] uppercase mb-2 block">EMAIL</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  className="w-full bg-[#0F0F0F] border border-[#7C6AFF]/30 px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-[#7C6AFF] text-sm font-mono"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-mono text-[#7C6AFF] uppercase mb-2 block">MESSAGE</label>
              <textarea
                placeholder="Your message here..."
                required
                rows={4}
                maxLength={1000}
                className="w-full bg-[#0F0F0F] border border-[#7C6AFF]/30 px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-[#7C6AFF] text-sm font-mono resize-none"
              />
              <p className="text-xs text-stone-500 font-mono text-right mt-1">Max 1000 characters</p>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="border border-[#7C6AFF]/50 hover:bg-[#7C6AFF]/20 text-white px-8 py-2.5 font-mono text-sm transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                SEND MESSAGE
              </button>
            </div>
          </form>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-stone-500 font-mono border-t border-[#7C6AFF]/20 pt-4">
            <span>Last updated {formatDate(portfolio.updated_at || new Date())}</span>
            <div className="flex items-center gap-3">
              {canEditPortfolio(portfolio.email) && (
                <Link href={`/?edit=${portfolio.username}`} className="text-[#7C6AFF] hover:text-[#8f82ff]">
                  Edit Portfolio
                </Link>
              )}
              <a href="/" className="hover:text-[#7C6AFF] transition-colors">
                Built with buildfol.io
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
