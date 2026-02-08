/**
 * Contrôles de navigation pour le Wrapped
 * Phase 4 - Module Wrapped - UI
 */

'use client';

import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight, Share2, Download } from 'lucide-react';

interface WrappedControlsProps {
  isPlaying: boolean;
  currentScene: number;
  totalScenes: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function WrappedControls({
  isPlaying,
  currentScene,
  totalScenes,
  onPlayPause,
  onNext,
  onPrevious,
  onShare,
  onDownload,
  canGoNext,
  canGoPrevious,
}: WrappedControlsProps) {
  return (
    <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation controls */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlayPause}
              className="text-white hover:bg-white/20 h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>

            <span className="text-white text-sm">
              {currentScene} / {totalScenes}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!canGoNext}
            className="text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          {onShare && (
            <Button
              variant="outline"
              onClick={onShare}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          )}

          {onDownload && (
            <Button
              variant="outline"
              onClick={onDownload}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
