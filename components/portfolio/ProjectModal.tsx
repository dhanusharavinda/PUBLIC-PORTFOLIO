'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Project } from '@/types/portfolio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Image from 'next/image';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  template?: 'minimal' | 'professional';
}

export function ProjectModal({
  project,
  isOpen,
  onClose,
  template = 'minimal',
}: ProjectModalProps) {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="w-[97vw] max-w-[1200px] sm:max-w-[1200px] p-0 overflow-hidden bg-white rounded-2xl"
      >
        <VisuallyHidden>
          <DialogTitle>{project.name}</DialogTitle>
        </VisuallyHidden>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid lg:grid-cols-2 max-h-[92vh] lg:max-h-[88vh]">
          {/* Thumbnail — shown in full (no cropping) */}
          <div className="relative bg-stone-50 flex items-center justify-center lg:h-full min-h-[240px] sm:min-h-[320px] p-3 sm:p-4">
            {project.cover_image_url ? (
              <Image
                src={project.cover_image_url}
                alt={project.name}
                width={1600}
                height={900}
                sizes="(max-width: 1024px) 97vw, 600px"
                quality={90}
                priority
                className="w-full h-auto max-h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center text-stone-400">
                No image
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col overflow-y-auto">
            <div className="flex-1">
              <Badge
                className={cn(
                  'mb-4',
                  template === 'minimal' && 'bg-[#8FAF8F]/10 text-[#8FAF8F]',
                  template === 'professional' && 'bg-[#0f2b2a] text-[#4fd1c5]'
                )}
              >
                Project Details
              </Badge>

              <h3 className="text-2xl font-bold mb-2">{project.name}</h3>

              <p className="text-stone-600 leading-relaxed mb-6 whitespace-pre-wrap">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech_stack?.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className={cn(
                      template === 'minimal' && 'bg-stone-100 text-stone-700',
                      template === 'professional' && 'bg-[#0f2b2a] text-[#4fd1c5] font-mono'
                    )}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
              {project.github_url && (
                <Button variant="outline" className="flex-1" asChild>
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                  </a>
                </Button>
              )}
              {project.demo_url && (
                <Button className={cn(
                  'flex-1',
                  template === 'minimal' && 'bg-[#8FAF8F] hover:bg-[#7a9a7a]',
                  template === 'professional' && 'bg-[#0f2b2a] hover:bg-[#123d3a]'
                )} asChild>
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
