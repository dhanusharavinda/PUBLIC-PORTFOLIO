'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crop, RotateCcw, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  imageFile: File | null;
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedFile: File) => void;
  aspectRatio?: number;
}

export function ImageCropper({
  imageFile,
  isOpen,
  onClose,
  onCrop,
  aspectRatio = 1,
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image when file changes
  if (imageFile && !imageSrc) {
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(imageFile);
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleCrop = useCallback(() => {
    if (!imageSrc || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const cropWidth = containerRect.width;
      const cropHeight = containerRect.height;

      // Set canvas size to match crop area
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Calculate the source rectangle
      const scaleX = img.naturalWidth / (cropWidth * scale);
      const scaleY = img.naturalHeight / (cropHeight * scale);

      const sourceX = -position.x * scaleX;
      const sourceY = -position.y * scaleY;
      const sourceWidth = cropWidth * scaleX;
      const sourceHeight = cropHeight * scaleY;

      // Fill with white background first
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image
      ctx.drawImage(
        img,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(sourceWidth, img.naturalWidth),
        Math.min(sourceHeight, img.naturalHeight),
        Math.max(0, -position.x / scale),
        Math.max(0, -position.y / scale),
        cropWidth,
        cropHeight
      );

      // Convert to file
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          onCrop(croppedFile);
          onClose();
          // Reset state
          setImageSrc(null);
          setScale(1);
          setPosition({ x: 0, y: 0 });
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = imageSrc;
  }, [imageSrc, position, scale, onCrop, onClose]);

  const cropAreaStyle = aspectRatio === 1
    ? { width: '300px', height: '300px' }
    : aspectRatio === 16 / 9
    ? { width: '400px', height: '225px' }
    : { width: '300px', height: '300px' };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Crop & Resize Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Crop Area */}
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative overflow-hidden border-2 border-dashed border-stone-300 rounded-lg bg-stone-100 cursor-move"
              style={cropAreaStyle}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {imageSrc && (
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className="absolute select-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    minWidth: '100%',
                    minHeight: '100%',
                    objectFit: 'cover',
                  }}
                  draggable={false}
                />
              )}
              <div className="absolute inset-0 pointer-events-none border-2 border-orange-500/50">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-stone-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>

          <p className="text-xs text-center text-stone-500">
            Drag to move, use zoom buttons to resize
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCrop}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={!imageSrc}
            >
              <Check className="w-4 h-4 mr-1" />
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
