'use client';

/**
 * Modal de consentement RGPD pour la transmission de données à l'IA
 * Phase 4 - Module AI
 *
 * Affichée avant la première configuration IA de l'utilisateur
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Lock, FileText } from 'lucide-react';

interface AIConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function AIConsentModal({
  open,
  onOpenChange,
  onAccept,
  onDecline,
}: AIConsentModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
      onOpenChange(false);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-amber-100">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-xl">
              Consentement RGPD - Transmission de données
            </DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-4 pt-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <strong>Informations importantes</strong>
                <p className="mt-1">
                  En configurant votre IA personnelle, vos données fiscales seront transmises
                  au provider IA que vous aurez choisi (OpenAI, Anthropic, Mistral, Google,
                  ou votre propre endpoint).
                </p>
              </div>
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Données transmises</p>
                  <p className="text-sm text-gray-600">
                    Votre profil fiscal complet (revenus, patrimoine, situation personnelle)
                    et vos documents analysés seront envoyés au provider IA pour analyse.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Sécurité</p>
                  <p className="text-sm text-gray-600">
                    Votre clé API est chiffrée avec AES-256 et jamais transmise au
                    navigateur. Les appels passent par notre serveur sécurisé.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Vos droits RGPD</p>
                  <p className="text-sm text-gray-600">
                    Vous pouvez révoquer ce consentement à tout moment depuis vos
                    paramètres. La configuration IA sera alors automatiquement supprimée.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              <p className="font-medium mb-2">Responsabilité du provider</p>
              <p>
                Les données envoyées au provider IA sont soumises à leur propre politique
                de confidentialité. Empreinte Fiscale n'est pas responsable de l'usage fait
                par le provider de vos données. Consultez les politiques de confidentialité
                de chaque provider avant configuration.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isAccepting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAccepting ? 'Enregistrement...' : 'J\'accepte et je configure mon IA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
