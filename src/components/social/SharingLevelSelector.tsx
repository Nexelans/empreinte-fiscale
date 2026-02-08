/**
 * Sélecteur de niveau de partage fiscal
 * Phase 4 - Module Social - Friends UI
 */

'use client';

import { SharingLevel } from '@/modules/social/friends/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Lock, Shield, Users } from 'lucide-react';

interface SharingLevelSelectorProps {
  value: SharingLevel;
  onChange: (level: SharingLevel) => void;
  disabled?: boolean;
}

const levels = [
  {
    value: SharingLevel.SCORE_ONLY,
    label: 'Score uniquement',
    description: 'Partage uniquement votre solde fiscal net',
    icon: Lock,
  },
  {
    value: SharingLevel.SUMMARY,
    label: 'Résumé',
    description: 'Partage votre score, ratio et montants totaux',
    icon: Shield,
  },
  {
    value: SharingLevel.DETAILED,
    label: 'Détaillé',
    description: 'Partage tous les détails de vos impôts et services',
    icon: Users,
  },
];

export function SharingLevelSelector({
  value,
  onChange,
  disabled,
}: SharingLevelSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange(val as SharingLevel)}
      disabled={disabled}
      className="space-y-3"
    >
      {levels.map((level) => {
        const Icon = level.icon;
        return (
          <div
            key={level.value}
            className={`flex items-start space-x-3 p-3 rounded-lg border ${
              value === level.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => !disabled && onChange(level.value)}
          >
            <RadioGroupItem
              value={level.value}
              id={level.value}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <Label
                  htmlFor={level.value}
                  className="font-medium cursor-pointer"
                >
                  {level.label}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {level.description}
              </p>
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
}
