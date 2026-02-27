'use client';

import { useFormContext } from './FormContext';
import { TemplateType } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Briefcase, Globe } from 'lucide-react';

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

export function StepTemplate() {
  const { formData, updateFormData } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-stone-800 mb-2">Choose Your Template</h3>
        <p className="text-stone-500">
          Select a design that matches your personal style. You can change this anytime.
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

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white text-sm">?</span>
        </div>
        <div>
          <p className="text-sm font-bold text-stone-800">Not sure which to choose?</p>
          <p className="text-sm text-stone-600">
            Minimal works great for most creators. Professional gives a stronger dark visual identity.
            You can switch anytime after generating.
          </p>
        </div>
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
