/**
 * Tableau de classement (leaderboard)
 * Phase 4 - Module Social - Leaderboard UI
 */

'use client';

import { LeaderboardEntry } from '@/modules/social/leaderboard/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  metricLabel: string;
  formatValue: (value: number) => string;
}

export function LeaderboardTable({
  entries,
  metricLabel,
  formatValue,
}: LeaderboardTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="h-5 w-5 text-orange-600" />;
    }
    return null;
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return 'default';
    if (rank <= 3) return 'secondary';
    return 'outline';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Rang</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead className="text-right">{metricLabel}</TableHead>
            <TableHead className="w-32 text-center">Confiance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.userId}
              className={entry.isCurrentUser ? 'bg-primary/5 font-semibold' : ''}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                  <Badge variant={getRankBadgeVariant(entry.rank)}>
                    #{entry.rank}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={entry.userImage} alt={entry.userName} />
                    <AvatarFallback className="text-xs">
                      {getInitials(entry.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{entry.userName}</div>
                    {entry.isCurrentUser && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Vous
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatValue(entry.value)}
              </TableCell>
              <TableCell className="text-center">
                {entry.scoreConfiance !== undefined && (
                  <Badge
                    variant="secondary"
                    className={
                      entry.scoreConfiance >= 80
                        ? 'bg-green-100 text-green-700'
                        : entry.scoreConfiance >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700'
                    }
                  >
                    {entry.scoreConfiance.toFixed(0)}%
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {entries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucune donnée disponible pour ce classement
        </div>
      )}
    </div>
  );
}
