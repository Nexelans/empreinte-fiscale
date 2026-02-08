/**
 * Page principale de gestion des groupes
 * Phase 4 - Module Social - Groups
 */

'use client';

import { useEffect, useState } from 'react';
import { Group, GroupType } from '@/modules/social/groups/types';
import { GroupCard } from '@/components/social/GroupCard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Formulaire de création
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<GroupType>(GroupType.FRIENDS);
  const [anonymous, setAnonymous] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/social/groups');
      if (!response.ok) throw new Error('Failed to fetch groups');

      const data = await response.json();
      setGroups(data.groups);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des groupes',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un nom de groupe',
        type: 'error',
      });
      return;
    }

    setCreatingGroup(true);
    try {
      const response = await fetch('/api/social/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          type: groupType,
          anonymous,
        }),
      });

      if (!response.ok) throw new Error('Failed to create group');

      toast({
        title: 'Groupe créé',
        description: `Le groupe "${groupName}" a été créé avec succès`,
      });

      setCreateDialogOpen(false);
      setGroupName('');
      setGroupType(GroupType.FRIENDS);
      setAnonymous(false);

      await loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le groupe',
        type: 'error',
      });
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleArchiveGroup = async (groupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce groupe ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/social/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive: true }),
      });

      if (!response.ok) throw new Error('Failed to archive group');

      toast({
        title: 'Groupe archivé',
        description: 'Le groupe a été archivé avec succès',
      });

      await loadGroups();
    } catch (error) {
      console.error('Error archiving group:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'archiver le groupe',
        type: 'error',
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce groupe ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(`/api/social/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete group');

      toast({
        title: 'Groupe supprimé',
        description: 'Le groupe a été supprimé définitivement',
      });

      await loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le groupe',
        type: 'error',
      });
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes groupes</h1>
          <p className="text-muted-foreground mt-1">
            Créez des groupes et comparez vos scores fiscaux
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer un groupe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau groupe</DialogTitle>
              <DialogDescription>
                Créez un groupe pour comparer vos données fiscales avec d'autres personnes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Nom du groupe</Label>
                <Input
                  id="groupName"
                  placeholder="Ma famille"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupType">Type de groupe</Label>
                <Select
                  value={groupType}
                  onValueChange={(value) => setGroupType(value as GroupType)}
                >
                  <SelectTrigger id="groupType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GroupType.FAMILY}>Famille</SelectItem>
                    <SelectItem value={GroupType.COLLEAGUES}>Collègues</SelectItem>
                    <SelectItem value={GroupType.FRIENDS}>Amis</SelectItem>
                    <SelectItem value={GroupType.CUSTOM}>Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked) => setAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous" className="text-sm font-normal">
                  Mode anonyme (les noms ne sont pas affichés dans les comparaisons)
                </Label>
              </div>

              <Button
                onClick={handleCreateGroup}
                disabled={creatingGroup || !groupName.trim()}
                className="w-full"
              >
                {creatingGroup ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer le groupe'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun groupe pour le moment</h2>
          <p className="text-muted-foreground mb-6">
            Créez votre premier groupe pour commencer à comparer vos données fiscales
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            Créer votre premier groupe
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {groups.length} {groups.length === 1 ? 'groupe' : 'groupes'}
          </p>
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isOwner={group.ownerId === session?.user?.id}
              onArchive={handleArchiveGroup}
              onDelete={handleDeleteGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
}
