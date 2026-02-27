'use client';

import { useFormContext } from './FormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Upload, FileText, Linkedin, Github, Briefcase, MapPin, Mail, User } from 'lucide-react';
import { cropAndResizeImage } from '@/lib/image-processing';
import { toast } from 'sonner';

export function StepPersonal() {
  const { formData, updateFormData } = useFormContext();
  const bioWordCount = formData.bio.trim().split(/\s+/).filter(Boolean).length;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'resume'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (type === 'profile') {
          const optimized = await cropAndResizeImage(file, {
            aspectRatio: 1,
            width: 800,
            height: 800,
          });
          // Clear the URL when new file is selected
          updateFormData({ profile_photo: optimized, profile_photo_url: '' });
        } else {
          updateFormData({ resume: file, resume_url: '' });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to process the selected file.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name *
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => updateFormData({ full_name: e.target.value })}
            placeholder="Alex Rivera"
            className="bg-stone-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_title" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Job Title *
          </Label>
          <Input
            id="job_title"
            value={formData.job_title}
            onChange={(e) => updateFormData({ job_title: e.target.value })}
            placeholder="Senior Data Scientist"
            className="bg-stone-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline">Professional Tagline</Label>
        <Input
          id="tagline"
          value={formData.tagline}
          onChange={(e) => updateFormData({ tagline: e.target.value })}
          placeholder="Turning complex data into actionable insights"
          maxLength={100}
          className="bg-stone-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
        />
        <p className="text-xs text-stone-400 text-right">{formData.tagline.length}/100</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio *</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => updateFormData({ bio: e.target.value })}
          placeholder="Briefly describe your expertise and passion..."
          rows={4}
          className="bg-stone-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 resize-none"
        />
        <p className={cn(
          'text-xs text-right',
          bioWordCount > 360 ? 'text-orange-500' : 'text-stone-400'
        )}>
          {bioWordCount}/400 words
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="alex@example.com"
            className="bg-stone-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            placeholder="San Francisco, CA"
            className="bg-stone-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Profile Photo
          </Label>
          <label className="flex items-center gap-4 p-2 bg-stone-50 rounded-2xl border border-dashed border-stone-300 hover:border-orange-500/50 transition-colors cursor-pointer group">
            <div className="size-14 rounded-xl bg-white flex items-center justify-center border border-stone-200 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              {formData.profile_photo ? (
                <img
                  src={URL.createObjectURL(formData.profile_photo)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : formData.profile_photo_url ? (
                <img
                  src={formData.profile_photo_url}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-5 h-5 text-stone-400 group-hover:text-orange-500" />
              )}
            </div>
            <span className="text-sm font-bold text-stone-500 group-hover:text-orange-500">
              {formData.profile_photo ? 'Change Image' : formData.profile_photo_url ? 'Change Current Image' : 'Upload Image'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'profile')}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resume (PDF)
          </Label>
          <label className="flex items-center gap-4 p-2 bg-stone-50 rounded-2xl border border-dashed border-stone-300 hover:border-orange-500/50 transition-colors cursor-pointer group">
            <div className="size-14 rounded-xl bg-white flex items-center justify-center border border-stone-200 shadow-sm group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-stone-400 group-hover:text-orange-500" />
            </div>
            <span className="text-sm font-bold text-stone-500 group-hover:text-orange-500">
              {formData.resume ? formData.resume.name : 'Upload Resume'}
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e, 'resume')}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin_url" className="flex items-center gap-2">
            <Linkedin className="w-4 h-4" />
            LinkedIn URL
          </Label>
          <Input
            id="linkedin_url"
            value={formData.linkedin_url}
            onChange={(e) => updateFormData({ linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/..."
            className="bg-stone-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_username" className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            GitHub Username
          </Label>
          <Input
            id="github_username"
            value={formData.github_username}
            onChange={(e) => updateFormData({ github_username: e.target.value })}
            placeholder="alexrivera"
            className="bg-stone-50 border-transparent focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-stone-100 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-green-500 text-white flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">Open to Work</p>
              <p className="text-xs text-stone-500">Show a badge on your profile</p>
            </div>
          </div>
          <Switch
            checked={formData.open_to_work}
            onCheckedChange={(checked) => updateFormData({ open_to_work: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-5 bg-stone-100 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-purple-500 text-white flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">Availability Status</p>
              <p className="text-xs text-stone-500">Let others know your availability</p>
            </div>
          </div>
          <Select
            value={formData.availability_status}
            onValueChange={(value) =>
              updateFormData({ availability_status: value as typeof formData.availability_status })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open_fulltime">Open to Full-time</SelectItem>
              <SelectItem value="freelance">Available for Freelance</SelectItem>
              <SelectItem value="not_looking">Not Looking</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
