/**
 * Page d'analytics admin
 * Phase 4 - Admin Interface
 */

'use client';

import { useEffect, useState } from 'react';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, TrendingUp, Users, Calendar } from 'lucide-react';

interface GrowthMetrics {
  period: string;
  data: {
    date: string;
    totalUsers: number;
    newSignups: number;
    activeUsers: number;
    withProfilFiscal: number;
  }[];
}

interface FeatureUsage {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  avgPerUser: number;
}

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [growthRes, featuresRes] = await Promise.all([
        fetch(`/api/admin/analytics/growth?period=${period}`),
        fetch('/api/admin/analytics/features'),
      ]);

      const growthData = await growthRes.json();
      const featuresData = await featuresRes.json();

      setGrowthMetrics(growthData);
      setFeatureUsage(featuresData.features || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les analytics',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: 'growth' | 'features') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/analytics/export?type=${type}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `empreinte-fiscale-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({ title: 'Export réussi' });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Échec de l'export",
        type: 'error',
      });
    } finally {
      setExporting(false);
    }
  };

  // Calculate summary stats
  const latestData = growthMetrics?.data[growthMetrics.data.length - 1];
  const previousData = growthMetrics?.data[growthMetrics.data.length - 2];
  const signupsGrowth = latestData && previousData
    ? ((latestData.newSignups - previousData.newSignups) / previousData.newSignups) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Métriques de croissance et engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Quotidien</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilisateurs Total
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestData?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {latestData?.activeUsers || 0} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nouvelles Inscriptions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestData?.newSignups || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {signupsGrowth >= 0 ? '+' : ''}
                  {signupsGrowth.toFixed(1)}% vs période précédente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profils Complétés
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latestData?.withProfilFiscal || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {latestData && latestData.totalUsers > 0
                    ? Math.round((latestData.withProfilFiscal / latestData.totalUsers) * 100)
                    : 0}
                  % des utilisateurs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Growth Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Croissance des Utilisateurs</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('growth')}
                disabled={exporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </CardHeader>
            <CardContent>
              {growthMetrics && growthMetrics.data.length > 0 ? (
                <AnalyticsChart
                  data={growthMetrics.data}
                  type="line"
                  xKey="date"
                  yKeys={[
                    { key: 'totalUsers', label: 'Total utilisateurs', color: '#3b82f6' },
                    { key: 'activeUsers', label: 'Utilisateurs actifs', color: '#10b981' },
                    { key: 'newSignups', label: 'Nouvelles inscriptions', color: '#f59e0b' },
                  ]}
                  height={300}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Pas de données disponibles
                </p>
              )}
            </CardContent>
          </Card>

          {/* Feature Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Utilisation des Fonctionnalités</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('features')}
                disabled={exporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </CardHeader>
            <CardContent>
              {featureUsage.length > 0 ? (
                <>
                  <AnalyticsChart
                    data={featureUsage}
                    type="bar"
                    xKey="feature"
                    yKeys={[
                      { key: 'uniqueUsers', label: 'Utilisateurs uniques', color: '#3b82f6' },
                    ]}
                    height={300}
                  />
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Fonctionnalité</th>
                          <th className="text-right py-2 font-medium">Utilisations</th>
                          <th className="text-right py-2 font-medium">Utilisateurs</th>
                          <th className="text-right py-2 font-medium">Moy/Utilisateur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {featureUsage.map((feature, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{feature.feature}</td>
                            <td className="text-right py-2">{feature.usageCount}</td>
                            <td className="text-right py-2">{feature.uniqueUsers}</td>
                            <td className="text-right py-2">{feature.avgPerUser.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Pas de données d'utilisation disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
