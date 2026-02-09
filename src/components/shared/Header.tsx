"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? "bg-blue-100 text-blue-900"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl">🏛️</div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                Empreinte Fiscale
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">
                Votre relation avec l'État
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {status === "loading" ? (
              <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
            ) : session ? (
              // Logged in navigation
              <>
                <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                  📊 Dashboard
                </Link>
                <Link href="/profil" className={navLinkClass("/profil")}>
                  👤 Profil
                </Link>
                <Link href="/journal" className={navLinkClass("/journal")}>
                  📅 Journal
                </Link>
                <Link href="/evolution" className={navLinkClass("/evolution")}>
                  📈 Évolution
                </Link>
                <Link href="/simulations" className={navLinkClass("/simulations")}>
                  🔮 Simulations
                </Link>
                <Link href="/gamification" className={navLinkClass("/gamification")}>
                  🏆 Badges
                </Link>
                <Link href="/quiz" className={navLinkClass("/quiz")}>
                  🎯 Quiz
                </Link>
                <div className="ml-4 flex items-center gap-2 pl-4 border-l border-gray-300">
                  <span className="text-sm text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Déconnexion
                  </Button>
                </div>
              </>
            ) : (
              // Logged out navigation
              <>
                <Link href="/decouverte" className={navLinkClass("/decouverte")}>
                  🔍 Découverte
                </Link>
                <Link href="/quiz" className={navLinkClass("/quiz")}>
                  🎯 Quiz
                </Link>
                <div className="ml-4 flex items-center gap-2 pl-4 border-l border-gray-300">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Créer un compte</Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block ${navLinkClass("/dashboard")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/profil"
                  className={`block ${navLinkClass("/profil")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Profil
                </Link>
                <Link
                  href="/journal"
                  className={`block ${navLinkClass("/journal")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📅 Journal
                </Link>
                <Link
                  href="/evolution"
                  className={`block ${navLinkClass("/evolution")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📈 Évolution
                </Link>
                <Link
                  href="/simulations"
                  className={`block ${navLinkClass("/simulations")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔮 Simulations
                </Link>
                <Link
                  href="/gamification"
                  className={`block ${navLinkClass("/gamification")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🏆 Badges
                </Link>
                <Link
                  href="/quiz"
                  className={`block ${navLinkClass("/quiz")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🎯 Quiz
                </Link>
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-700">
                    {session.user?.name || session.user?.email}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                  >
                    Déconnexion
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/decouverte"
                  className={`block ${navLinkClass("/decouverte")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔍 Découverte
                </Link>
                <Link
                  href="/quiz"
                  className={`block ${navLinkClass("/quiz")}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🎯 Quiz
                </Link>
                <div className="pt-4 space-y-2">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Créer un compte
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
