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

  const createObjectUrl = (file: File): string => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  };

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
    is_public: formData.is_public ?? true,
    view_count: 0,
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
          label: p.label || '',
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
      <div className="flex items-center justify-between mb-3 px-2">
        <span
          className="font-bold text-xs uppercase tracking-widest"
          style={{ color: 'var(--m-text-muted)' }}
        >
          Live Preview
        </span>
        <div
          className="flex gap-1 p-1 border"
          style={{
            backgroundColor: 'var(--m-bg-card)',
            borderColor: 'var(--m-border)',
            borderRadius: 'var(--m-radius)',
          }}
        >
          {([
            { key: 'desktop', Icon: Laptop },
            { key: 'tablet', Icon: Tablet },
            { key: 'mobile', Icon: Smartphone },
          ] as const).map(({ key, Icon }) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className="size-7 flex items-center justify-center rounded transition-colors"
              style={{
                backgroundColor: device === key ? 'var(--m-accent-light)' : 'transparent',
                color: device === key ? 'var(--m-accent)' : 'var(--m-text-muted)',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      <div
        className="p-4"
        style={{
          backgroundColor: 'var(--m-bg-secondary)',
          borderRadius: 'var(--m-radius-lg)',
        }}
      >
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

      <p className="text-xs text-center mt-2" style={{ color: 'var(--m-text-muted)' }}>
        Preview updates as you type
      </p>
    </div>
  );
}
