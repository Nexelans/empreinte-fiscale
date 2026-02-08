/**
 * Layout pour l'interface admin
 * Phase 4 - Admin Interface
 *
 * Navigation et protection des routes admin
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Database,
  BarChart3,
  Settings,
  Shield,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'view_analytics',
  },
  {
    title: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    permission: 'manage_users',
  },
  {
    title: 'Référentiel',
    href: '/admin/referentiel',
    icon: Database,
    permission: 'manage_referentiel',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'view_analytics',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'view_analytics',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Vérifier le rôle admin
    checkAdminRole();
  }, [status, session, router]);

  const checkAdminRole = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/health');

      if (response.status === 403) {
        // Pas admin
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin role:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
          <Shield className="h-6 w-6 text-red-600" />
          <h1 className="text-xl font-bold">Admin</h1>
        </div>

        <nav className="p-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-red-50 text-red-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
              Retour à l'app
            </Link>
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
