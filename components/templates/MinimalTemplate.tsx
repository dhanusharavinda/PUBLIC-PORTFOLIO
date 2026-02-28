'use client';

import { PortfolioWithProjects } from '@/types/portfolio';
import { CopyEmailButton } from '@/components/portfolio/CopyEmailButton';
import { ViewCounter } from '@/components/portfolio/ViewCounter';
import { ProjectModal } from '@/components/portfolio/ProjectModal';
import { formatDate, truncate } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Linkedin, Github, FileText, MapPin, Eye, Send, Share2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#fdf0d5] text-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-8 xl:p-12">
        <div className="bg-white/90 border border-[#e8ebf5] rounded-2xl sm:rounded-3xl shadow-[0_8px_40px_rgba(55,84,170,0.08)] p-4 sm:p-6 lg:p-12">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              <div className="relative flex-shrink-0">
                <div className="size-14 sm:size-16 lg:size-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#dbe7ff] to-[#f1e0ff]">
                  {portfolio.profile_photo_url ? (
                    <Image
                      src={portfolio.profile_photo_url}
                      alt={portfolio.full_name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-indigo-500">
                      {portfolio.full_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight truncate">{portfolio.full_name}</h1>
                <p className="text-sm sm:text-base lg:text-xl text-indigo-500 mt-0.5 sm:mt-1 truncate">
                  {portfolio.job_title}
                  {portfolio.tagline ? ` | ${portfolio.tagline}` : ''}
                </p>
                <p className="text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{portfolio.location || 'Location not specified'}</span>
                </p>
                {portfolio.open_to_work && (
                  <span className="inline-flex mt-1.5 sm:mt-2 rounded-full bg-emerald-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 font-semibold">
                    Open to Work
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleShare}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-indigo-500 text-white rounded-full text-xs font-semibold hover:bg-indigo-600 transition-colors h-8"
              >
                <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 sm:px-3 py-1.5 rounded-full hidden sm:block h-8 flex items-center">
                portlyfolio.site
              </span>
              {!isPreview && (
                <ViewCounter
                  username={portfolio.username}
                  initialCount={portfolio.view_count}
                  className="h-8 flex items-center text-xs bg-slate-100 px-2 sm:px-3 rounded-full text-slate-600"
                />
              )}
              {isPreview && (
                <span className="text-xs text-slate-500 inline-flex items-center gap-1 h-8 bg-slate-100 px-2 sm:px-3 rounded-full">
                  <Eye className="w-3.5 h-3.5" /> {portfolio.view_count} views
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

          {/* About Section - Expanded */}
          <section className="mb-10">
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl p-6 border border-indigo-100">
              <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-indigo-400"></span>
                About Me
                <span className="w-8 h-px bg-indigo-400"></span>
              </h2>
              <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                {portfolio.bio || 'No bio added yet.'}
              </p>
            </div>
          </section>

          {/* Skills Section - Expanded */}
          <section className="mb-10">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-400"></span>
              Skills
              <span className="w-8 h-px bg-slate-400"></span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {portfolio.skills.length > 0 ? (
                portfolio.skills.map((skill) => (
                  <span
                    key={`${skill.category}-${skill.name}`}
                    className="px-4 py-2 rounded-full bg-[#eef2ff] text-indigo-700 border border-[#dde5ff] text-base font-medium hover:shadow-md transition-shadow"
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">No skills added yet.</span>
              )}
            </div>
          </section>

          {/* Experience Section - Expanded */}
          {sortedExperiences.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-400"></span>
                Experience
                <span className="w-8 h-px bg-slate-400"></span>
              </h2>
              <div className="space-y-4">
                {sortedExperiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4 p-5 bg-[#fbfcff] rounded-xl border border-[#e8ebf5] hover:shadow-md transition-shadow">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-slate-800">{exp.role}</h3>
                        <span className="text-slate-400">@</span>
                        <span className="font-medium text-lg text-indigo-600">{exp.company}</span>
                        {exp.is_current && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                        {exp.location && ` · ${exp.location}`}
                      </p>
                      <p className="text-base text-slate-600">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section - Expanded */}
          <section className="mb-10">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-400"></span>
              Projects
              <span className="w-8 h-px bg-slate-400"></span>
            </h2>

            {featuredProject ? (
              <div className="space-y-6">
                {/* Featured Project */}
                <div
                  onClick={() => {
                    setSelectedProject(featuredProject);
                    setIsModalOpen(true);
                  }}
                  className="cursor-pointer rounded-2xl border border-[#e5eaf9] bg-[#fbfcff] hover:border-indigo-300 hover:shadow-lg transition-all p-6"
                >
                  {featuredProject.cover_image_url && (
                    <div className="relative rounded-xl overflow-hidden mb-5 aspect-video">
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
                      <p className="text-sm font-semibold text-indigo-500 mb-2">FEATURED PROJECT</p>
                      <h3 className="text-2xl font-semibold">{featuredProject.name}</h3>
                    </div>
                  </div>
                  <p className="text-slate-600 mt-4 text-base leading-relaxed">{truncate(featuredProject.description, 250)}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {featuredProject.tech_stack.slice(0, 6).map((tech) => (
                      <span key={tech} className="px-3 py-1.5 rounded-full bg-[#f1f4ff] text-indigo-700 text-sm font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Other Projects */}
                {remainingProjects.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {remainingProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProject(project);
                          setIsModalOpen(true);
                        }}
                        className="text-left rounded-xl border border-[#e8ebf5] p-5 bg-white hover:border-indigo-300 hover:shadow-md transition-all"
                      >
                        {project.cover_image_url && (
                          <div className="relative rounded-lg overflow-hidden mb-4 aspect-video">
                            <Image
                              src={project.cover_image_url}
                              alt={project.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <p className="font-semibold text-lg text-slate-800">{project.name}</p>
                        <p className="text-base text-slate-600 mt-2 leading-relaxed">{truncate(project.description, 120)}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.tech_stack.slice(0, 3).map((tech) => (
                            <span key={tech} className="px-2 py-1 rounded-full bg-[#f1f4ff] text-indigo-700 text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-lg">No projects added yet.</p>
            )}
          </section>

          {/* Contact Section - Expanded */}
          <section className="mt-10 pt-8 border-t border-[#eceffd]">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-800">Get In Touch</h2>
              <p className="text-slate-500 text-base">Have a question or want to work together? Feel free to reach out!</p>
            </div>
            <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_4px_30px_rgba(55,84,170,0.12)] border border-[#e8ebf5] max-w-3xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div>
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2 block">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                    className="w-full bg-[#f7f8fb] border border-[#e8ebf5] rounded-lg px-4 py-3 sm:py-3.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2 block">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    required
                    className="w-full bg-[#f7f8fb] border border-[#e8ebf5] rounded-lg px-4 py-3 sm:py-3.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-base"
                  />
                </div>
              </div>
              <div className="mb-4 sm:mb-5">
                <label className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2 block">Message</label>
                <textarea
                  name="message"
                  placeholder="Your message here..."
                  required
                  rows={4}
                  maxLength={1000}
                  className="w-full bg-[#f7f8fb] border border-[#e8ebf5] rounded-lg px-4 py-3 sm:py-3.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-base resize-none"
                />
                <p className="text-xs text-slate-400 text-right mt-1">Max 1000 characters</p>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 sm:px-10 py-3 rounded-full font-semibold text-base transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
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
              <span>Built with portlyfolio.site</span>
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
