/**
 * Panneau de statistiques agrégées d'un groupe
 * Phase 4 - Module Social - Groups UI
 */

'use client';

import { GroupStats, UserGroupPercentile } from '@/modules/social/groups/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users } from 'lucide-react';

interface GroupStatsPanelProps {
  stats: GroupStats;
  userPercentile?: UserGroupPercentile;
}

export function GroupStatsPanel({ stats, userPercentile }: GroupStatsPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderMetricCard = (
    title: string,
    metric: {
      mean: number;
      median: number;
      min: number;
      max: number;
    },
    unit: 'currency' | 'number' = 'currency'
  ) => {
    const formatter = unit === 'currency' ? formatCurrency : (val: number) => val.toFixed(2);

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Médiane</p>
              <p className="font-semibold">{formatter(metric.median)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Moyenne</p>
              <p className="font-semibold">{formatter(metric.mean)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Min</p>
              <p className="text-sm">{formatter(metric.min)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max</p>
              <p className="text-sm">{formatter(metric.max)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec info du groupe */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Statistiques pour {stats.memberCount}{' '}
            {stats.memberCount === 1 ? 'membre' : 'membres'}
          </span>
        </div>
        {userPercentile && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Vous êtes {userPercentile.rank}
            {userPercentile.rank === 1 ? 'er' : 'ème'} / {userPercentile.totalMembers}
          </Badge>
        )}
      </div>

      {/* Grille de statistiques */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Solde net */}
        {renderMetricCard('Solde fiscal net', stats.metrics.soldeNet)}

        {/* Total payé */}
        {stats.metrics.totalPaye &&
          renderMetricCard('Total payé', stats.metrics.totalPaye)}

        {/* Total reçu */}
        {stats.metrics.totalRecu &&
          renderMetricCard('Total reçu', stats.metrics.totalRecu)}

        {/* Ratio */}
        {stats.metrics.ratio &&
          renderMetricCard('Ratio contributeur/bénéficiaire', stats.metrics.ratio, 'number')}
      </div>

      {/* Percentiles du solde net */}
      {stats.metrics.soldeNet.percentiles && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Distribution - Solde fiscal net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">25ème percentile</span>
                <span className="font-semibold">
                  {formatCurrency(stats.metrics.soldeNet.percentiles.p25)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">50ème percentile (médiane)</span>
                <span className="font-semibold">
                  {formatCurrency(stats.metrics.soldeNet.percentiles.p50)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">75ème percentile</span>
                <span className="font-semibold">
                  {formatCurrency(stats.metrics.soldeNet.percentiles.p75)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Percentile de l'utilisateur */}
      {userPercentile && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Votre position dans le groupe</p>
              <p className="text-3xl font-bold text-primary">
                {userPercentile.percentile}
                <span className="text-lg">ème percentile</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Votre {userPercentile.metric === 'soldeNet' ? 'solde net' : userPercentile.metric}:{' '}
                <span className="font-semibold">
                  {formatCurrency(userPercentile.value)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Statistiques calculées le {new Date(stats.calculatedAt).toLocaleString('fr-FR')}
      </p>
    </div>
  );
}
