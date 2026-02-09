'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './button';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | null;
  alt?: string;
}

export function ImageModal({ isOpen, onClose, src, alt = 'Image' }: ImageModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 text-white hover:bg-white/20 z-[101]"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      <div 
        className={`relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg shadow-2xl transition-transform duration-300 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {src && (
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        )}
      </div>
    </div>
  );
}
