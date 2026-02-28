'use client';

import { useFormContext } from './FormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus, Trash2, GripVertical, Briefcase } from 'lucide-react';
import { useState } from 'react';

export function StepExperience() {
  const { formData, addExperience, removeExperience, updateExperience, reorderExperiences } = useFormContext();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Month inputs use YYYY-MM format directly, no conversion needed
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    // If already in YYYY-MM format, return as-is
    if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr;
    // If in YYYY-MM-DD format, extract YYYY-MM
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr.slice(0, 7);
    return dateStr;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-800">Experience</h3>
          <p className="text-sm text-stone-500">
            {formData.experiences.length}/5 experiences added
          </p>
        </div>
        <Button
          onClick={addExperience}
          disabled={formData.experiences.length >= 5}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {formData.experiences.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h4 className="text-lg font-bold text-stone-700 mb-2">No experience yet</h4>
          <p className="text-stone-500 mb-4">Add your work experience to showcase your career</p>
          <Button
            onClick={addExperience}
            disabled={formData.experiences.length >= 5}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {formData.experiences.map((experience, index) => (
              <div
                key={experience.id}
                draggable
                onDragStart={() => setDraggingId(experience.id)}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggingId && draggingId !== experience.id) {
                    const dragIndex = formData.experiences.findIndex((e) => e.id === draggingId);
                    const hoverIndex = index;
                    if (dragIndex !== hoverIndex) {
                      reorderExperiences(dragIndex, hoverIndex);
                    }
                  }
                }}
                className={cn(
                  'bg-white rounded-2xl border-2 p-6 transition-all',
                  draggingId === experience.id && 'opacity-50 scale-[1.02] shadow-xl',
                  'border-stone-200 hover:border-stone-300'
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 bg-stone-100 rounded-lg cursor-move hover:bg-stone-200 transition-colors"
                      onMouseDown={() => setDraggingId(experience.id)}
                    >
                      <GripVertical className="w-4 h-4 text-stone-400" />
                    </div>
                    <span className="text-sm font-bold text-stone-400">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <Label htmlFor={`current-${experience.id}`} className="text-sm text-stone-600">
                        Current
                      </Label>
                      <Switch
                        id={`current-${experience.id}`}
                        checked={experience.is_current}
                        onCheckedChange={(checked) =>
                          updateExperience(experience.id, { is_current: checked, end_date: checked ? '' : experience.end_date })
                        }
                      />
                    </div>
                    <button
                      onClick={() => removeExperience(experience.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={experience.company}
                      onChange={(e) => updateExperience(experience.id, { company: e.target.value })}
                      placeholder="Acme Corporation"
                      className="bg-stone-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={experience.role}
                      onChange={(e) => updateExperience(experience.id, { role: e.target.value })}
                      placeholder="Senior Developer"
                      className="bg-stone-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={experience.location}
                      onChange={(e) => updateExperience(experience.id, { location: e.target.value })}
                      placeholder="New York, NY"
                      className="bg-stone-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={formatDateForInput(experience.start_date)}
                      onChange={(e) => updateExperience(experience.id, { start_date: e.target.value })}
                      className="bg-stone-50"
                    />
                  </div>
                </div>

                {!experience.is_current && (
                  <div className="mb-4">
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={formatDateForInput(experience.end_date)}
                        onChange={(e) => updateExperience(experience.id, { end_date: e.target.value })}
                        className="bg-stone-50"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={experience.description}
                    onChange={(e) => updateExperience(experience.id, { description: e.target.value })}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={3}
                    maxLength={800}
                    className={cn(
                      'bg-stone-50 resize-none',
                      experience.description.length > 760 && 'border-orange-500 focus:border-orange-500'
                    )}
                  />
                  <p
                    className={cn(
                      'text-xs text-right',
                      experience.description.length > 760 ? 'text-orange-500' : 'text-stone-400'
                    )}
                  >
                    {experience.description.length}/800
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
