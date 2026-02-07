"use client";

import { useEffect, useState } from "react";

interface OCRProgressProps {
  estimatedTimeMs?: number;
}

export function OCRProgress({ estimatedTimeMs = 3000 }: OCRProgressProps) {
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const estimatedSeconds = Math.ceil(estimatedTimeMs / 1000);

    // Update progress bar
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / estimatedTimeMs) * 100, 95);
      setProgress(progressPercent);
    }, 100);

    // Update elapsed time counter
    const timeInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, [estimatedTimeMs]);

  const estimatedSeconds = Math.ceil(estimatedTimeMs / 1000);

  return (
    <div className="w-full max-w-md mx-auto py-8">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Analyse du ticket en cours...
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 text-center mb-6">
        Lecture et extraction des données
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Time info */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Temps écoulé : {elapsedSeconds}s</span>
        <span>Estimation : ~{estimatedSeconds}s</span>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-900">
          💡 <strong>Astuce :</strong> Pour de meilleurs résultats, assurez-vous que le ticket est
          bien éclairé et que le texte est net et lisible.
        </p>
      </div>
    </div>
  );
}
