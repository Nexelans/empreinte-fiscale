/**
 * Carte d'invitation d'ami en attente
 * Phase 4 - Module Social - Friends UI
 */

'use client';

import { FriendInvitation } from '@/modules/social/friends/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, Clock } from 'lucide-react';

interface FriendRequestCardProps {
  invitation: FriendInvitation;
  onAccept?: (token: string) => void;
  onDecline?: (token: string) => void;
  loading?: boolean;
}

export function FriendRequestCard({
  invitation,
  onAccept,
  onDecline,
  loading,
}: FriendRequestCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatExpiryDate = (date: Date) => {
    const now = new Date();
    const expiry = new Date(date);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expirée';
    } else if (diffDays === 0) {
      return 'Expire aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Expire demain';
    } else {
      return `Expire dans ${diffDays} jours`;
    }
  };

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <Card className={isExpired ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Avatar et infos */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {getInitials(invitation.inviterName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">
                {invitation.inviterName}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {invitation.inviterEmail}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {formatExpiryDate(invitation.expiresAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isExpired && (
            <div className="flex items-center gap-2">
              {onDecline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDecline(invitation.token)}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Refuser
                </Button>
              )}
              {onAccept && (
                <Button
                  size="sm"
                  onClick={() => onAccept(invitation.token)}
                  disabled={loading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accepter
                </Button>
              )}
            </div>
          )}

          {isExpired && (
            <div className="text-sm text-muted-foreground">
              Expirée
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
