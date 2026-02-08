/**
 * Carte affichant un ami avec ses informations
 * Phase 4 - Module Social - Friends UI
 */

'use client';

import { FriendConnection, SharingLevel } from '@/modules/social/friends/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Shield, Users, Lock } from 'lucide-react';

interface FriendCardProps {
  friend: FriendConnection;
  onChangeSharingLevel?: (friendId: string, level: SharingLevel) => void;
  onRemove?: (friendId: string) => void;
  onViewData?: (friendId: string) => void;
}

const sharingLevelConfig = {
  [SharingLevel.SCORE_ONLY]: {
    label: 'Score uniquement',
    icon: Lock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  [SharingLevel.SUMMARY]: {
    label: 'Résumé',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  [SharingLevel.DETAILED]: {
    label: 'Détaillé',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
};

export function FriendCard({
  friend,
  onChangeSharingLevel,
  onRemove,
  onViewData,
}: FriendCardProps) {
  const config = sharingLevelConfig[friend.sharingLevel];
  const Icon = config.icon;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Avatar et infos */}
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={friend.friendImage} alt={friend.friendName} />
              <AvatarFallback>{getInitials(friend.friendName)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {friend.friendName}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {friend.friendEmail}
              </p>
              {friend.acceptedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Amis depuis {formatDate(friend.acceptedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Badge niveau de partage */}
          <div className="flex items-center gap-2 ml-4">
            <Badge
              variant="secondary"
              className={`${config.bgColor} ${config.color} border-0 flex items-center gap-1`}
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs">{config.label}</span>
            </Badge>

            {/* Menu actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewData && (
                  <DropdownMenuItem onClick={() => onViewData(friend.friendId)}>
                    Voir les données
                  </DropdownMenuItem>
                )}

                {onChangeSharingLevel && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        onChangeSharingLevel(friend.friendId, SharingLevel.SCORE_ONLY)
                      }
                    >
                      Partager: Score uniquement
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onChangeSharingLevel(friend.friendId, SharingLevel.SUMMARY)
                      }
                    >
                      Partager: Résumé
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onChangeSharingLevel(friend.friendId, SharingLevel.DETAILED)
                      }
                    >
                      Partager: Détaillé
                    </DropdownMenuItem>
                  </>
                )}

                {onRemove && (
                  <DropdownMenuItem
                    onClick={() => onRemove(friend.friendId)}
                    className="text-destructive focus:text-destructive"
                  >
                    Retirer cet ami
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
