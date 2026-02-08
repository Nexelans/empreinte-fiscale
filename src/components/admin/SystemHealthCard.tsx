/**
 * Carte d'affichage de la santé du système
 * Phase 4 - Admin Interface
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Database, Zap, Cog } from 'lucide-react';

interface SystemHealthCardProps {
  health: {
    status: 'healthy' | 'degraded' | 'critical';
    database: {
      status: 'connected' | 'disconnected' | 'slow';
      latency: number;
    };
    api: {
      status: 'operational' | 'degraded' | 'down';
      averageLatency: number;
    };
    jobs: {
      status: 'running' | 'stopped' | 'errors';
      lastRun?: Date;
    };
    errorRate: {
      last24h: number;
      trend: 'increasing' | 'stable' | 'decreasing';
    };
    uptime: number;
  };
}

export function SystemHealthCard({ health }: SystemHealthCardProps) {
  const getStatusColor = (status: string) => {
    if (status === 'healthy' || status === 'connected' || status === 'operational' || status === 'running') {
      return 'text-green-600 bg-green-50';
    }
    if (status === 'degraded' || status === 'slow' || status === 'errors') {
      return 'text-amber-600 bg-amber-50';
    }
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'healthy' || status === 'connected' || status === 'operational' || status === 'running') {
      return <CheckCircle2 className="h-4 w-4" />;
    }
    if (status === 'degraded' || status === 'slow' || status === 'errors') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <XCircle className="h-4 w-4" />;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>État du Système</CardTitle>
          <Badge className={getStatusColor(health.status)}>
            {getStatusIcon(health.status)}
            <span className="ml-2">
              {health.status === 'healthy' && 'Opérationnel'}
              {health.status === 'degraded' && 'Dégradé'}
              {health.status === 'critical' && 'Critique'}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Database */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(health.database.status)}`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Base de données</p>
              <p className="text-xs text-muted-foreground">
                {health.database.latency}ms
              </p>
            </div>
          </div>

          {/* API */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(health.api.status)}`}>
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">API</p>
              <p className="text-xs text-muted-foreground">
                {health.api.averageLatency}ms avg
              </p>
            </div>
          </div>

          {/* Jobs */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(health.jobs.status)}`}>
              <Cog className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Jobs planifiés</p>
              <p className="text-xs text-muted-foreground">
                {health.jobs.status === 'running' ? 'Actifs' : 'Arrêtés'}
              </p>
            </div>
          </div>

          {/* Error Rate */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Erreurs (24h)</p>
              <p className="text-xs text-muted-foreground">
                {health.errorRate.last24h} ({health.errorRate.trend})
              </p>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Uptime: <span className="font-medium text-foreground">{formatUptime(health.uptime)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
