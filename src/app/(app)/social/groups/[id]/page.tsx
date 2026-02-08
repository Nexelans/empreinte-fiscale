/**
 * Page de détails d'un groupe avec comparaison et statistiques
 * Phase 4 - Module Social - Groups
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Group,
  GroupComparison,
  GroupStats,
  UserGroupPercentile,
} from '@/modules/social/groups/types';
import { GroupComparisonTable } from '@/components/social/GroupComparisonTable';
import { GroupStatsPanel } from '@/components/social/GroupStatsPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, BarChart3 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function GroupDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [comparison, setComparison] = useState<GroupComparison | null>(null);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [userPercentile, setUserPercentile] = useState<UserGroupPercentile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comparison');

  const { toast } = useToast();

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      // Charger les informations du groupe
      const groupResponse = await fetch(`/api/social/groups/${groupId}`);
      if (!groupResponse.ok) throw new Error('Failed to fetch group');
      const groupData = await groupResponse.json();
      setGroup(groupData.group);

      // Charger la comparaison
      const comparisonResponse = await fetch(`/api/social/groups/${groupId}/comparison`);
      if (comparisonResponse.ok) {
        const comparisonData = await comparisonResponse.json();
        setComparison(comparisonData.comparison);
      }

      // Charger les stats avec le percentile de l'utilisateur
      const statsResponse = await fetch(`/api/social/groups/${groupId}/stats?metric=soldeNet`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
        if (statsData.userPercentile) {
          setUserPercentile(statsData.userPercentile);
        }
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du groupe',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Groupe introuvable</h2>
          <p className="text-muted-foreground">
            Ce groupe n'existe pas ou vous n'y avez pas accès
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          {group.ownerId === session?.user?.id && (
            <Button variant="outline" size="sm">
              Gérer le groupe
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {group.memberCount} {group.memberCount === 1 ? 'membre' : 'membres'}
            </span>
          </div>
          {group.anonymous && (
            <span className="text-xs bg-muted px-2 py-1 rounded">Mode anonyme</span>
          )}
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Comparaison
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          {comparison ? (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-4">Tableau de comparaison</h2>
                <GroupComparisonTable
                  members={comparison.members}
                  currentUserId={session?.user?.id}
                  anonymous={group.anonymous}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Les données affichées respectent les niveaux de partage configurés par chaque membre
              </p>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucune donnée de comparaison disponible
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats ? (
            <GroupStatsPanel stats={stats} userPercentile={userPercentile || undefined} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Statistiques non disponibles
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
