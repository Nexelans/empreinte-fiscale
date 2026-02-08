/**
 * Sélecteur de thème pour le Wrapped
 * Phase 4 - Module Wrapped - UI
 */

'use client';

import { WrappedTheme } from '@/modules/wrapped/types';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  selectedTheme: WrappedTheme;
  onThemeChange: (theme: WrappedTheme) => void;
}

const themes = [
  {
    value: WrappedTheme.CLASSIC,
    label: 'Classic',
    description: 'Élégant et sobre',
    preview: 'bg-gradient-to-br from-slate-900 to-slate-800',
  },
  {
    value: WrappedTheme.VIBRANT,
    label: 'Vibrant',
    description: 'Coloré et énergique',
    preview: 'bg-gradient-to-br from-purple-600 to-pink-600',
  },
  {
    value: WrappedTheme.MINIMALIST,
    label: 'Minimalist',
    description: 'Épuré et moderne',
    preview: 'bg-white border border-gray-300',
  },
  {
    value: WrappedTheme.FISCAL,
    label: 'Fiscal',
    description: 'Professionnel et institutionnel',
    preview: 'bg-gradient-to-br from-blue-900 to-indigo-900',
  },
];

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {themes.map((theme) => (
        <button
          key={theme.value}
          onClick={() => onThemeChange(theme.value)}
          className={`relative group ${
            selectedTheme === theme.value
              ? 'ring-2 ring-primary ring-offset-2'
              : 'hover:ring-2 hover:ring-gray-300'
          } rounded-lg overflow-hidden transition-all`}
        >
          {/* Preview */}
          <div className={`${theme.preview} h-32 w-full relative`}>
            {selectedTheme === theme.value && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="bg-primary rounded-full p-2">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Label */}
          <div className="p-3 bg-card">
            <p className="font-semibold text-sm">{theme.label}</p>
            <p className="text-xs text-muted-foreground">{theme.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
