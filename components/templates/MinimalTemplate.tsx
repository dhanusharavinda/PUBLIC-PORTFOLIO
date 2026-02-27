'use client';

import { PortfolioWithProjects } from '@/types/portfolio';
import { CopyEmailButton } from '@/components/portfolio/CopyEmailButton';
import { ViewCounter } from '@/components/portfolio/ViewCounter';
import { ProjectModal } from '@/components/portfolio/ProjectModal';
import { formatDate, truncate } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Linkedin, Github, FileText, MapPin, Eye, Send } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface MinimalTemplateProps {
  portfolio: PortfolioWithProjects;
  isPreview?: boolean;
}

export function MinimalTemplate({ portfolio, isPreview = false }: MinimalTemplateProps) {
  const { canEditPortfolio } = useAuth();
  const [selectedProject, setSelectedProject] = useState(portfolio.projects[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedProjects = useMemo(
    () => [...(portfolio.projects || [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [portfolio.projects]
  );

  const sortedExperiences = useMemo(
    () => [...(portfolio.experiences || [])].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [portfolio.experiences]
  );

  const featuredProject = sortedProjects.find((project) => project.is_featured) || sortedProjects[0] || null;
  const remainingProjects = sortedProjects.filter((project) => project.id !== featuredProject?.id);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-[#fdf0d5] text-slate-800 transition-colors duration-300">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white/90 border border-[#e8ebf5] rounded-3xl shadow-[0_8px_40px_rgba(55,84,170,0.08)] p-4 sm:p-6 lg:p-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-16 sm:size-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#dbe7ff] to-[#f1e0ff]">
                  {portfolio.profile_photo_url ? (
                    <Image
                      src={portfolio.profile_photo_url}
                      alt={portfolio.full_name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-indigo-500">
                      {portfolio.full_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{portfolio.full_name}</h1>
                <p className="text-base sm:text-xl text-indigo-500 mt-1">
                  {portfolio.job_title}
                  {portfolio.tagline ? ` | ${portfolio.tagline}` : ''}
                </p>
                <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="w-4 h-4" />
                  {portfolio.location || 'Location not specified'}
                </p>
            {portfolio.open_to_work && (
              <span className="inline-flex mt-2 rounded-full bg-emerald-500 text-white text-xs px-3 py-1 font-semibold">
                Open to Work
              </span>
            )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full">
                buildfol.io
              </span>
              {!isPreview && <ViewCounter username={portfolio.username} initialCount={portfolio.view_count} />}
              {isPreview && (
                <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {portfolio.view_count}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8 text-slate-600">
            {portfolio.linkedin_url && (
              <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {portfolio.github_username && (
              <a href={`https://github.com/${portfolio.github_username}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
            {portfolio.resume_url && (
              <a href={portfolio.resume_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                <FileText className="w-5 h-5" />
              </a>
            )}
            <CopyEmailButton email={portfolio.email} variant="minimal" iconSize="md" />
          </div>

          <section className="mb-6">
            <h2 className="text-xs tracking-[0.2em] text-slate-500 font-semibold mb-2">ABOUT</h2>
            <p className="text-base leading-relaxed text-slate-700">{portfolio.bio || 'No bio added yet.'}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-xs tracking-[0.2em] text-slate-500 font-semibold mb-2">SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.length > 0 ? (
                portfolio.skills.map((skill) => (
                  <span
                    key={`${skill.category}-${skill.name}`}
                    className="px-3 py-1 rounded-full bg-[#eef2ff] text-indigo-700 border border-[#dde5ff] text-sm font-medium"
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">No skills added yet.</span>
              )}
            </div>
          </section>

          {sortedExperiences.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs tracking-[0.2em] text-slate-500 font-semibold mb-3">EXPERIENCE</h2>
              <div className="space-y-3">
                {sortedExperiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4 p-3 bg-[#fbfcff] rounded-xl border border-[#e8ebf5]">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{exp.role}</h3>
                        <span className="text-slate-400">@</span>
                        <span className="font-medium text-indigo-600">{exp.company}</span>
                        {exp.is_current && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-1">
                        {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-6">
            <h2 className="text-xs tracking-[0.2em] text-slate-500 font-semibold mb-3">PROJECTS</h2>

            {featuredProject ? (
              <div className="space-y-4">
                <div
                  onClick={() => {
                    setSelectedProject(featuredProject);
                    setIsModalOpen(true);
                  }}
                  className="cursor-pointer rounded-2xl border border-[#e5eaf9] bg-[#fbfcff] hover:border-indigo-300 transition-colors p-4 sm:p-5"
                >
                  {featuredProject.cover_image_url && (
                    <div className="relative rounded-xl overflow-hidden mb-4 aspect-video">
                      <Image
                        src={featuredProject.cover_image_url}
                        alt={featuredProject.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-indigo-500 mb-1">FEATURED</p>
                      <h3 className="text-xl font-semibold">{featuredProject.name}</h3>
                    </div>
                  </div>
                  <p className="text-slate-600 mt-3">{truncate(featuredProject.description, 180)}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {featuredProject.tech_stack.slice(0, 5).map((tech) => (
                      <span key={tech} className="px-3 py-1 rounded-full bg-[#f1f4ff] text-indigo-700 text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {remainingProjects.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {remainingProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProject(project);
                          setIsModalOpen(true);
                        }}
                        className="text-left rounded-xl border border-[#e8ebf5] p-4 bg-white hover:border-indigo-300 transition-colors"
                      >
                        {project.cover_image_url && (
                          <div className="relative rounded-lg overflow-hidden mb-3 aspect-video">
                            <Image
                              src={project.cover_image_url}
                              alt={project.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <p className="font-semibold text-slate-800">{project.name}</p>
                        <p className="text-sm text-slate-600 mt-1">{truncate(project.description, 90)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500">No projects added yet.</p>
            )}
          </section>

          {/* Contact Section */}
          <section className="mt-6 pt-6 border-t border-[#eceffd]">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800">Contact</h2>
              <p className="text-slate-500 text-sm">Have a question or want to work together? Feel free to reach out!</p>
            </div>
            <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(55,84,170,0.1)] border border-[#e8ebf5]">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    required
                    className="w-full bg-[#f7f8fb] border border-[#e8ebf5] rounded-lg px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email</label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    className="w-full bg-[#f7f8fb] border border-[#e8ebf5] rounded-lg px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 text-sm"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Message</label>
                <textarea
                  placeholder="Your message here..."
                  required
                  rows={4}
                  maxLength={1000}
                  className="w-full bg-[#f7f8fb] border border-[#e8ebf5] rounded-lg px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 text-sm resize-none"
                />
                <p className="text-xs text-slate-400 text-right mt-1">Max 1000 characters</p>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </form>
          </section>

          <div className="pt-4 mt-6 border-t border-[#eceffd] text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
            <span>Last updated {portfolio.updated_at ? formatDate(portfolio.updated_at || new Date()) : 'Recently'}</span>
            <div className="flex items-center gap-3">
              {canEditPortfolio(portfolio.email) && (
                <Link href={`/?edit=${portfolio.username}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Edit Portfolio
                </Link>
              )}
              <span>Built with buildfol.io</span>
            </div>
          </div>
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template="minimal"
      />
    </div>
  );
}
