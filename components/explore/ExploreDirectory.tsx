'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Search, Sparkles, ExternalLink, User, Eye, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ProjectWithPortfolio {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  tech_stack: string[];
  portfolio_id: string;
  portfolio_username: string;
  portfolio_full_name: string;
  portfolio_job_title: string;
  portfolio_profile_photo_url: string;
  portfolio_view_count: number;
  portfolio_created_at: string;
}

interface ExploreDirectoryProps {
  projects: ProjectWithPortfolio[];
  allSkills: string[];
}

type SortOption = 'newest' | 'most_viewed' | 'alphabetical';

const PAGE_SIZE = 12;

export function ExploreDirectory({ projects, allSkills }: ExploreDirectoryProps) {
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          project.name,
          project.description,
          project.portfolio_full_name,
          project.portfolio_username,
          project.portfolio_job_title,
        ]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(normalizedSearch)) ||
        project.tech_stack.some((skill) => skill.toLowerCase().includes(normalizedSearch));

      const matchesSkill =
        selectedSkill === 'all' || project.tech_stack.includes(selectedSkill);

      return matchesSearch && matchesSkill;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'most_viewed') {
        return (b.portfolio_view_count || 0) - (a.portfolio_view_count || 0);
      }
      if (sort === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      // newest
      return new Date(b.portfolio_created_at).getTime() - new Date(a.portfolio_created_at).getTime();
    });

    return sorted;
  }, [normalizedSearch, selectedSkill, sort, projects]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredProjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSkill('all');
    setSort('newest');
    setPage(1);
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col gap-8 mb-12 items-center text-center">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="inline-block mx-auto bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Project Showcase
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-800">
            Discover Amazing Projects
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium">
            Browse through projects created by talented professionals and get inspired.
          </p>
        </div>

        {/* Search */}
        <div className="w-full max-w-3xl relative">
          <label className="relative block group shadow-lg rounded-2xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search projects, skills, creators..."
              className="block w-full bg-white border-2 border-transparent hover:border-indigo-100 focus:border-indigo-300 rounded-2xl py-4 sm:py-5 pl-12 sm:pl-14 pr-4 sm:pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-base sm:text-lg shadow-sm font-medium"
            />
          </label>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {/* Sort Dropdown */}
          <Select value={sort} onValueChange={(value) => {
            setSort(value as SortOption);
            setPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white border-stone-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Most Recent</SelectItem>
              <SelectItem value="most_viewed">Most Viewed</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-8 bg-stone-200 mx-2 hidden md:block" />

          {/* Skill Dropdown */}
          <Select value={selectedSkill} onValueChange={(value) => {
            setSelectedSkill(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white border-stone-200">
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {allSkills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-500">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
        </p>
        {(search || selectedSkill !== 'all' || sort !== 'newest') && (
          <button
            onClick={handleResetFilters}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-6">Be the first to create and share your project.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No matching projects</h3>
          <p className="text-slate-500 mb-6">Try a different search term or filter.</p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300"
              >
                {/* Project Cover Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                  )}
                  {/* Tech Stack Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex flex-wrap gap-1">
                      {project.tech_stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                          +{project.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {project.description || 'No description available'}
                  </p>

                  {/* Creator Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
                      {project.portfolio_profile_photo_url ? (
                        <img
                          src={project.portfolio_profile_photo_url}
                          alt={project.portfolio_full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                          {project.portfolio_full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {project.portfolio_full_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {project.portfolio_job_title}
                      </p>
                    </div>
                  </div>

                  {/* View Portfolio Button */}
                  <Link
                    href={`/${project.portfolio_username}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Portfolio
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full border border-stone-200 bg-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
              >
                Previous
              </button>
              <span className="text-sm font-semibold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full border border-stone-200 bg-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
