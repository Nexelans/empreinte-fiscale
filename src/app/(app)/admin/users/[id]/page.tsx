/**
 * Page de détail d'un utilisateur (Admin)
 * Phase 4 - Admin Interface
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Shield,
  Mail,
  Calendar,
  FileText,
  Bell,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  User,
} from 'lucide-react';

interface UserDetails {
  id: string;
  email: string;
  name: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  adminRole: string | null;
  profilFiscal: {
    statut: string | null;
    nombreParts: number | null;
    isComplete: boolean;
  } | null;
  stats: {
    documentCount: number;
    notificationCount: number;
    lastLoginAt?: string;
  };
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const userId = params.id as string;

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({ title: 'Utilisateur introuvable', variant: 'destructive' });
          router.push('/admin/users');
          return;
        }
        throw new Error('Failed to load user');
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      toast({ title: 'Erreur de chargement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      toast({ title: 'Utilisateur supprimé (RGPD)' });
      router.push('/admin/users');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {user.name || user.email}
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-mono">{user.id}</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer (RGPD)
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera toutes les données de{' '}
                <strong>{user.email}</strong> conformément au RGPD (droit à
                l'oubli). Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user.emailVerified ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 shrink-0" />
              )}
              <div>
                <p className="text-xs text-gray-500">Email vérifié</p>
                <p className="font-medium">
                  {user.emailVerified
                    ? `Oui — ${new Date(user.emailVerified).toLocaleDateString('fr-FR')}`
                    : 'Non vérifié'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Rôle</p>
                {user.adminRole ? (
                  <Badge variant="secondary">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.adminRole}
                  </Badge>
                ) : (
                  <p className="font-medium">Utilisateur standard</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Créé le</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Dernière mise à jour</p>
                <p className="font-medium">
                  {new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Documents uploadés</span>
              </div>
              <Badge variant="outline">{user.stats.documentCount}</Badge>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Notifications</span>
              </div>
              <Badge variant="outline">{user.stats.notificationCount}</Badge>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Profil fiscal</span>
              </div>
              {user.profilFiscal ? (
                <Badge
                  variant={user.profilFiscal.isComplete ? 'default' : 'outline'}
                >
                  {user.profilFiscal.isComplete ? 'Complet' : 'En cours'}
                </Badge>
              ) : (
                <Badge variant="outline">Non rempli</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profil fiscal */}
        {user.profilFiscal && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profil Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500">Statut</p>
                <p className="font-medium capitalize">
                  {user.profilFiscal.statut || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nombre de parts</p>
                <p className="font-medium">
                  {user.profilFiscal.nombreParts ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Complété</p>
                <p className="font-medium">
                  {user.profilFiscal.isComplete ? 'Oui' : 'Non'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
