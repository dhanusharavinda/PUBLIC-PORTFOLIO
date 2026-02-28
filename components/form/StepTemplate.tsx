'use client';

import { useFormContext } from './FormContext';
import { TemplateType } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Briefcase, Globe, Link2, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { fetchJson } from '@/lib/fetch-json';

const templates: {
  id: TemplateType;
  name: string;
  description: string;
  features: string[];
  colors: string[];
  icon: React.ReactNode;
}[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, elegant, and timeless.',
    features: ['Soft neutral palette', 'Compact layout', 'Clear typography', 'Portfolio-first'],
    colors: ['#fdf0d5', '#fff8e8', '#d4a373'],
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Dark, modern, and confident.',
    features: ['Primary color #001514', 'High contrast readability', 'Clean cards', 'Business-ready'],
    colors: ['#001514', '#0d2b2a', '#38b2ac'],
    icon: <Briefcase className="w-6 h-6" />,
  },
];

function slugifyUsername(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function StepTemplate() {
  const { formData, updateFormData } = useFormContext();
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'taken' | 'invalid' | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  // Generate initial username from full name if empty
  useEffect(() => {
    if (!formData.username && formData.full_name) {
      const generated = slugifyUsername(formData.full_name);
      if (generated.length >= 3) {
        updateFormData({ username: generated });
        checkAvailability(generated);
      }
    }
  }, []);

  const checkAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setAvailabilityStatus('invalid');
      setAvailabilityMessage('Username must be at least 3 characters');
      return;
    }

    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      setAvailabilityStatus('invalid');
      setAvailabilityMessage('Only lowercase letters, numbers, and hyphens allowed');
      return;
    }

    setIsChecking(true);
    try {
      const result = await fetchJson<{ success: boolean; available: boolean; error: string | null }>(
        `/api/check-username?username=${encodeURIComponent(username)}`
      );

      if (result.available) {
        setAvailabilityStatus('available');
        setAvailabilityMessage('Username is available!');
      } else {
        setAvailabilityStatus('taken');
        setAvailabilityMessage(result.error || 'Username is already taken');
      }
    } catch {
      setAvailabilityStatus(null);
      setAvailabilityMessage('');
    } finally {
      setIsChecking(false);
    }
  }, []);

  const handleUsernameChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    updateFormData({ username: sanitized });
    setAvailabilityStatus(null);
    setAvailabilityMessage('');
  };

  const handleUsernameBlur = () => {
    if (formData.username.length >= 3) {
      checkAvailability(formData.username);
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'portlyfolio.site';

  return (
    <div className="space-y-6">
      {/* Username Picker Section */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-800">Choose Your URL</h3>
            <p className="text-sm text-stone-500">This will be your unique portfolio link</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <div className="flex items-center bg-white border-2 border-stone-200 rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
              <span className="px-4 py-3 text-stone-400 text-sm font-medium border-r border-stone-200 bg-stone-50">
                {baseUrl.replace(/^https?:\/\//, '')}/
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={handleUsernameBlur}
                placeholder="your-name"
                className="flex-1 px-4 py-3 text-stone-800 font-semibold placeholder:font-normal focus:outline-none"
                minLength={3}
                maxLength={30}
              />
              {isChecking && (
                <div className="px-3">
                  <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
                </div>
              )}
              {!isChecking && availabilityStatus === 'available' && (
                <div className="px-3">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
              )}
              {!isChecking && (availabilityStatus === 'taken' || availabilityStatus === 'invalid') && (
                <div className="px-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
          </div>

          {availabilityMessage && (
            <p className={cn(
              'text-sm font-medium flex items-center gap-1.5',
              availabilityStatus === 'available' && 'text-emerald-600',
              availabilityStatus === 'taken' && 'text-red-600',
              availabilityStatus === 'invalid' && 'text-orange-600'
            )}>
              {availabilityStatus === 'available' && <Check className="w-4 h-4" />}
              {(availabilityStatus === 'taken' || availabilityStatus === 'invalid') && <AlertCircle className="w-4 h-4" />}
              {availabilityMessage}
            </p>
          )}

          <p className="text-xs text-stone-400">
            Only lowercase letters, numbers, and hyphens. No spaces or special characters.
          </p>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-stone-800 mb-2">Choose Your Template</h3>
        <p className="text-stone-500">
          Select a design that matches your personal style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => updateFormData({ template: template.id })}
            className={cn(
              'relative rounded-2xl border-2 p-6 text-left transition-all duration-300',
              formData.template === template.id
                ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100'
                : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
            )}
          >
            {formData.template === template.id && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="mb-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  formData.template === template.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone-100 text-stone-600'
                )}
              >
                {template.icon}
              </div>
            </div>

            <h4 className="text-lg font-bold text-stone-800 mb-1">{template.name}</h4>
            <p className="text-sm text-stone-500 mb-4">{template.description}</p>

            <div className="flex gap-2 mb-4">
              {template.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border border-stone-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <ul className="space-y-1">
              {template.features.map((feature) => (
                <li key={feature} className="text-xs text-stone-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-stone-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-stone-200">
        <label className="flex items-start gap-4 p-4 rounded-2xl border-2 border-stone-200 hover:border-stone-300 bg-white cursor-pointer transition-all">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              formData.is_public ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600'
            )}
          >
            <Globe className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-stone-800">Let others explore my portfolio</p>
            <p className="text-sm text-stone-500 mt-0.5">
              When enabled, your portfolio appears in the Explore directory so others can discover you. You can always change this later.
            </p>
            <button
              type="button"
              onClick={() => updateFormData({ is_public: !formData.is_public })}
              className={cn(
                'mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                formData.is_public
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {formData.is_public ? 'Enabled – visible in Explore' : 'Disabled – only viewable by link'}
            </button>
          </div>
        </label>
      </div>
    </div>
  );
}
