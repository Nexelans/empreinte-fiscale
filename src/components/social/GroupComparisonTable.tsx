/**
 * Tableau de comparaison des membres d'un groupe
 * Phase 4 - Module Social - Groups UI
 */

'use client';

import { useState } from 'react';
import { GroupMemberWithData } from '@/modules/social/groups/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface GroupComparisonTableProps {
  members: GroupMemberWithData[];
  currentUserId?: string;
  anonymous?: boolean;
}

type SortField = 'name' | 'soldeNet' | 'totalPaye' | 'totalRecu' | 'ratio';
type SortDirection = 'asc' | 'desc';

export function GroupComparisonTable({
  members,
  currentUserId,
  anonymous = false,
}: GroupComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>('soldeNet');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (sortField === 'name') {
      aVal = a.userName.toLowerCase();
      bVal = b.userName.toLowerCase();
    } else {
      // Pour les métriques fiscales
      const aData = a.fiscalData;
      const bData = b.fiscalData;

      if (!aData && !bData) return 0;
      if (!aData) return 1;
      if (!bData) return -1;

      if (sortField === 'soldeNet') {
        aVal = aData.soldeNet;
        bVal = bData.soldeNet;
      } else if (sortField === 'totalPaye') {
        aVal = aData.totalPaye || 0;
        bVal = bData.totalPaye || 0;
      } else if (sortField === 'totalRecu') {
        aVal = aData.totalRecu || 0;
        bVal = bData.totalRecu || 0;
      } else if (sortField === 'ratio') {
        aVal = aData.ratio || 0;
        bVal = bData.ratio || 0;
      }
    }

    if (sortDirection === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Minus className="h-3 w-3 text-muted-foreground" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                Membre
                <SortIcon field="name" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort('soldeNet')}
            >
              <div className="flex items-center justify-end gap-2">
                Solde net
                <SortIcon field="soldeNet" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort('totalPaye')}
            >
              <div className="flex items-center justify-end gap-2">
                Total payé
                <SortIcon field="totalPaye" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort('totalRecu')}
            >
              <div className="flex items-center justify-end gap-2">
                Total reçu
                <SortIcon field="totalRecu" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort('ratio')}
            >
              <div className="flex items-center justify-end gap-2">
                Ratio
                <SortIcon field="ratio" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMembers.map((member, index) => {
            const isCurrentUser = member.userId === currentUserId;
            const displayName = anonymous && !isCurrentUser
              ? `Membre ${index + 1}`
              : member.userName;

            return (
              <TableRow
                key={member.id}
                className={isCurrentUser ? 'bg-primary/5' : ''}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {!anonymous && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.userImage} alt={displayName} />
                        <AvatarFallback className="text-xs">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <div className="font-medium">{displayName}</div>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Vous
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {member.fiscalData ? (
                    formatCurrency(member.fiscalData.soldeNet)
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {member.fiscalData?.totalPaye !== undefined ? (
                    formatCurrency(member.fiscalData.totalPaye)
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {member.fiscalData?.totalRecu !== undefined ? (
                    formatCurrency(member.fiscalData.totalRecu)
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {member.fiscalData?.ratio !== undefined ? (
                    member.fiscalData.ratio.toFixed(2)
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun membre dans ce groupe
        </div>
      )}
    </div>
  );
}
