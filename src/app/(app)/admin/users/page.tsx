/**
 * Page de gestion des utilisateurs (Admin)
 * Phase 4 - Admin Interface
 */

'use client';

import { useEffect, useState } from 'react';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadUsers();
  }, [offset, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(search && { query: search }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <p className="text-gray-500 mt-1">
          Rechercher, gérer et modérer les comptes utilisateurs
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par email ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Rechercher</Button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <UserManagementTable
          users={users}
          total={total}
          offset={offset}
          limit={limit}
          onPageChange={setOffset}
          onRefresh={loadUsers}
        />
      )}
    </div>
  );
}
