/**
 * Animation de séquence Wrapped (style Spotify Wrapped)
 * Phase 4 - Module Wrapped - UI
 */

'use client';

import { useState, useEffect } from 'react';
import { WrappedData } from '@/modules/wrapped/types';
import { WrappedSceneComponent } from './WrappedScene';
import { WrappedControls } from './WrappedControls';

interface WrappedAnimationProps {
  data: WrappedData;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function WrappedAnimation({
  data,
  autoPlay = false,
  onComplete,
}: WrappedAnimationProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);

  const SCENE_DURATION = 3000; // 3 seconds per scene

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next scene
          if (currentSceneIndex < data.scenes.length - 1) {
            setCurrentSceneIndex((prev) => prev + 1);
            return 0;
          } else {
            // Animation complete
            setIsPlaying(false);
            if (onComplete) onComplete();
            return 100;
          }
        }
        return prev + (100 / SCENE_DURATION) * 50; // Update every 50ms
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIndex, data.scenes.length, onComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentSceneIndex < data.scenes.length - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleSceneSelect = (index: number) => {
    setCurrentSceneIndex(index);
    setProgress(0);
  };

  const currentScene = data.scenes[currentSceneIndex];

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-4">
        {data.scenes.map((scene, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
            onClick={() => handleSceneSelect(index)}
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width:
                  index < currentSceneIndex
                    ? '100%'
                    : index === currentSceneIndex
                    ? `${progress}%`
                    : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Scene content */}
      <div className="w-full h-full">
        {currentScene && (
          <WrappedSceneComponent
            scene={currentScene}
            theme={data.theme}
            isActive={true}
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <WrappedControls
          isPlaying={isPlaying}
          currentScene={currentSceneIndex + 1}
          totalScenes={data.scenes.length}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={currentSceneIndex < data.scenes.length - 1}
          canGoPrevious={currentSceneIndex > 0}
        />
      </div>
    </div>
  );
}
