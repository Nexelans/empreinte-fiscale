"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FiscalDayData, AnimationConfig, Scene } from "@/modules/animations/types";
import { CoffeeScene } from "./CoffeeScene";
import { CommuteScene } from "./CommuteScene";
import { LunchScene } from "./LunchScene";
import { WorkScene } from "./WorkScene";
import { ShoppingScene } from "./ShoppingScene";
import { SummaryScene } from "./SummaryScene";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface FiscalDayAnimationProps {
  data: FiscalDayData;
  config: AnimationConfig;
  onComplete?: () => void;
}

export function FiscalDayAnimation({
  data,
  config,
  onComplete,
}: FiscalDayAnimationProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(config.autoPlay);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentScene = data.scenes[currentSceneIndex];
  const isLastScene = currentSceneIndex === data.scenes.length - 1;

  // Auto-advance to next scene
  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    const duration = (currentScene.duration * 1000) / config.speed;

    timerRef.current = setTimeout(() => {
      if (isLastScene) {
        setIsPlaying(false);
        onComplete?.();
      } else {
        setCurrentSceneIndex((prev) => prev + 1);
      }
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentSceneIndex, isPlaying, config.speed, isLastScene, currentScene?.duration, onComplete]);

  // Progress bar animation
  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    setProgress(0);
    const startTime = Date.now();
    const duration = (currentScene.duration * 1000) / config.speed;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentSceneIndex, isPlaying, config.speed, currentScene?.duration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentSceneIndex(0);
    setIsPlaying(true);
    setProgress(0);
  };

  const handleSkip = () => {
    if (isLastScene) {
      onComplete?.();
    } else {
      setCurrentSceneIndex((prev) => prev + 1);
      setProgress(0);
    }
  };

  const renderScene = (scene: Scene) => {
    const sceneProps = {
      scene,
      config,
      isPlaying,
    };

    switch (scene.type) {
      case "coffee":
        return <CoffeeScene {...sceneProps} />;
      case "commute":
        return <CommuteScene {...sceneProps} />;
      case "lunch":
        return <LunchScene {...sceneProps} />;
      case "work":
        return <WorkScene {...sceneProps} />;
      case "shopping":
        return <ShoppingScene {...sceneProps} />;
      case "summary":
        return <SummaryScene {...sceneProps} summary={data.summary} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
      {/* Scene container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSceneIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {currentScene && renderScene(currentScene)}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300">
        <motion.div
          className="h-full bg-blue-600"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Scene indicator */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
        Scène {currentSceneIndex + 1} / {data.scenes.length}
      </div>

      {/* Data source badge */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
        {data.dataSource === "real" ? "📊 Données réelles" : "📈 Estimation"}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
        <Button
          onClick={handleRestart}
          variant="ghost"
          size="sm"
          className="rounded-full"
          title="Recommencer"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          onClick={handlePlayPause}
          variant="default"
          size="sm"
          className="rounded-full px-6"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Lecture
            </>
          )}
        </Button>

        <Button
          onClick={handleSkip}
          variant="ghost"
          size="sm"
          className="rounded-full"
          title={isLastScene ? "Terminer" : "Suivant"}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Scene dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
        {data.scenes.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSceneIndex(index);
              setProgress(0);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSceneIndex
                ? "bg-blue-600 w-6"
                : index < currentSceneIndex
                  ? "bg-blue-400"
                  : "bg-gray-400"
            }`}
            title={data.scenes[index]?.title || ""}
          />
        ))}
      </div>
    </div>
  );
}
