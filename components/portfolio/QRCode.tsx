'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QRCodeProps {
  url: string;
  className?: string;
  size?: number;
}

export function QRCodeComponent({ url, className, size = 128 }: QRCodeProps) {
  const [expanded, setExpanded] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement('a');
      link.download = 'portfolio-qr-code.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-stone-500 hover:text-orange-500 transition-colors mb-3"
      >
        <QrCode className="w-5 h-5" />
        <span className="font-medium">Share via QR</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-lg">
          <QRCodeSVG
            ref={qrRef}
            value={url}
            size={size}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="w-full mt-3"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
}
