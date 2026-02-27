'use client';

import { Portfolio } from '@/types/portfolio';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface ExploreCardProps {
  portfolio: Portfolio;
}

export function ExploreCard({ portfolio }: ExploreCardProps) {
  const skills = Array.isArray(portfolio.skills)
    ? portfolio.skills.slice(0, 3)
    : [];

  const availabilityColors: Record<string, string> = {
    open_fulltime: 'bg-green-100 text-green-600 border-green-200',
    freelance: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    not_looking: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  return (
    <Link href={`/${portfolio.username}`}>
      <div className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-indigo-300 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        {/* Cover Image Area */}
        <div className="aspect-[4/3] w-full bg-stone-50 relative overflow-hidden p-3">
          <div className="w-full h-full rounded-xl overflow-hidden relative shadow-inner bg-gradient-to-br from-indigo-100 to-purple-100">
            {/* Placeholder pattern */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white/50 rounded-full blur-2xl" />
            </div>
          </div>

          {/* Availability Badge */}
          <div className="absolute top-5 left-5">
            <span
              className={`backdrop-blur-md border text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                availabilityColors[portfolio.availability_status] ||
                'bg-white/90 text-slate-500 border-slate-100'
              }`}
            >
              {portfolio.availability_status === 'open_fulltime' && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
              {portfolio.availability_status === 'open_fulltime'
                ? 'Available'
                : portfolio.availability_status === 'freelance'
                ? 'Freelance'
                : 'Busy'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full border-4 border-indigo-100 overflow-hidden bg-stone-100 shadow-sm shrink-0">
              {portfolio.profile_photo_url ? (
                <Image
                  src={portfolio.profile_photo_url}
                  alt={portfolio.full_name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-500 font-bold">
                    {portfolio.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-slate-800 font-bold text-xl leading-tight group-hover:text-indigo-600 transition-colors">
                {portfolio.full_name}
              </h3>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {portfolio.job_title}
              </p>
            </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
            {portfolio.tagline || portfolio.bio}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-dashed border-stone-100">
            {skills.length > 0 ? (
              skills.map((skill: { name: string }) => (
                <Badge
                  key={skill.name}
                  variant="secondary"
                  className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  {skill.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-stone-400">No skills listed</span>
            )}
          </div>

          {/* View Link */}
          <div className="flex items-center gap-1 text-indigo-600 text-sm font-bold pt-2">
            <span>View Portfolio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
