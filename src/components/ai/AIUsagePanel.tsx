/**
 * Panneau d'affichage de l'utilisation IA
 * Phase 4 - Module AI
 *
 * Affiche les statistiques d'utilisation et le coût estimé
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign, Zap } from 'lucide-react';

interface UsageStats {
  requestCount: number;
  totalTokens: number;
  estimatedCost: number;
  lastRequestAt?: string;
}

interface UsageProjections {
  currentMonth: number;
  projectedMonth: number;
  averagePerRequest: number;
  averagePerDay: number;
}

export function AIUsagePanel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [projections, setProjections] = useState<UsageProjections | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await fetch('/api/ai/usage?period=month&details=true');
      const data = await response.json();

      setStats(data.stats);
      setProjections(data.projections);
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Aucune donnée d'utilisation disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisation IA ce mois</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Requêtes */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.requestCount}</p>
              <p className="text-sm text-muted-foreground">Requêtes</p>
            </div>
          </div>

          {/* Tokens */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(stats.totalTokens / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-muted-foreground">Tokens</p>
            </div>
          </div>

          {/* Coût */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.estimatedCost.toFixed(4)}€
              </p>
              <p className="text-sm text-muted-foreground">Coût estimé</p>
            </div>
          </div>
        </div>

        {projections && projections.projectedMonth > 0 && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Projection fin de mois
            </p>
            <p className="text-lg font-semibold">
              {projections.projectedMonth.toFixed(4)}€
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Moyenne : {projections.averagePerDay.toFixed(4)}€/jour
            </p>
          </div>
        )}

        {stats.lastRequestAt && (
          <p className="text-xs text-muted-foreground mt-4">
            Dernière requête :{' '}
            {new Date(stats.lastRequestAt).toLocaleString('fr-FR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
