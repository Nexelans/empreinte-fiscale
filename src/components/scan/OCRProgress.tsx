"use client";

import { useEffect, useState } from "react";

interface OCRProgressProps {
  estimatedTimeMs?: number;
}

export function OCRProgress({ estimatedTimeMs = 500 }: OCRProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Quick progress animation for user feedback
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 20;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto py-8">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📸</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
        Traitement de l'image...
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 text-center mb-6">
        Préparation du formulaire de saisie
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

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-900">
          💡 <strong>Note :</strong> Vous pourrez saisir manuellement les informations du ticket à l'étape suivante.
        </p>
      </div>
    </div>
  );
}
