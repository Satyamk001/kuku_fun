'use client';

import { useEffect, useState } from 'react';

interface ColdStartLoaderProps {
  onComplete: () => void;
  isLoading: boolean;
}

export function ColdStartLoader({ onComplete, isLoading }: ColdStartLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Loading your workspace...');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Instantly jump to 100% when loading completes
      setProgress(100);
      setMessage('All set!');

      // Fade out after a brief moment
      const fadeTimeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade animation
      }, 500);

      return () => clearTimeout(fadeTimeout);
    }

    // Reset when loading starts
    setProgress(0);
    setIsVisible(true);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Never exceed 95% automatically

        // Variable speed based on current progress
        let increment: number;
        if (prev < 30) {
          increment = 2; // Fast to 30%
        } else if (prev < 70) {
          increment = 0.8; // Medium to 70%
        } else {
          increment = 0.3; // Crawl to 90%
        }

        return Math.min(prev + increment, 95);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  // Update message based on progress
  useEffect(() => {
    if (progress < 20) {
      setMessage('Loading your workspace...');
    } else if (progress < 40) {
      setMessage('Syncing messages...');
    } else if (progress < 60) {
      setMessage('Preparing your conversations...');
    } else if (progress < 80) {
      setMessage('Syncing users...');
    } else if (progress < 95) {
      setMessage('Almost ready...');
    } else if (progress === 100) {
      setMessage('All set!');
    }
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        progress === 100 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-md px-8">
        {/* Logo or Icon */}
        <div className="mb-8 flex justify-center">
          <div className="h-16 w-16 animate-pulse rounded-full bg-primary/20 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary animate-ping" />
          </div>
        </div>

        {/* Status Message */}
        <p className="mb-4 text-center text-sm font-medium text-muted-foreground transition-all duration-300">
          {message}
        </p>

        {/* Progress Bar Container */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          {/* Progress Bar Fill */}
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Percentage Display */}
        <p className="mt-3 text-center text-xs text-muted-foreground tabular-nums">
          {Math.round(progress)}%
        </p>

        {/* Helpful Tip */}
        {progress < 95 && (
          <p className="mt-6 text-center text-xs text-muted-foreground/60 animate-fade-in">
            Setting up your experience...
          </p>
        )}
      </div>
    </div>
  );
}
