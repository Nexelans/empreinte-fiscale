/**
 * Badge de percentile avec indicateur visuel
 * Phase 4 - Module Social - Leaderboard UI
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PercentileBadgeProps {
  percentile: number;
  metric?: string;
  value?: number;
  formatValue?: (value: number) => string;
  variant?: 'badge' | 'card';
}

export function PercentileBadge({
  percentile,
  metric,
  value,
  formatValue,
  variant = 'badge',
}: PercentileBadgeProps) {
  const getPercentileColor = (p: number) => {
    if (p >= 90) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
    if (p >= 75) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
    if (p >= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    if (p >= 25) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
  };

  const getPercentileLabel = (p: number) => {
    if (p >= 90) return 'Top 10%';
    if (p >= 75) return 'Top 25%';
    if (p >= 50) return 'Au-dessus de la médiane';
    if (p >= 25) return 'En-dessous de la médiane';
    return 'Bottom 25%';
  };

  const colors = getPercentileColor(percentile);
  const label = getPercentileLabel(percentile);

  if (variant === 'badge') {
    return (
      <Badge
        variant="secondary"
        className={`${colors.bg} ${colors.text} border ${colors.border} flex items-center gap-1`}
      >
        {percentile >= 50 ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{label}</span>
      </Badge>
    );
  }

  return (
    <Card className={`border-2 ${colors.border}`}>
      <CardContent className={`${colors.bg} p-6`}>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {percentile >= 50 ? (
              <TrendingUp className={`h-5 w-5 ${colors.text}`} />
            ) : (
              <TrendingDown className={`h-5 w-5 ${colors.text}`} />
            )}
            <p className={`text-sm font-medium ${colors.text}`}>{label}</p>
          </div>

          <p className={`text-4xl font-bold ${colors.text}`}>
            {percentile}
            <span className="text-xl">ème</span>
          </p>

          <p className="text-xs text-muted-foreground">percentile</p>

          {metric && (
            <p className="text-sm text-muted-foreground mt-3">
              {metric}
              {value !== undefined && formatValue && (
                <>
                  {': '}
                  <span className={`font-semibold ${colors.text}`}>
                    {formatValue(value)}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
