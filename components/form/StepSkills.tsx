'use client';

import { useState, KeyboardEvent } from 'react';
import { useFormContext } from './FormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skill } from '@/types/portfolio';

const categories = ['Languages', 'Tools', 'Frameworks', 'Other'] as const;

const suggestedSkills = [
  'Python', 'R', 'SQL', 'JavaScript', 'Java',
  'Tableau', 'Power BI', 'Looker', 'D3.js',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes',
  'Spark', 'Hadoop', 'Kafka', 'Airflow', 'dbt',
  'Snowflake', 'PostgreSQL', 'MongoDB', 'Redis',
];

export function StepSkills() {
  const { formData, updateSkills } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Skill['category']>('Languages');

  const addSkill = (name: string, category: Skill['category'] = selectedCategory) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (formData.skills.length >= 30) return;
    if (formData.skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;

    updateSkills([...formData.skills, { name: trimmed, category }]);
    setInputValue('');
  };

  const removeSkill = (name: string) => {
    updateSkills(formData.skills.filter((s) => s.name !== name));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const groupedSkills = formData.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-orange-500" />
          Add Your Skills
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter..."
              className="bg-white border-stone-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={(v) => setSelectedCategory(v as Skill['category'])}
          >
            <SelectTrigger className="w-full sm:w-[160px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => addSkill(inputValue)}
            disabled={!inputValue.trim() || formData.skills.length >= 30}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          {formData.skills.length}/30 skills added
        </p>

        {/* Suggested Skills */}
        <div className="mb-6">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
            Suggested Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills
              .filter((s) => !formData.skills.some((fs) => fs.name.toLowerCase() === s.toLowerCase()))
              .slice(0, 12)
              .map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill, 'Other')}
                  className="px-3 py-1.5 bg-white border border-stone-200 rounded-full text-sm text-stone-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>

        {/* Added Skills */}
        {formData.skills.length > 0 && (
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Your Skills
            </p>
            <div className="space-y-3">
              {categories.map((category) => {
                const skills = groupedSkills[category] || [];
                if (skills.length === 0) return null;

                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-stone-500 mb-2">{category}</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill.name}
                          variant="secondary"
                          className={cn(
                            'px-3 py-1.5 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity',
                            category === 'Languages' && 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                            category === 'Tools' && 'bg-green-100 text-green-700 hover:bg-green-200',
                            category === 'Frameworks' && 'bg-purple-100 text-purple-700 hover:bg-purple-200',
                            category === 'Other' && 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          )}
                          onClick={() => removeSkill(skill.name)}
                        >
                          {skill.name}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {formData.skills.length === 0 && (
        <div className="text-center py-12 text-stone-400">
          <Wand2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Add skills to showcase your expertise</p>
          <p className="text-sm mt-1">Type a skill name and press Enter</p>
        </div>
      )}
    </div>
  );
}
