'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Portfolio } from '@/types/portfolio';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { FilterBar } from '@/components/explore/FilterBar';
import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ExploreDirectoryProps {
  portfolios: Portfolio[];
  allSkills: string[];
}

const PAGE_SIZE = 9;

export function ExploreDirectory({ portfolios, allSkills }: ExploreDirectoryProps) {
  const [search, setSearch] = useState('');
  const [activeSkill, setActiveSkill] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');
  const [sort, setSort] = useState<'newest' | 'most_viewed' | 'alphabetical'>('newest');
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const filteredPortfolios = useMemo(() => {
    const filtered = portfolios.filter((portfolio) => {
      const skills = Array.isArray(portfolio.skills) ? portfolio.skills : [];
      const skillNames = skills.map((skill) => skill.name.toLowerCase());

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [portfolio.full_name, portfolio.job_title, portfolio.location, portfolio.tagline, portfolio.bio]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch)) ||
        skillNames.some((skill) => skill.includes(normalizedSearch));

      const matchesSkill =
        activeSkill === 'all' || skillNames.includes(activeSkill.toLowerCase());

      const isAvailable =
        portfolio.open_to_work ||
        portfolio.availability_status === 'open_fulltime' ||
        portfolio.availability_status === 'freelance';
      const matchesAvailability = availabilityFilter === 'all' || isAvailable;

      return matchesSearch && matchesSkill && matchesAvailability;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'most_viewed') {
        return (b.view_count || 0) - (a.view_count || 0);
      }

      if (sort === 'alphabetical') {
        return a.full_name.localeCompare(b.full_name);
      }

      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate;
    });

    return sorted;
  }, [activeSkill, availabilityFilter, normalizedSearch, portfolios, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPortfolios.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredPortfolios.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleResetFilters = () => {
    setSearch('');
    setActiveSkill('all');
    setAvailabilityFilter('all');
    setSort('newest');
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-col gap-8 mb-12 items-center text-center">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="inline-block mx-auto bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Curated Directory
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-800">
            Explore Creative Talent
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium">
            Discover data professionals and explore portfolios built on buildfol.io.
          </p>
        </div>

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
              placeholder="Search by name, role, location, or skill..."
              className="block w-full bg-white border-2 border-transparent hover:border-indigo-100 focus:border-indigo-300 rounded-2xl py-4 sm:py-5 pl-12 sm:pl-14 pr-4 sm:pr-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-base sm:text-lg shadow-sm font-medium"
            />
          </label>
        </div>

        <FilterBar
          allSkills={allSkills}
          activeSkill={activeSkill}
          onSkillChange={(skill) => {
            setActiveSkill(skill);
            setPage(1);
          }}
          availabilityFilter={availabilityFilter}
          onAvailabilityFilterChange={(filter) => {
            setAvailabilityFilter(filter);
            setPage(1);
          }}
          sort={sort}
          onSortChange={(newSort) => {
            setSort(newSort);
            setPage(1);
          }}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-500">
          {filteredPortfolios.length} portfolio{filteredPortfolios.length !== 1 ? 's' : ''} found
        </p>
        {(search || activeSkill !== 'all' || availabilityFilter !== 'all' || sort !== 'newest') && (
          <button
            onClick={handleResetFilters}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Reset filters
          </button>
        )}
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No portfolios yet</h3>
          <p className="text-slate-500 mb-6">Be the first to build and publish your portfolio.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create Portfolio
          </Link>
        </div>
      ) : filteredPortfolios.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No matching portfolios</h3>
          <p className="text-slate-500 mb-6">Try another keyword, skill, or availability filter.</p>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pageItems.map((portfolio) => (
              <ExploreCard key={portfolio.id || portfolio.username} portfolio={portfolio} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full border border-stone-200 bg-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm font-semibold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full border border-stone-200 bg-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
