/**
 * Composant de partage des résultats du mode découverte
 * Phase 4 - Discovery Mode Enhancement
 *
 * Génère un lien partageable pour un profil type
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Check, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareResultProps {
  profilId: string;
  profilName: string;
  score: {
    totalPaye: number;
    totalRecu: number;
    soldeNet: number;
  };
}

export function ShareResult({ profilId, profilName, score }: ShareResultProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate shareable URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/decouverte?profil=${profilId}`;

  // Generate share text
  const shareText = `J'ai découvert mon profil fiscal "${profilName}" : ${
    score.soldeNet > 0
      ? `je contribue ${score.soldeNet.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € net`
      : `je reçois ${Math.abs(score.soldeNet).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € net`
  } par an sur Empreinte Fiscale 🔍`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Lien copié !',
        description: 'Le lien a été copié dans le presse-papier',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien',
        type: 'error',
      });
    }
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedin = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Partager ce profil
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager ce profil fiscal</DialogTitle>
          <DialogDescription>
            Partagez ce profil "{profilName}" avec vos amis pour comparer vos situations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link */}
          <div>
            <label className="text-sm font-medium mb-2 block">Lien de partage</label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <label className="text-sm font-medium mb-2 block">Partager sur</label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={shareOnTwitter} className="w-full">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" onClick={shareOnFacebook} className="w-full">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button variant="outline" onClick={shareOnLinkedin} className="w-full">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            </div>
          </div>

          {/* Preview Text */}
          <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1">Texte de partage :</p>
            <p className="italic">{shareText}</p>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            <p>
              ℹ️ Le lien partagé affiche uniquement le profil type, pas vos données personnelles.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
