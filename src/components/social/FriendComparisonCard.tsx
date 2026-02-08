/**
 * Carte de comparaison de scores fiscaux entre amis
 * Phase 4 - Module Social - Friends UI
 */

'use client';

import { FriendComparisonData, SharingLevel } from '@/modules/social/friends/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FriendComparisonCardProps {
  comparison: FriendComparisonData;
}

export function FriendComparisonCard({ comparison }: FriendComparisonCardProps) {
  const { user, friend, sharingLevel } = comparison;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDifference = (userVal: number, friendVal: number) => {
    const diff = userVal - friendVal;
    const percentage = ((Math.abs(diff) / friendVal) * 100).toFixed(1);
    return { diff, percentage };
  };

  const renderComparison = (
    label: string,
    userValue?: number,
    friendValue?: number
  ) => {
    if (userValue === undefined || friendValue === undefined) return null;

    const { diff, percentage } = getDifference(userValue, friendValue);

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Vous</p>
            <p className="text-lg font-semibold">{formatCurrency(userValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{friend.name}</p>
            <p className="text-lg font-semibold">{formatCurrency(friendValue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {diff > 0 ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                Vous: +{percentage}% de plus
              </span>
            </>
          ) : diff < 0 ? (
            <>
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">
                Vous: {percentage}% de moins
              </span>
            </>
          ) : (
            <>
              <Minus className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Identique</span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Comparaison avec {friend.name}
          </CardTitle>
          <Badge variant="outline">
            {sharingLevel === SharingLevel.SCORE_ONLY && 'Score uniquement'}
            {sharingLevel === SharingLevel.SUMMARY && 'Résumé'}
            {sharingLevel === SharingLevel.DETAILED && 'Détaillé'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score net toujours visible */}
        {renderComparison('Solde fiscal net', user.data.soldeNet, friend.data.soldeNet)}

        {/* Ratio et totaux si SUMMARY ou DETAILED */}
        {(sharingLevel === SharingLevel.SUMMARY ||
          sharingLevel === SharingLevel.DETAILED) && (
          <>
            {renderComparison('Total payé', user.data.totalPaye, friend.data.totalPaye)}
            {renderComparison('Total reçu', user.data.totalRecu, friend.data.totalRecu)}
            {user.data.ratio && friend.data.ratio && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Ratio Contributeur/Bénéficiaire
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vous</p>
                    <p className="text-lg font-semibold">
                      {user.data.ratio.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{friend.name}</p>
                    <p className="text-lg font-semibold">
                      {friend.data.ratio.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Détails si DETAILED */}
        {sharingLevel === SharingLevel.DETAILED &&
          user.data.detailPaye &&
          friend.data.detailPaye && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Détails des impôts</p>
              <div className="space-y-3 text-sm">
                {user.data.detailPaye.impotRevenu &&
                  friend.data.detailPaye.impotRevenu && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Impôt sur le revenu</span>
                      <span className="text-right">
                        {formatCurrency(user.data.detailPaye.impotRevenu)}
                      </span>
                      <span className="text-right">
                        {formatCurrency(friend.data.detailPaye.impotRevenu)}
                      </span>
                    </div>
                  )}
                {user.data.detailPaye.tva && friend.data.detailPaye.tva && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">TVA</span>
                    <span className="text-right">
                      {formatCurrency(user.data.detailPaye.tva)}
                    </span>
                    <span className="text-right">
                      {formatCurrency(friend.data.detailPaye.tva)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        {user.data.calculatedAt && (
          <p className="text-xs text-muted-foreground text-center pt-4 border-t">
            Dernière mise à jour:{' '}
            {new Date(user.data.calculatedAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
