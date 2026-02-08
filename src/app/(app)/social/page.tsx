/**
 * Page principale du module social avec classements
 * Phase 4 - Module Social
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FriendLeaderboard,
  LeaderboardMetric,
  NationalPercentile,
} from '@/modules/social/leaderboard/types';
import { LeaderboardTable } from '@/components/social/LeaderboardTable';
import { PercentileBadge } from '@/components/social/PercentileBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, BarChart3, TrendingUp } from 'lucide-react';

export default function SocialPage() {
  const router = useRouter();
  const [friendLeaderboard, setFriendLeaderboard] = useState<FriendLeaderboard | null>(null);
  const [nationalPercentile, setNationalPercentile] = useState<NationalPercentile | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<LeaderboardMetric>(
    LeaderboardMetric.SOLDE_NET
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLeaderboards();
  }, [selectedMetric]);

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      // Charger le classement entre amis
      const friendsResponse = await fetch(
        `/api/social/leaderboard/friends?metric=${selectedMetric}`
      );
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriendLeaderboard(friendsData.leaderboard);
      }

      // Charger le percentile national
      const nationalResponse = await fetch(
        `/api/social/leaderboard/national?metric=${selectedMetric}`
      );
      if (nationalResponse.ok) {
        const nationalData = await nationalResponse.json();
        setNationalPercentile(nationalData.percentile);
      } else {
        setNationalPercentile(null);
      }
    } catch (error) {
      console.error('Error loading leaderboards:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les classements',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatValue = (value: number) => {
    if (selectedMetric === LeaderboardMetric.RATIO) {
      return value.toFixed(2);
    } else if (selectedMetric === LeaderboardMetric.SCORE_CONFIANCE) {
      return `${value.toFixed(0)}%`;
    }
    return formatCurrency(value);
  };

  const getMetricLabel = (metric: LeaderboardMetric) => {
    switch (metric) {
      case LeaderboardMetric.SOLDE_NET:
        return 'Solde fiscal net';
      case LeaderboardMetric.TOTAL_PAYE:
        return 'Total payé';
      case LeaderboardMetric.TOTAL_RECU:
        return 'Total reçu';
      case LeaderboardMetric.RATIO:
        return 'Ratio';
      case LeaderboardMetric.SCORE_CONFIANCE:
        return 'Score de confiance';
      default:
        return metric;
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Classements</h1>
        <p className="text-muted-foreground">
          Comparez vos scores fiscaux avec vos amis et au niveau national
        </p>
      </div>

      {/* Sélecteur de métrique */}
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium">Métrique :</label>
        <Select
          value={selectedMetric}
          onValueChange={(value) => setSelectedMetric(value as LeaderboardMetric)}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LeaderboardMetric.SOLDE_NET}>Solde fiscal net</SelectItem>
            <SelectItem value={LeaderboardMetric.TOTAL_PAYE}>Total payé</SelectItem>
            <SelectItem value={LeaderboardMetric.TOTAL_RECU}>Total reçu</SelectItem>
            <SelectItem value={LeaderboardMetric.RATIO}>Ratio</SelectItem>
            <SelectItem value={LeaderboardMetric.SCORE_CONFIANCE}>
              Score de confiance
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Entre amis
            </TabsTrigger>
            <TabsTrigger value="national" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              National
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {friendLeaderboard && friendLeaderboard.entries.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {friendLeaderboard.totalParticipants} participant
                    {friendLeaderboard.totalParticipants > 1 ? 's' : ''}
                  </p>
                  {friendLeaderboard.currentUserRank && (
                    <PercentileBadge
                      percentile={
                        ((friendLeaderboard.totalParticipants -
                          friendLeaderboard.currentUserRank) /
                          friendLeaderboard.totalParticipants) *
                        100
                      }
                      variant="badge"
                    />
                  )}
                </div>

                <LeaderboardTable
                  entries={friendLeaderboard.entries}
                  metricLabel={getMetricLabel(selectedMetric)}
                  formatValue={formatValue}
                />
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Invitez des amis pour voir le classement
                  </p>
                  <Button onClick={() => router.push('/social/friends')}>
                    Gérer mes amis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="national" className="space-y-4">
            {nationalPercentile ? (
              <div className="grid gap-6 md:grid-cols-2">
                <PercentileBadge
                  percentile={nationalPercentile.percentile}
                  metric={getMetricLabel(selectedMetric)}
                  value={nationalPercentile.value}
                  formatValue={formatValue}
                  variant="card"
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">À propos du classement national</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p>
                      <span className="font-semibold">
                        {nationalPercentile.totalOptIns} utilisateurs
                      </span>{' '}
                      ont accepté de participer au classement national anonyme.
                    </p>
                    <p className="text-muted-foreground">
                      Votre percentile indique que{' '}
                      <span className="font-semibold text-foreground">
                        {nationalPercentile.percentile}%
                      </span>{' '}
                      des participants ont un score inférieur au vôtre.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aucune donnée individuelle n'est partagée. Seules des statistiques agrégées
                      sont calculées.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Classement national non disponible</CardTitle>
                  <CardDescription>
                    Vous devez activer le classement national dans vos paramètres
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Le classement national est anonymisé et ne partage aucune donnée individuelle.
                    Seuls des percentiles agrégés sont calculés.
                  </p>
                  <Button onClick={() => router.push('/settings')}>
                    Activer dans les paramètres
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
