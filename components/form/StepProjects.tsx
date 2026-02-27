'use client';

import { useFormContext } from './FormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { cropAndResizeImage } from '@/lib/image-processing';
import {
  Plus,
  Trash2,
  GripVertical,
  Star,
  Upload,
  Github,
  ExternalLink,
  X,
  FolderGit2,
} from 'lucide-react';
import { useState, KeyboardEvent } from 'react';
import { toast } from 'sonner';

export function StepProjects() {
  const { formData, addProject, removeProject, updateProject, reorderProjects } = useFormContext();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [techInput, setTechInput] = useState<Record<string, string>>({});

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    projectId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimized = await cropAndResizeImage(file, {
        aspectRatio: 16 / 9,
        width: 1600,
        height: 900,
      });
      // Clear the URL when new file is selected so it shows the new preview
      updateProject(projectId, { cover_image: optimized, cover_image_url: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to process image.');
    }
  };

  const addTechStack = (projectId: string, tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed) return;

    const project = formData.projects.find((p) => p.id === projectId);
    if (!project) return;
    if (project.tech_stack.includes(trimmed)) return;

    updateProject(projectId, { tech_stack: [...project.tech_stack, trimmed] });
    setTechInput((prev) => ({ ...prev, [projectId]: '' }));
  };

  const removeTechStack = (projectId: string, tech: string) => {
    const project = formData.projects.find((p) => p.id === projectId);
    if (!project) return;

    updateProject(projectId, {
      tech_stack: project.tech_stack.filter((t) => t !== tech),
    });
  };

  const handleTechKeyDown = (e: KeyboardEvent<HTMLInputElement>, projectId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechStack(projectId, techInput[projectId] || '');
    }
  };

  const handleFeaturedChange = (projectId: string, isFeatured: boolean) => {
    // If setting as featured, unfeature all others
    if (isFeatured) {
      formData.projects.forEach((p) => {
        if (p.id !== projectId && p.is_featured) {
          updateProject(p.id, { is_featured: false });
        }
      });
    }
    updateProject(projectId, { is_featured: isFeatured });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-800">Projects</h3>
          <p className="text-sm text-stone-500">
            {formData.projects.length}/10 projects added
          </p>
        </div>
        <Button
          onClick={addProject}
          disabled={formData.projects.length >= 10}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {formData.projects.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
          <FolderGit2 className="w-16 h-16 mx-auto mb-4 text-stone-300" />
          <h4 className="text-lg font-bold text-stone-700 mb-2">No projects yet</h4>
          <p className="text-stone-500 mb-4">Add your first project to showcase your work</p>
          <Button onClick={addProject} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {formData.projects.map((project, index) => (
              <div
                key={project.id}
                draggable
                onDragStart={() => setDraggingId(project.id)}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggingId && draggingId !== project.id) {
                    const dragIndex = formData.projects.findIndex((p) => p.id === draggingId);
                    const hoverIndex = index;
                    if (dragIndex !== hoverIndex) {
                      reorderProjects(dragIndex, hoverIndex);
                    }
                  }
                }}
                className={cn(
                  'bg-white rounded-2xl border-2 p-6 transition-all',
                  draggingId === project.id && 'opacity-50 scale-[1.02] shadow-xl',
                  project.is_featured
                    ? 'border-orange-300 shadow-lg shadow-orange-100'
                    : 'border-stone-200 hover:border-stone-300'
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 bg-stone-100 rounded-lg cursor-move hover:bg-stone-200 transition-colors"
                      onMouseDown={() => setDraggingId(project.id)}
                    >
                      <GripVertical className="w-4 h-4 text-stone-400" />
                    </div>
                    <span className="text-sm font-bold text-stone-400">#{index + 1}</span>
                    {project.is_featured && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <Star className="w-3 h-3 mr-1 fill-orange-500" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                      <Label htmlFor={`featured-${project.id}`} className="text-sm text-stone-600">
                        Featured
                      </Label>
                      <Switch
                        id={`featured-${project.id}`}
                        checked={project.is_featured}
                        onCheckedChange={(checked) => handleFeaturedChange(project.id, checked)}
                      />
                    </div>
                    <button
                      onClick={() => removeProject(project.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input
                      value={project.name}
                      onChange={(e) => updateProject(project.id, { name: e.target.value })}
                      placeholder="Neural Network Market Forecast"
                      className="bg-stone-50"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div className="mb-4">
                  <Label className="mb-2 block">Cover Image</Label>
                  <label className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-dashed border-stone-300 hover:border-orange-500/50 cursor-pointer group">
                    <div className="size-20 rounded-lg bg-white flex items-center justify-center border border-stone-200 overflow-hidden">
                      {project.cover_image ? (
                        <img
                          src={URL.createObjectURL(project.cover_image)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : project.cover_image_url ? (
                        <img
                          src={project.cover_image_url}
                          alt="Current"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-stone-400 group-hover:text-orange-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-600">
                        {project.cover_image ? 'Change Cover Image' : project.cover_image_url ? 'Change Current Cover' : 'Upload Cover Image'}
                      </p>
                      <p className="text-xs text-stone-400">Auto-cropped to 16:9 and resized</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, project.id)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <Label className="mb-2 block">Description</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, { description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={3}
                    maxLength={800}
                    className={cn(
                      'bg-stone-50 resize-none',
                      project.description.length > 760 && 'border-orange-500 focus:border-orange-500'
                    )}
                  />
                  <p
                    className={cn(
                      'text-xs text-right mt-1',
                      project.description.length > 760 ? 'text-orange-500' : 'text-stone-400'
                    )}
                  >
                    {project.description.length}/800
                  </p>
                </div>

                {/* Tech Stack */}
                <div className="mb-4">
                  <Label className="mb-2 block">Tech Stack</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.tech_stack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeTechStack(project.id, tech)}
                      >
                        {tech}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    value={techInput[project.id] || ''}
                    onChange={(e) =>
                      setTechInput((prev) => ({ ...prev, [project.id]: e.target.value }))
                    }
                    onKeyDown={(e) => handleTechKeyDown(e, project.id)}
                    placeholder="Add technology and press Enter..."
                    className="bg-stone-50"
                  />
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub URL
                    </Label>
                    <Input
                      value={project.github_url}
                      onChange={(e) => updateProject(project.id, { github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="bg-stone-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Demo URL (optional)
                    </Label>
                    <Input
                      value={project.demo_url}
                      onChange={(e) => updateProject(project.id, { demo_url: e.target.value })}
                      placeholder="https://..."
                      className="bg-stone-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
