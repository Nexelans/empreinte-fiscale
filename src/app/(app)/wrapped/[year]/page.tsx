/**
 * Page d'affichage du bilan annuel Wrapped avec animation
 * Phase 4 - Module Wrapped
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WrappedData, WrappedTheme } from '@/modules/wrapped/types';
import { WrappedAnimation } from '@/components/wrapped/WrappedAnimation';
import { ThemeSelector } from '@/components/wrapped/ThemeSelector';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Palette, ArrowLeft } from 'lucide-react';

export default function WrappedYearPage() {
  const params = useParams();
  const router = useRouter();
  const year = parseInt(params.year as string);
  const [wrappedData, setWrappedData] = useState<WrappedData | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<WrappedTheme>(
    WrappedTheme.CLASSIC
  );
  const [loading, setLoading] = useState(true);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWrappedData();
  }, [year, selectedTheme]);

  const loadWrappedData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/wrapped/${year}?theme=${selectedTheme}`
      );

      if (!response.ok) {
        throw new Error('Failed to load wrapped data');
      }

      const data = await response.json();
      setWrappedData(data.wrapped);
    } catch (error) {
      console.error('Error loading wrapped:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le bilan annuel',
        type: 'error',
      });
      router.push('/wrapped');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch(`/api/wrapped/${year}/share`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/wrapped/shared/${data.shareLink.token}`;

      // Copier dans le presse-papier
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: 'Lien copié',
        description: 'Le lien de partage a été copié dans le presse-papier',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le lien de partage',
        type: 'error',
      });
    }
  };

  const handleDownload = async () => {
    toast({
      title: 'Fonctionnalité à venir',
      description: 'Le téléchargement PNG/MP4 sera bientôt disponible',
    });
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  if (!wrappedData) {
    return null;
  }

  return (
    <div className="relative">
      {/* Back button & Theme button (floating) */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/wrapped')}
          className="bg-black/50 text-white hover:bg-black/70"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/50 text-white hover:bg-black/70"
            >
              <Palette className="h-4 w-4 mr-2" />
              Thème
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choisir un thème</DialogTitle>
              <DialogDescription>
                Personnalisez l'apparence de votre bilan annuel
              </DialogDescription>
            </DialogHeader>
            <ThemeSelector
              selectedTheme={selectedTheme}
              onThemeChange={(theme) => {
                setSelectedTheme(theme);
                setThemeDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Wrapped animation */}
      <WrappedAnimation
        data={wrappedData}
        autoPlay={false}
        onComplete={() => {
          toast({
            title: 'Bilan terminé',
            description: 'Vous pouvez maintenant le partager avec vos amis',
          });
        }}
      />
    </div>
  );
}
