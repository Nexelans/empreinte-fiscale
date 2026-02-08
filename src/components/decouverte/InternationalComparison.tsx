/**
 * Comparaison internationale simplifiée
 * Phase 4 - Discovery Mode Enhancement
 *
 * Compare le profil fiscal français avec d'autres pays (OCDE)
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
  taxRate: number; // Taux effectif moyen
  socialRate: number; // Cotisations sociales
  vatRate: number; // TVA standard
}

const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷', taxRate: 45.4, socialRate: 62.0, vatRate: 20.0 },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', taxRate: 39.5, socialRate: 39.8, vatRate: 19.0 },
  { code: 'SE', name: 'Suède', flag: '🇸🇪', taxRate: 42.9, socialRate: 31.4, vatRate: 25.0 },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', taxRate: 33.5, socialRate: 26.1, vatRate: 20.0 },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', taxRate: 26.6, socialRate: 15.5, vatRate: 0.0 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', taxRate: 33.0, socialRate: 14.8, vatRate: 5.0 },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸', taxRate: 39.3, socialRate: 36.4, vatRate: 21.0 },
  { code: 'IT', name: 'Italie', flag: '🇮🇹', taxRate: 42.5, socialRate: 43.0, vatRate: 22.0 },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', taxRate: 44.0, socialRate: 52.5, vatRate: 21.0 },
];

interface InternationalComparisonProps {
  currentScore?: {
    totalPaye: number;
    totalRecu: number;
    soldeNet: number;
  };
  salaireBrut?: number;
  onConversionPrompt?: () => void;
}

export function InternationalComparison({
  currentScore,
  salaireBrut = 35000,
  onConversionPrompt,
}: InternationalComparisonProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('DE');

  const france = COUNTRIES.find((c) => c.code === 'FR')!;
  const selected = COUNTRIES.find((c) => c.code === selectedCountry)!;

  // Estimation simplifiée (basée sur moyennes OCDE)
  const estimatedTaxFr = (salaireBrut * france.taxRate) / 100;
  const estimatedTaxSelected = (salaireBrut * selected.taxRate) / 100;
  const difference = estimatedTaxFr - estimatedTaxSelected;
  const differencePercent = ((difference / estimatedTaxFr) * 100).toFixed(1);

  const getDifferenceIcon = () => {
    if (Math.abs(difference) < salaireBrut * 0.02) return <Minus className="h-5 w-5" />;
    return difference > 0 ? (
      <TrendingDown className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingUp className="h-5 w-5 text-red-600" />
    );
  };

  const getDifferenceColor = () => {
    if (Math.abs(difference) < salaireBrut * 0.02) return 'bg-gray-100 text-gray-800';
    return difference > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <CardTitle>Comparaison Internationale</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            Estimation OCDE
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Comment votre situation fiscale évoluerait-elle dans un autre pays ?
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Country Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Comparer avec :</label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.filter((c) => c.code !== 'FR').map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comparison Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* France */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{france.flag}</span>
                <h4 className="font-semibold">{france.name}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux effectif</span>
                  <span className="font-medium">{france.taxRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Charges sociales</span>
                  <span className="font-medium">{france.socialRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA standard</span>
                  <span className="font-medium">{france.vatRate}%</span>
                </div>
                <div className="pt-2 border-t mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Charge estimée</span>
                    <span>{estimatedTaxFr.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Country */}
            <div className="border rounded-lg p-4 bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{selected.flag}</span>
                <h4 className="font-semibold">{selected.name}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux effectif</span>
                  <span className="font-medium">{selected.taxRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Charges sociales</span>
                  <span className="font-medium">{selected.socialRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA standard</span>
                  <span className="font-medium">{selected.vatRate}%</span>
                </div>
                <div className="pt-2 border-t mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Charge estimée</span>
                    <span>{estimatedTaxSelected.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Difference Summary */}
          <div className={`rounded-lg p-4 ${getDifferenceColor()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDifferenceIcon()}
                <span className="font-semibold">
                  {Math.abs(difference) > salaireBrut * 0.02
                    ? difference > 0
                      ? `Vous paieriez ${Math.abs(difference).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € de moins`
                      : `Vous paieriez ${Math.abs(difference).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € de plus`
                    : 'Charge fiscale similaire'}
                </span>
              </div>
              {Math.abs(difference) > salaireBrut * 0.02 && (
                <Badge variant="outline" className="bg-white">
                  {difference > 0 ? '-' : '+'}
                  {differencePercent}%
                </Badge>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <p className="font-medium mb-1">⚠️ Avertissement</p>
            <p>
              Cette comparaison est une estimation simplifiée basée sur des données OCDE. Les
              systèmes fiscaux varient considérablement (déductions, crédits, services publics,
              coût de la vie). Ces chiffres ne reflètent pas la complexité réelle de chaque pays.
            </p>
          </div>

          {/* CTA */}
          {onConversionPrompt && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 mb-3">
                Curieux de connaître votre situation réelle en France ?
              </p>
              <Button onClick={onConversionPrompt} size="sm">
                Calculer mon vrai score fiscal →
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
