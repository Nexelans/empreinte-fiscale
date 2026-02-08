/**
 * Page galerie des bilans annuels Wrapped
 * Phase 4 - Module Wrapped
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';

interface AvailableYear {
  year: number;
  hasData: boolean;
  monthCount: number;
}

export default function WrappedPage() {
  const router = useRouter();
  const [availableYears, setAvailableYears] = useState<AvailableYear[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableYears();
  }, []);

  const loadAvailableYears = async () => {
    setLoading(true);
    try {
      // Récupérer les années avec données depuis l'historique
      const response = await fetch('/api/score/history');
      if (response.ok) {
        const data = await response.json();

        // Grouper par année
        const yearMap = new Map<number, number>();
        data.history?.forEach((entry: any) => {
          const year = entry.year;
          yearMap.set(year, (yearMap.get(year) || 0) + 1);
        });

        // Convertir en tableau
        const years: AvailableYear[] = Array.from(yearMap.entries()).map(
          ([year, count]) => ({
            year,
            hasData: count >= 6, // Minimum 6 mois pour générer un Wrapped
            monthCount: count,
          })
        );

        // Trier par année décroissante
        years.sort((a, b) => b.year - a.year);

        setAvailableYears(years);
      }
    } catch (error) {
      console.error('Error loading available years:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Mes Bilans Fiscaux</h1>
        </div>
        <p className="text-muted-foreground">
          Revivez vos années fiscales en quelques chiffres
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-24 mb-2" />
                <div className="h-4 bg-muted rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : availableYears.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Aucun bilan disponible
            </h2>
            <p className="text-muted-foreground mb-6">
              Utilisez l'application pendant au moins 6 mois pour générer votre
              premier bilan annuel
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {availableYears.map((yearData) => (
            <Card
              key={yearData.year}
              className={
                yearData.hasData
                  ? 'hover:shadow-lg transition-shadow cursor-pointer'
                  : 'opacity-60'
              }
              onClick={() =>
                yearData.hasData && router.push(`/wrapped/${yearData.year}`)
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{yearData.year}</span>
                  {yearData.hasData && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardTitle>
                <CardDescription>
                  {yearData.monthCount} mois de données
                  {!yearData.hasData && ' (minimum 6 mois requis)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {yearData.hasData ? (
                  <Button className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Voir le bilan
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Données insuffisantes
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">À propos des bilans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Chaque bilan compile vos données fiscales de l'année en une animation
            engageante que vous pouvez partager.
          </p>
          <p className="text-muted-foreground">
            Les bilans sont générés automatiquement dès que vous avez au moins 6
            mois de données fiscales pour une année donnée.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
