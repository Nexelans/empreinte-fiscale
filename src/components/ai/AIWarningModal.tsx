/**
 * Modal d'avertissement pour la transmission de données à l'IA
 * Phase 4 - Module AI
 *
 * Affiche un avertissement clair avant d'envoyer des données fiscales à l'IA
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AIWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  dataDescription: string;
}

export function AIWarningModal({
  open,
  onOpenChange,
  onConfirm,
  dataDescription,
}: AIWarningModalProps) {
  const [understood, setUnderstood] = useState(false);

  const handleConfirm = () => {
    if (understood) {
      onConfirm();
      setUnderstood(false);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setUnderstood(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Transmission de données à votre IA
          </DialogTitle>
          <DialogDescription>
            Veuillez lire attentivement avant de continuer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Données qui seront envoyées :</strong>
                </p>
                <p className="text-sm">{dataDescription}</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Ce que vous devez savoir :</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                Vos données seront envoyées au provider IA que vous avez configuré
              </li>
              <li>
                Empreinte Fiscale n'a aucun contrôle sur le traitement de vos données par
                ce provider
              </li>
              <li>
                Les données peuvent être utilisées pour améliorer les modèles du provider
                (selon leurs conditions)
              </li>
              <li>
                Nous vous recommandons de consulter la politique de confidentialité de
                votre provider IA
              </li>
              <li>
                Utilisez cette fonctionnalité uniquement si vous êtes à l'aise avec le
                partage de ces informations
              </li>
            </ul>
          </div>

          <div className="flex items-start gap-2 pt-4">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked as boolean)}
            />
            <label
              htmlFor="understood"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Je comprends que mes données fiscales seront transmises à mon provider IA et
              j'accepte de continuer
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!understood}>
            Confirmer et continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
