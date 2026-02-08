/**
 * Carte affichant un groupe avec ses informations
 * Phase 4 - Module Social - Groups UI
 */

'use client';

import { Group, GroupType } from '@/modules/social/groups/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Users, Home, Briefcase, Heart, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GroupCardProps {
  group: Group;
  isOwner?: boolean;
  onDelete?: (groupId: string) => void;
  onArchive?: (groupId: string) => void;
}

const groupTypeConfig = {
  [GroupType.FAMILY]: {
    label: 'Famille',
    icon: Home,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  [GroupType.COLLEAGUES]: {
    label: 'Collègues',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  [GroupType.FRIENDS]: {
    label: 'Amis',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  [GroupType.CUSTOM]: {
    label: 'Personnalisé',
    icon: Folder,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

export function GroupCard({ group, isOwner, onDelete, onArchive }: GroupCardProps) {
  const router = useRouter();
  const config = groupTypeConfig[group.type];
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/social/groups/${group.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Infos du groupe */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate">{group.name}</h3>
              {group.anonymous && (
                <Badge variant="outline" className="text-xs">
                  Anonyme
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge
                variant="secondary"
                className={`${config.bgColor} ${config.color} border-0 flex items-center gap-1`}
              >
                <Icon className="h-3 w-3" />
                <span className="text-xs">{config.label}</span>
              </Badge>

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>
                  {group.memberCount} {group.memberCount === 1 ? 'membre' : 'membres'}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Créé le {formatDate(group.createdAt)}
              {isOwner && <span className="ml-2 text-primary font-medium">(Vous êtes propriétaire)</span>}
            </p>
          </div>

          {/* Menu actions (pour le propriétaire) */}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/social/groups/${group.id}`);
                  }}
                >
                  Gérer le groupe
                </DropdownMenuItem>

                {onArchive && !group.archivedAt && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(group.id);
                    }}
                  >
                    Archiver le groupe
                  </DropdownMenuItem>
                )}

                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(group.id);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Supprimer le groupe
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
