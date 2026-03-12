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
import { ImageCropper } from '@/components/ui/image-cropper';
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
  Crop,
} from 'lucide-react';
import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Component to handle project image preview with proper URL cleanup
function ProjectImagePreview({ project }: { project: { id: string; cover_image: File | null; cover_image_url: string } }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const prevFileRef = useRef<File | null>(null);

  useEffect(() => {
    // Only create new URL if file changed
    if (project.cover_image && project.cover_image !== prevFileRef.current) {
      // Revoke previous URL if exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(project.cover_image);
      setPreviewUrl(url);
      prevFileRef.current = project.cover_image;
    } else if (!project.cover_image) {
      // Clear preview if file removed
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      prevFileRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [project.cover_image]);

  if (previewUrl) {
    return <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />;
  }
  if (project.cover_image_url) {
    return <img src={project.cover_image_url} alt="Current" className="w-full h-full object-cover" />;
  }
  return <Upload className="w-6 h-6 text-stone-400" />;
}

export function StepProjects() {
  const { formData, addProject, removeProject, updateProject, reorderProjects } = useFormContext();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [techInput, setTechInput] = useState<Record<string, string>>({});

  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperProjectId, setCropperProjectId] = useState<string | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    projectId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Open cropper for cover image
    setCropperFile(file);
    setCropperProjectId(projectId);
    setCropperOpen(true);
  };

  const handleCrop = (croppedFile: File) => {
    if (cropperProjectId) {
      updateProject(cropperProjectId, { cover_image: croppedFile, cover_image_url: '' });
    }
    setCropperFile(null);
    setCropperProjectId(null);
  };

  const handleAutoCrop = async () => {
    if (!cropperFile || !cropperProjectId) return;
    try {
      const optimized = await cropAndResizeImage(cropperFile, {
        aspectRatio: 16 / 9,
        width: 1600,
        height: 900,
      });
      updateProject(cropperProjectId, { cover_image: optimized, cover_image_url: '' });
      setCropperOpen(false);
      setCropperFile(null);
      setCropperProjectId(null);
    } catch (error) {
      toast.error('Auto-crop failed. Please try manual crop.');
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
                draggable={!cropperOpen}
                onDragStart={(e) => {
                  setDraggingId(project.id);
                  e.dataTransfer.effectAllowed = 'move';
                  // Add a ghost image offset for better UX
                  e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (draggingId && draggingId !== project.id) {
                    setDragOverId(project.id);
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOverId(null);
                }}
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
                  'bg-white rounded-2xl border-2 p-6 transition-all duration-200',
                  draggingId === project.id && 'opacity-50 scale-[1.02] shadow-xl cursor-grabbing',
                  dragOverId === project.id && draggingId !== project.id && 'border-orange-400 shadow-lg scale-[1.01]',
                  project.is_featured
                    ? 'border-orange-300 shadow-lg shadow-orange-100'
                    : 'border-stone-200 hover:border-stone-300',
                  !cropperOpen && 'cursor-grab'
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        draggingId === project.id
                          ? 'bg-orange-200 cursor-grabbing'
                          : 'bg-stone-100 cursor-grab hover:bg-stone-200 active:bg-orange-100'
                      )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateProject(project.id, { name: e.target.value })}
                        placeholder="Neural Network Market Forecast"
                        className="bg-stone-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Label <span className="text-stone-400 font-normal">(optional)</span></Label>
                      <Input
                        value={project.label}
                        onChange={(e) => updateProject(project.id, { label: e.target.value })}
                        placeholder="e.g. Side Projects, Client Work"
                        className="bg-stone-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="mb-4">
                  <Label className="mb-2 block">Cover Image</Label>
                  <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                    <div className="size-20 rounded-lg bg-white flex items-center justify-center border border-stone-200 overflow-hidden">
                      <ProjectImagePreview project={{ ...project, cover_image: project.cover_image ?? null }} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-stone-600 hover:text-orange-500 transition-colors cursor-pointer">
                        {project.cover_image ? 'Change Cover Image' : project.cover_image_url ? 'Change Cover' : 'Upload Cover Image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, project.id)}
                          className="hidden"
                        />
                      </label>
                      {cropperFile && cropperProjectId === project.id && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCropperOpen(true)}
                            className="text-xs flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium"
                          >
                            <Crop className="w-3 h-3" />
                            Manual Crop
                          </button>
                          <span className="text-xs text-stone-300">|</span>
                          <button
                            type="button"
                            onClick={handleAutoCrop}
                            className="text-xs text-stone-500 hover:text-orange-500"
                          >
                            Auto-crop
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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

      {/* Image Cropper Modal */}
      <ImageCropper
        imageFile={cropperFile}
        isOpen={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setCropperFile(null);
          setCropperProjectId(null);
        }}
        onCrop={handleCrop}
        aspectRatio={16 / 9}
      />
    </div>
  );
}
