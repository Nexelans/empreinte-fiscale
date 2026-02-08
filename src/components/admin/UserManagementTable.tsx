/**
 * Table de gestion des utilisateurs (Admin)
 * Phase 4 - Admin Interface
 */

'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, Ban, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string | null;
  adminRole: string | null;
  createdAt: Date;
  suspended: boolean;
}

interface UserManagementTableProps {
  users: User[];
  total: number;
  offset: number;
  limit: number;
  onPageChange: (offset: number) => void;
  onRefresh: () => void;
}

export function UserManagementTable({
  users,
  total,
  offset,
  limit,
  onPageChange,
  onRefresh,
}: UserManagementTableProps) {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSuspend = async (userId: string) => {
    const reason = prompt('Raison de la suspension:');
    if (!reason) return;

    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed');

      toast({ title: 'Utilisateur suspendu' });
      onRefresh();
    } catch (error) {
      toast({ title: 'Erreur', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Supprimer définitivement cet utilisateur? (RGPD)')) return;

    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed');

      toast({ title: 'Utilisateur supprimé' });
      onRefresh();
    } catch (error) {
      toast({ title: 'Erreur', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name || '-'}</TableCell>
                <TableCell>
                  {user.adminRole ? (
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      {user.adminRole}
                    </Badge>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {user.suspended ? (
                    <Badge variant="destructive">Suspendu</Badge>
                  ) : (
                    <Badge variant="outline">Actif</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      {!user.suspended && (
                        <DropdownMenuItem
                          onClick={() => handleSuspend(user.id)}
                          disabled={actionLoading === user.id}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspendre
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(user.id)}
                        disabled={actionLoading === user.id}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer (RGPD)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} utilisateur{total > 1 ? 's' : ''} (page {currentPage}/{totalPages})
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => onPageChange(Math.max(0, offset - limit))}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={offset + limit >= total}
            onClick={() => onPageChange(offset + limit)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
