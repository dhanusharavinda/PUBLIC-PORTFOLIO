'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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

function getCropSize(aspectRatio: number) {
  if (aspectRatio === 16 / 9) return { width: 400, height: 225 };
  return { width: 300, height: 300 };
}

export function ImageCropper({
  imageFile,
  isOpen,
  onClose,
  onCrop,
  aspectRatio = 1,
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1); // user zoom multiplier
  const [baseScale, setBaseScale] = useState(1); // fit-to-cover scale
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropSize = getCropSize(aspectRatio);

  const clampPosition = useCallback(
    (next: { x: number; y: number }, zoom: number) => {
      if (!naturalSize.width || !naturalSize.height) return next;

      const displayScale = baseScale * zoom;
      const displayedWidth = naturalSize.width * displayScale;
      const displayedHeight = naturalSize.height * displayScale;

      const minX = cropSize.width - displayedWidth;
      const minY = cropSize.height - displayedHeight;

      return {
        x: Math.min(0, Math.max(minX, next.x)),
        y: Math.min(0, Math.max(minY, next.y)),
      };
    },
    [baseScale, cropSize.height, cropSize.width, naturalSize.height, naturalSize.width]
  );

  useEffect(() => {
    if (!imageFile) {
      setImageSrc(null);
      setNaturalSize({ width: 0, height: 0 });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const coverScale = Math.max(cropSize.width / img.naturalWidth, cropSize.height / img.naturalHeight);
        const initialX = (cropSize.width - img.naturalWidth * coverScale) / 2;
        const initialY = (cropSize.height - img.naturalHeight * coverScale) / 2;

        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setImageSrc(src);
        setBaseScale(coverScale);
        setScale(1);
        setPosition({ x: initialX, y: initialY });
      };
      img.src = src;
    };
    reader.readAsDataURL(imageFile);
  }, [cropSize.height, cropSize.width, imageFile]);

  useEffect(() => {
    setPosition((prev) => clampPosition(prev, scale));
  }, [clampPosition, scale]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position.x, position.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const next = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPosition(clampPosition(next, scale));
    },
    [clampPosition, dragStart.x, dragStart.y, isDragging, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5));

  const handleReset = () => {
    const initialX = (cropSize.width - naturalSize.width * baseScale) / 2;
    const initialY = (cropSize.height - naturalSize.height * baseScale) / 2;
    setScale(1);
    setPosition({ x: initialX, y: initialY });
  };

  const handleCrop = useCallback(() => {
    if (!imageSrc || !naturalSize.width || !naturalSize.height) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const output =
      aspectRatio === 16 / 9
        ? { width: 1600, height: 900 }
        : { width: 800, height: 800 };

    canvas.width = output.width;
    canvas.height = output.height;

    const img = new Image();
    img.onload = () => {
      const displayScale = baseScale * scale;

      const sourceX = Math.max(0, -position.x / displayScale);
      const sourceY = Math.max(0, -position.y / displayScale);
      const sourceWidth = Math.min(naturalSize.width - sourceX, cropSize.width / displayScale);
      const sourceHeight = Math.min(naturalSize.height - sourceY, cropSize.height / displayScale);

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        output.width,
        output.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          onCrop(croppedFile);
          onClose();
        },
        'image/jpeg',
        0.95
      );
    };
    img.src = imageSrc;
  }, [
    aspectRatio,
    baseScale,
    cropSize.height,
    cropSize.width,
    imageSrc,
    naturalSize.height,
    naturalSize.width,
    onClose,
    onCrop,
    position.x,
    position.y,
    scale,
  ]);

  const displayedWidth = naturalSize.width * baseScale * scale;
  const displayedHeight = naturalSize.height * baseScale * scale;

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
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative overflow-hidden border-2 border-dashed border-stone-300 rounded-lg bg-stone-100 cursor-grab active:cursor-grabbing"
              style={{ width: cropSize.width, height: cropSize.height }}
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
                  className="absolute select-none pointer-events-none max-w-none"
                  style={{
                    width: displayedWidth,
                    height: displayedHeight,
                    transform: `translate(${position.x}px, ${position.y}px)`,
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

          <div className="flex items-center justify-center gap-4">
            <Button type="button" variant="outline" size="sm" onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-stone-600 min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
            <Button type="button" variant="outline" size="sm" onClick={handleZoomIn} disabled={scale >= 3}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>

          <p className="text-xs text-center text-stone-500">Drag to position, zoom to resize. Saved output matches this crop area.</p>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCrop} className="bg-orange-500 hover:bg-orange-600" disabled={!imageSrc}>
              <Check className="w-4 h-4 mr-1" />
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
