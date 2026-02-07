"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { BreakdownChart } from "@/components/dashboard/BreakdownChart";
import { ConfianceScore } from "@/components/dashboard/ConfianceScore";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profil, setProfil] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [confiance, setConfiance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load profil
      const profilRes = await fetch("/api/profil");
      if (profilRes.ok) {
        const profilData = await profilRes.json();
        setProfil(profilData);

        // If profil is complete, calculate score
        if (profilData.isComplete) {
          const [scoreRes, confianceRes] = await Promise.all([
            fetch("/api/score"),
            fetch("/api/score/confiance"),
          ]);

          if (scoreRes.ok) {
            const scoreData = await scoreRes.json();
            setScore(scoreData);
          }

          if (confianceRes.ok) {
            const confianceData = await confianceRes.json();
            setConfiance(confianceData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  // If profil not complete, show CTA
  if (!profil || !profil.isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue {session?.user?.name || ""}!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Complétez votre profil fiscal pour découvrir votre score et visualiser votre relation
            financière avec l'État.
          </p>
          <Link href="/profil">
            <Button size="lg">Commencer mon profil</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If profil complete but no score yet, show loading
  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <div className="text-6xl mb-4">🧮</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Calcul de votre score en cours...
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Nous analysons votre profil pour calculer votre score fiscal personnalisé.
          </p>
          <Button onClick={loadData}>Actualiser</Button>
        </div>
      </div>
    );
  }

  // Prepare data for breakdown charts
  const payeItems = Object.entries(score.detailPaye)
    .filter(([, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
      color: "#ef4444",
    }));

  const recuTransfertsItems = Object.entries(score.detailRecu.transfertsDirects)
    .filter(([, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      label: key.replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
      color: "#10b981",
    }));

  const recuServicesItems = Object.entries(score.detailRecu.servicesMutualises)
    .filter(([, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      label: key.replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
      color: "#3b82f6",
    }));

  // Show dashboard with score
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Votre Score Fiscal</h1>
            <p className="text-gray-600">Année {score.annee}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/journal">
              <Button variant="outline" className="flex items-center gap-2">
                <span>📸</span>
                <span>Scanner un ticket</span>
              </Button>
            </Link>
            <Link href="/documents">
              <Button variant="outline" className="flex items-center gap-2">
                <span>📄</span>
                <span>Importer un document</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ScoreCard
            title="Ce que je paie"
            value={score.totalPaye}
            subtitle="Impôts + cotisations + taxes"
            color="red"
            icon="💸"
          />
          <ScoreCard
            title="Ce que je reçois"
            value={score.totalRecu}
            subtitle="Transferts + services publics"
            color="green"
            icon="🎁"
          />
          <ScoreCard
            title="Solde net"
            value={score.soldeNet}
            subtitle={score.soldeNet > 0 ? "Contributeur net" : "Bénéficiaire net"}
            color="blue"
            icon={score.soldeNet > 0 ? "📈" : "📉"}
          />
        </div>

        {/* Breakdown and Confidence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <BreakdownChart
              title="Détail : Ce que je paie"
              items={payeItems}
              total={score.totalPaye}
            />
            <BreakdownChart
              title="Détail : Ce que je reçois (Transferts)"
              items={recuTransfertsItems}
              total={Object.values(score.detailRecu.transfertsDirects).reduce(
                (sum: number, val) => sum + (val as number),
                0
              )}
            />
            <BreakdownChart
              title="Détail : Services mutualisés"
              items={recuServicesItems}
              total={Object.values(score.detailRecu.servicesMutualises).reduce(
                (sum: number, val) => sum + (val as number),
                0
              )}
            />
          </div>

          <div>
            {confiance && <ConfianceScore scoreConfiance={confiance} />}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/profil">
            <Button variant="outline">Modifier mon profil</Button>
          </Link>
          <Link href="/simulations">
            <Button>Faire une simulation</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
