"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConsentDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  fileName?: string;
}

export function ConsentDialog({ isOpen, onAccept, onDecline, fileName }: ConsentDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Consentement RGPD</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="font-medium text-gray-900">
              {fileName && `Document : ${fileName}`}
            </p>

            <p>
              Vos données seront extraites automatiquement puis le document sera{" "}
              <strong>immédiatement supprimé</strong>.
            </p>

            <p>
              Les données extraites seront stockées dans votre profil fiscal. Vous pourrez les
              consulter, les modifier ou les supprimer à tout moment depuis la page "Mes données".
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-900 mb-1">🔒 Nous garantissons :</p>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Aucun stockage du document original</li>
                <li>Extraction en mémoire uniquement</li>
                <li>Suppression immédiate après traitement</li>
                <li>Données chiffrées en base de données</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              En cliquant sur "Accepter", vous consentez au traitement de ce document conformément
              à notre politique de confidentialité et au RGPD.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDecline}>Refuser</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>Accepter et continuer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
