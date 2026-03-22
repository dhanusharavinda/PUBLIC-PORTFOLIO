'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Search, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectWithPortfolio {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  tech_stack: string[];
  project_created_at: string;
  portfolio_id: string;
  portfolio_username: string;
  portfolio_full_name: string;
  portfolio_job_title: string;
  portfolio_profile_photo_url: string;
  portfolio_view_count: number;
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
        return Number(b.portfolio_view_count || 0) - Number(a.portfolio_view_count || 0);
      }
      if (sort === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.project_created_at).getTime() - new Date(a.project_created_at).getTime();
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
      <div className="flex flex-col gap-6 mb-10 items-center text-center animate-fade-in-up">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span
            className="inline-block mx-auto px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: 'var(--m-accent-light)', color: 'var(--m-accent)' }}
          >
            Project Showcase
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight m-zine-heading"
            style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
          >
            Discover Amazing Projects
          </h1>
          <p className="text-base sm:text-lg font-medium" style={{ color: 'var(--m-text-secondary)' }}>
            Browse through projects created by talented professionals and get inspired.
          </p>
        </div>

        {/* Search */}
        <div className="w-full max-w-3xl relative">
          <label className="relative block group">
            <span
              className="absolute inset-y-0 left-0 flex items-center pl-5 transition-colors"
              style={{ color: 'var(--m-text-muted)' }}
            >
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
              className="block w-full border-2 py-4 pl-13 pr-5 focus:outline-none focus:ring-4 transition-all text-base font-medium"
              style={{
                backgroundColor: 'var(--m-bg-card)',
                borderColor: 'var(--m-border)',
                color: 'var(--m-text)',
                borderRadius: 'var(--m-radius)',
                boxShadow: `0 4px 20px var(--m-shadow)`,
              }}
            />
          </label>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Select value={sort} onValueChange={(value) => {
            setSort(value as SortOption);
            setPage(1);
          }}>
            <SelectTrigger
              className="w-full sm:w-[160px] border"
              style={{
                backgroundColor: 'var(--m-bg-card)',
                borderColor: 'var(--m-border)',
                color: 'var(--m-text)',
              }}
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Most Recent</SelectItem>
              <SelectItem value="most_viewed">Most Viewed</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-8 mx-2 hidden md:block" style={{ backgroundColor: 'var(--m-border)' }} />

          <Select value={selectedSkill} onValueChange={(value) => {
            setSelectedSkill(value);
            setPage(1);
          }}>
            <SelectTrigger
              className="w-full sm:w-[180px] border"
              style={{
                backgroundColor: 'var(--m-bg-card)',
                borderColor: 'var(--m-border)',
                color: 'var(--m-text)',
              }}
            >
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
        <p className="text-sm font-bold" style={{ color: 'var(--m-text-secondary)' }}>
          {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
        </p>
        {(search || selectedSkill !== 'all' || sort !== 'newest') && (
          <button
            onClick={handleResetFilters}
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--m-accent)' }}
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--m-accent-light)' }}
          >
            <Sparkles className="w-8 h-8" style={{ color: 'var(--m-accent)' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--m-text-heading)' }}>
            No projects yet
          </h3>
          <p className="mb-6" style={{ color: 'var(--m-text-secondary)' }}>
            Be the first to create and share your project.
          </p>
          <Link href="/" className="m-btn-accent inline-flex items-center gap-2 px-6 py-3" style={{ borderRadius: 'var(--m-radius)' }}>
            <Sparkles className="w-4 h-4" />
            Create Project
          </Link>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--m-accent-light)' }}
          >
            <Search className="w-8 h-8" style={{ color: 'var(--m-accent)' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--m-text-heading)' }}>
            No matching projects
          </h3>
          <p className="mb-6" style={{ color: 'var(--m-text-secondary)' }}>
            Try a different search term or filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="m-btn-accent inline-flex items-center gap-2 px-6 py-3"
            style={{ borderRadius: 'var(--m-radius)' }}
          >
            Reset Search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {pageItems.map((project) => (
              <div
                key={project.id}
                className="group overflow-hidden border m-card-hover m-zine-card transition-all duration-300"
                style={{
                  backgroundColor: 'var(--m-bg-card)',
                  borderColor: 'var(--m-border)',
                  borderRadius: 'var(--m-radius)',
                }}
              >
                {/* Project Cover Image */}
                <div className="relative aspect-video overflow-hidden" style={{ backgroundColor: 'var(--m-bg-secondary)' }}>
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--m-accent-light)' }}
                    >
                      <Sparkles className="w-8 h-8" style={{ color: 'var(--m-accent)' }} />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="flex flex-wrap gap-1">
                      {project.tech_stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 bg-white/15 backdrop-blur-sm text-white text-xs rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/15 backdrop-blur-sm text-white text-xs rounded-full font-medium">
                          +{project.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-5">
                  <h3
                    className="font-bold text-lg mb-2 line-clamp-1 transition-colors"
                    style={{ color: 'var(--m-text-heading)' }}
                  >
                    {project.name}
                  </h3>
                  <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--m-text-secondary)' }}>
                    {project.description || 'No description available'}
                  </p>

                  {/* Creator Info */}
                  <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--m-border)' }}>
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--m-bg-secondary)' }}>
                      {project.portfolio_profile_photo_url ? (
                        <img
                          src={project.portfolio_profile_photo_url}
                          alt={project.portfolio_full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center font-bold text-sm"
                          style={{ backgroundColor: 'var(--m-accent-light)', color: 'var(--m-accent)' }}
                        >
                          {project.portfolio_full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--m-text-heading)' }}>
                        {project.portfolio_full_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--m-text-muted)' }}>
                        {project.portfolio_job_title}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/${project.portfolio_username}`}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 font-semibold text-sm transition-colors"
                    style={{
                      backgroundColor: 'var(--m-accent-light)',
                      color: 'var(--m-accent)',
                      borderRadius: 'var(--m-radius)',
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Portfolio
                    <ArrowRight className="w-3.5 h-3.5" />
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
                className="m-btn-outline px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderRadius: 'var(--m-radius)' }}
              >
                Previous
              </button>
              <span className="text-sm font-semibold" style={{ color: 'var(--m-text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="m-btn-outline px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderRadius: 'var(--m-radius)' }}
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
