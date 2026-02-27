'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  allSkills: string[];
  activeSkill: string;
  onSkillChange: (skill: string) => void;
  availabilityFilter: 'all' | 'available';
  onAvailabilityFilterChange: (filter: 'all' | 'available') => void;
  sort: 'newest' | 'most_viewed' | 'alphabetical';
  onSortChange: (sort: 'newest' | 'most_viewed' | 'alphabetical') => void;
}

export function FilterBar({
  allSkills,
  activeSkill,
  onSkillChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  sort,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 w-full">
      <button
        onClick={() => onSkillChange('all')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm',
          activeSkill === 'all'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
            : 'bg-white text-slate-700 border border-stone-100 hover:border-indigo-200 hover:bg-indigo-50'
        )}
      >
        All
      </button>

      <button
        onClick={() => onAvailabilityFilterChange(availabilityFilter === 'available' ? 'all' : 'available')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm',
          availabilityFilter === 'available'
            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
            : 'bg-white text-slate-700 border border-stone-100 hover:border-green-200 hover:bg-green-50'
        )}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
        Available Now
      </button>

      {allSkills.slice(0, 3).map((skill) => (
        <button
          key={skill}
          onClick={() => onSkillChange(skill)}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm',
            activeSkill === skill
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
              : 'bg-white text-slate-700 border border-stone-100 hover:border-purple-200 hover:bg-purple-50'
          )}
        >
          {skill}
        </button>
      ))}

      <div className="w-px h-8 bg-stone-200 mx-2 hidden md:block" />

      <Select value={activeSkill} onValueChange={onSkillChange}>
        <SelectTrigger className="w-full sm:w-[180px] bg-white border-stone-200">
          <SelectValue placeholder="Filter by skill" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All skills</SelectItem>
          {allSkills.map((skill) => (
            <SelectItem key={skill} value={skill}>
              {skill}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(value) => onSortChange(value as 'newest' | 'most_viewed' | 'alphabetical')}>
        <SelectTrigger className="w-full sm:w-[160px] bg-white border-stone-200">
          <SelectValue placeholder="Sort: Newest" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="most_viewed">Most Viewed</SelectItem>
          <SelectItem value="alphabetical">A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
