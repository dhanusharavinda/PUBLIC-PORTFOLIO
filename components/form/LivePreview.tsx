'use client';

import { useFormContext } from './FormContext';
import { MinimalTemplate } from '@/components/templates/MinimalTemplate';
import { PastelTemplate } from '@/components/templates/PastelTemplate';
import { PortfolioWithProjects } from '@/types/portfolio';
import { Laptop, Tablet, Smartphone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export function LivePreview() {
  const { formData } = useFormContext();
  const [device, setDevice] = useState<DeviceType>('desktop');
  const objectUrlsRef = useRef<string[]>([]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore errors
        }
      });
      objectUrlsRef.current = [];
    };
  }, []);

  // Create and track object URLs
  const createObjectUrl = (file: File): string => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  };

  // Transform form data into portfolio format for preview
  const previewData: PortfolioWithProjects = {
    id: 'preview',
    username: 'preview',
    full_name: formData.full_name || 'Your Name',
    tagline: formData.tagline || 'Your tagline goes here...',
    job_title: formData.job_title || 'Job Title',
    location: formData.location || 'Location',
    bio: formData.bio || 'Your bio will appear here. Describe your expertise and passion...',
    email: formData.email || 'email@example.com',
    profile_photo_url: formData.profile_photo
      ? createObjectUrl(formData.profile_photo)
      : formData.profile_photo_url || '',
    linkedin_url: formData.linkedin_url,
    github_username: formData.github_username,
    resume_url: '',
    availability_status: formData.availability_status,
    open_to_work: formData.open_to_work,
    skills: formData.skills.length > 0 ? formData.skills : [
      { name: 'Python', category: 'Languages' },
      { name: 'SQL', category: 'Languages' },
      { name: 'Tableau', category: 'Tools' },
    ],
    template: formData.template,
    is_public: true,
    view_count: 42,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    experiences: formData.experiences.length > 0
      ? formData.experiences.map((exp, i) => ({
          id: exp.id,
          portfolio_id: 'preview',
          company: exp.company || 'Company Name',
          role: exp.role || 'Job Title',
          location: exp.location || '',
          start_date: exp.start_date || '2020-01',
          end_date: exp.end_date || '',
          is_current: exp.is_current,
          description: exp.description || 'Experience description...',
          order_index: i,
          created_at: new Date().toISOString(),
        }))
      : [],
    projects: formData.projects.length > 0
      ? formData.projects.map((p, i) => ({
          id: p.id,
          portfolio_id: 'preview',
          name: p.name || `Project ${i + 1}`,
          cover_image_url: p.cover_image
            ? createObjectUrl(p.cover_image)
            : p.cover_image_url || '',
          carousel_images: [],
          description: p.description || 'Project description...',
          tech_stack: p.tech_stack.length > 0 ? p.tech_stack : ['Python', 'SQL'],
          github_url: p.github_url,
          demo_url: p.demo_url,
          is_featured: p.is_featured,
          order_index: i,
          created_at: new Date().toISOString(),
        }))
      : [
          {
            id: '1',
            portfolio_id: 'preview',
            name: 'Sample Project',
            cover_image_url: '',
            carousel_images: [],
            description: 'Your projects will appear here like this...',
            tech_stack: ['React', 'TypeScript'],
            github_url: '',
            demo_url: '',
            is_featured: true,
            order_index: 0,
            created_at: new Date().toISOString(),
          },
        ],
  };

  const deviceSettings: Record<DeviceType, { frameWidth: string; scale: number }> = {
    desktop: { frameWidth: '100%', scale: 0.5 },
    tablet: { frameWidth: '768px', scale: 0.56 },
    mobile: { frameWidth: '375px', scale: 0.68 },
  };

  const renderTemplate = () => {
    switch (formData.template) {
      case 'minimal':
        return <MinimalTemplate portfolio={previewData} isPreview />;
      case 'professional':
        return <PastelTemplate portfolio={previewData} isPreview />;
      default:
        return <MinimalTemplate portfolio={previewData} isPreview />;
    }
  };

  return (
    <div className="sticky top-28">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2 text-stone-500">
          <span className="font-bold text-xs uppercase tracking-widest">Live Preview</span>
        </div>
        <div className="flex gap-2 p-1 bg-white rounded-lg border border-stone-200 shadow-sm">
          <button
            onClick={() => setDevice('desktop')}
            className={cn(
              'size-8 flex items-center justify-center rounded transition-colors',
              device === 'desktop' ? 'bg-orange-100 text-orange-600' : 'hover:bg-stone-50'
            )}
          >
            <Laptop className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={cn(
              'size-8 flex items-center justify-center rounded transition-colors',
              device === 'tablet' ? 'bg-orange-100 text-orange-600' : 'hover:bg-stone-50'
            )}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={cn(
              'size-8 flex items-center justify-center rounded transition-colors',
              device === 'mobile' ? 'bg-orange-100 text-orange-600' : 'hover:bg-stone-50'
            )}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-stone-100 rounded-2xl p-4">
        <div
          className="mx-auto bg-white rounded-xl shadow-xl transition-all duration-300 max-h-[80vh] overflow-auto"
          style={{ width: deviceSettings[device].frameWidth, maxWidth: '100%' }}
        >
          <div
            className="origin-top-left"
            style={{
              transform: `scale(${deviceSettings[device].scale})`,
              width: `${100 / deviceSettings[device].scale}%`,
            }}
          >
            {renderTemplate()}
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-400 text-center mt-2">
        Preview updates as you type
      </p>
    </div>
  );
}
