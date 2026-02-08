/**
 * Page principale de gestion des amis
 * Phase 4 - Module Social - Friends
 */

'use client';

import { useEffect, useState } from 'react';
import { FriendConnection, SharingLevel } from '@/modules/social/friends/types';
import { FriendCard } from '@/components/social/FriendCard';
import { FriendInviteModal } from '@/components/social/FriendInviteModal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users } from 'lucide-react';

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social/friends');
      if (!response.ok) throw new Error('Failed to fetch friends');

      const data = await response.json();
      setFriends(data.friends);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste d\'amis',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSharingLevel = async (friendId: string, level: SharingLevel) => {
    try {
      const response = await fetch(`/api/social/friends/${friendId}/sharing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharingLevel: level }),
      });

      if (!response.ok) throw new Error('Failed to update sharing level');

      toast({
        title: 'Niveau de partage mis à jour',
        description: 'Vos préférences de partage ont été enregistrées',
      });

      // Recharger la liste
      await loadFriends();
    } catch (error) {
      console.error('Error updating sharing level:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le niveau de partage',
        type: 'error',
      });
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet ami ?')) {
      return;
    }

    try {
      const response = await fetch('/api/social/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) throw new Error('Failed to remove friend');

      toast({
        title: 'Ami retiré',
        description: 'La connexion a été supprimée',
      });

      // Recharger la liste
      await loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer cet ami',
        type: 'error',
      });
    }
  };

  const handleViewData = (friendId: string) => {
    // TODO: Implémenter la vue des données partagées (Task 4.5)
    toast({
      title: 'Fonctionnalité à venir',
      description: 'La vue de comparaison détaillée sera bientôt disponible',
    });
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes amis</h1>
          <p className="text-muted-foreground mt-1">
            Invitez des amis et comparez vos scores fiscaux
          </p>
        </div>
        <FriendInviteModal />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : friends.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun ami pour le moment</h2>
          <p className="text-muted-foreground mb-6">
            Invitez vos proches pour comparer vos situations fiscales
          </p>
          <FriendInviteModal
            trigger={
              <Button size="lg">
                Inviter votre premier ami
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {friends.length} {friends.length === 1 ? 'ami' : 'amis'}
          </p>
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onChangeSharingLevel={handleChangeSharingLevel}
              onRemove={handleRemoveFriend}
              onViewData={handleViewData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
