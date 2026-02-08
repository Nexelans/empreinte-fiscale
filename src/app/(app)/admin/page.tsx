/**
 * Page principale du dashboard admin
 * Phase 4 - Admin Interface
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemHealthCard } from '@/components/admin/SystemHealthCard';
import { Loader2, Users, Database, AlertCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [cacheMetrics, setCacheMetrics] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [healthRes, statsRes, cacheRes] = await Promise.all([
        fetch('/api/admin/monitoring/health'),
        fetch('/api/admin/users?stats=true'),
        fetch('/api/admin/monitoring/cache'),
      ]);

      const healthData = await healthRes.json();
      const statsData = await statsRes.json();
      const cacheData = await cacheRes.json();

      setHealth(healthData.health);
      setStats(statsData.stats);
      setCacheMetrics(cacheData.metrics);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">
          Vue d'ensemble du système Empreinte Fiscale
        </p>
      </div>

      {/* System Health */}
      {health && <SystemHealthCard health={health} />}

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs Total
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentSignups} nouveaux (7 jours)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs Actifs
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.active / stats.total) * 100)}% du total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profils Fiscaux
              </CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withProfilFiscal}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.withProfilFiscal / stats.total) * 100)}% complétude
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs Suspendus
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suspended}</div>
              <p className="text-xs text-muted-foreground">
                Nécessite attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cache Metrics */}
      {cacheMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Cache Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Hit Rate</p>
                <p className="text-2xl font-bold">{cacheMetrics.hitRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cacheMetrics.hits} hits / {cacheMetrics.misses} misses
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cache Writes</p>
                <p className="text-2xl font-bold">{cacheMetrics.writes}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invalidations</p>
                <p className="text-2xl font-bold">{cacheMetrics.invalidations}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Backend</p>
                <p className="text-2xl font-bold capitalize">{cacheMetrics.backend}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cacheMetrics.isProduction ? 'Production (Redis)' : 'Development (Memory)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/users"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-8 w-8 mb-2 text-blue-600" />
            <h3 className="font-medium">Gérer les utilisateurs</h3>
            <p className="text-sm text-gray-500 mt-1">
              Rechercher, suspendre, gérer les comptes
            </p>
          </a>

          <a
            href="/admin/referentiel"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Database className="h-8 w-8 mb-2 text-green-600" />
            <h3 className="font-medium">Référentiel</h3>
            <p className="text-sm text-gray-500 mt-1">
              Valider les mises à jour fiscales
            </p>
          </a>

          <a
            href="/admin/analytics"
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 mb-2 text-purple-600" />
            <h3 className="font-medium">Analytics</h3>
            <p className="text-sm text-gray-500 mt-1">
              Métriques de croissance et engagement
            </p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
