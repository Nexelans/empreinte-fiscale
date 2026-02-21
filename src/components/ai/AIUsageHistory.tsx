'use client';

/**
 * Historique d'utilisation IA
 * Phase 4 - Module AI
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, TrendingUp, DollarSign, MessageSquare } from 'lucide-react';

interface UsageStats {
  stats: {
    userId: string;
    period: 'day' | 'month' | 'today';
    requestCount: number;
    totalTokens: number;
    estimatedCost: number;
    lastRequestAt?: Date;
  };
  byProvider?: Array<{
    provider: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  byContext?: Array<{
    context: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export function AIUsageHistory() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/ai/usage?period=${period}&details=true`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Utilisation</h2>
        <p className="text-gray-600">Chargement...</p>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Utilisation</h2>
        <p className="text-gray-600">Aucune donnée disponible</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Utilisation</h2>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="day">Aujourd'hui</TabsTrigger>
            <TabsTrigger value="week">7 jours</TabsTrigger>
            <TabsTrigger value="month">30 jours</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Requêtes</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.stats.requestCount}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <BarChart className="w-4 h-4" />
            <span className="text-sm font-medium">Tokens</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {(stats.stats.totalTokens / 1000).toFixed(1)}K
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Coût estimé</span>
          </div>
          <p className="text-2xl font-bold text-green-900">€{stats.stats.estimatedCost.toFixed(4)}</p>
        </div>
      </div>

      {/* Breakdown by context */}
      {stats.byContext && stats.byContext.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Par fonctionnalité</h3>
          <div className="space-y-2">
            {stats.byContext.map((item) => (
              <div key={item.context} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{item.context}</p>
                  <p className="text-sm text-gray-600">{item.requests} requêtes</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{item.cost.toFixed(4)}</p>
                  <p className="text-xs text-gray-600">{(item.tokens / 1000).toFixed(1)}K tokens</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown by provider */}
      {stats.byProvider && stats.byProvider.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Par provider</h3>
          <div className="space-y-2">
            {stats.byProvider.map((item) => (
              <div key={item.provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{item.provider}</p>
                  <p className="text-sm text-gray-600">{item.requests} requêtes</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{item.cost.toFixed(4)}</p>
                  <p className="text-xs text-gray-600">{(item.tokens / 1000).toFixed(1)}K tokens</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.stats.requestCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aucune utilisation sur cette période</p>
        </div>
      )}
    </Card>
  );
}
