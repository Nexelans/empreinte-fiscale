"use client";

import { useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, disabled = false }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      // Reset input so same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden file input with camera capture on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment" // Use rear camera on mobile
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Camera button */}
      <Button
        onClick={handleClick}
        disabled={disabled}
        size="lg"
        className="flex items-center gap-3 px-8 py-6"
      >
        <span className="text-3xl">📸</span>
        <div className="text-left">
          <div className="font-semibold">Prendre une photo</div>
          <div className="text-xs opacity-80">ou sélectionner une image</div>
        </div>
      </Button>

      {/* Help text */}
      <p className="text-sm text-gray-600 text-center max-w-md">
        Prenez une photo nette de votre ticket de caisse. Assurez-vous que le montant total et
        l'enseigne sont bien visibles.
      </p>
    </div>
  );
}
