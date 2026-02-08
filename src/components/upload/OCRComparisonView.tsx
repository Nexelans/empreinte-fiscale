/**
 * Vue de comparaison OCR standard vs AI
 * Phase 4 - Document Upload Enhancement
 *
 * Affiche les résultats des deux méthodes côte à côte pour validation
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface OCRResult {
  [key: string]: any;
}

interface OCRComparisonViewProps {
  standardResult: OCRResult;
  aiResult: OCRResult;
  documentType: string;
  onSelectStandard: () => void;
  onSelectAI: () => void;
  onCancel: () => void;
}

export function OCRComparisonView({
  standardResult,
  aiResult,
  documentType,
  onSelectStandard,
  onSelectAI,
  onCancel,
}: OCRComparisonViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<'standard' | 'ai' | null>(null);

  // Get field labels based on document type
  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      salaireBrut: 'Salaire brut',
      salaireNet: 'Salaire net',
      salaireNetImposable: 'Salaire net imposable',
      csgDeductible: 'CSG déductible',
      csgNonDeductible: 'CSG non déductible',
      crds: 'CRDS',
      retraite: 'Cotisation retraite',
      chomage: 'Assurance chômage',
      revenuFiscal: 'Revenu fiscal de référence',
      impotRevenu: 'Impôt sur le revenu',
      prelevement: 'Prélèvement à la source',
      montantTaxe: 'Montant de la taxe',
      baseImposable: 'Base imposable',
      allocations: 'Montant des allocations',
      quotientFamilial: 'Quotient familial',
    };
    return labels[key] || key;
  };

  // Get all unique keys from both results
  const allKeys = Array.from(
    new Set([...Object.keys(standardResult), ...Object.keys(aiResult)])
  );

  // Filter out metadata keys
  const dataKeys = allKeys.filter((key) => !['metadata', 'confidence'].includes(key));

  // Compare values
  const getDifference = (key: string): 'equal' | 'different' | 'missing' => {
    const standardVal = standardResult[key];
    const aiVal = aiResult[key];

    if (standardVal === undefined && aiVal === undefined) return 'equal';
    if (standardVal === undefined || aiVal === undefined) return 'missing';

    // Compare values (handle numbers and strings)
    const normalizeValue = (val: any) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[€\s]/g, '').replace(',', '.'));
        return isNaN(num) ? val : num;
      }
      return val;
    };

    const normStandard = normalizeValue(standardVal);
    const normAI = normalizeValue(aiVal);

    return normStandard === normAI ? 'equal' : 'different';
  };

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'number') {
      return value.toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + ' €';
    }
    return String(value);
  };

  const handleConfirm = () => {
    if (selectedMethod === 'standard') {
      onSelectStandard();
    } else if (selectedMethod === 'ai') {
      onSelectAI();
    }
  };

  const standardConfidence = standardResult.metadata?.confidence || 0.7;
  const aiConfidence = aiResult.metadata?.confidence || 0.85;

  const differenceCount = dataKeys.filter((key) => getDifference(key) === 'different').length;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Comparaison des résultats</h3>
        <p className="text-sm text-blue-800 mb-2">
          Nous avons extrait les données avec deux méthodes différentes. Sélectionnez la version
          qui vous semble la plus exacte.
        </p>
        {differenceCount > 0 && (
          <p className="text-xs text-blue-700">
            {differenceCount} champ{differenceCount > 1 ? 's' : ''} différent
            {differenceCount > 1 ? 's' : ''} détecté{differenceCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Standard OCR Result */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedMethod === 'standard'
              ? 'border-blue-600 border-2 shadow-lg'
              : 'hover:border-gray-400'
          }`}
          onClick={() => setSelectedMethod('standard')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">OCR Standard</CardTitle>
              </div>
              {selectedMethod === 'standard' && (
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <Badge variant="outline" className="w-fit mt-2">
              Confiance: {Math.round(standardConfidence * 100)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dataKeys.map((key) => {
                const diff = getDifference(key);
                return (
                  <div
                    key={key}
                    className={`flex justify-between text-sm p-2 rounded ${
                      diff === 'different' ? 'bg-amber-50' : ''
                    }`}
                  >
                    <span className="text-gray-600">{getFieldLabel(key)}</span>
                    <span className="font-medium">
                      {formatValue(standardResult[key])}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI OCR Result */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedMethod === 'ai'
              ? 'border-purple-600 border-2 shadow-lg'
              : 'hover:border-gray-400'
          }`}
          onClick={() => setSelectedMethod('ai')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">OCR amélioré par IA</CardTitle>
              </div>
              {selectedMethod === 'ai' && <CheckCircle2 className="h-5 w-5 text-purple-600" />}
            </div>
            <Badge variant="outline" className="w-fit mt-2 border-purple-300 text-purple-700">
              Confiance: {Math.round(aiConfidence * 100)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dataKeys.map((key) => {
                const diff = getDifference(key);
                return (
                  <div
                    key={key}
                    className={`flex justify-between text-sm p-2 rounded ${
                      diff === 'different' ? 'bg-purple-50' : ''
                    }`}
                  >
                    <span className="text-gray-600">{getFieldLabel(key)}</span>
                    <span className="font-medium">{formatValue(aiResult[key])}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleConfirm} disabled={!selectedMethod}>
          Valider la sélection
        </Button>
      </div>
    </div>
  );
}
