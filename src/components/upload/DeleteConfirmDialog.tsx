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

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  documentType: string;
  uploadedAt: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  documentType,
  uploadedAt,
}: DeleteConfirmDialogProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Vous êtes sur le point de supprimer l'enregistrement du document suivant :
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm">
                <strong>Type :</strong> {documentType}
              </p>
              <p className="text-sm">
                <strong>Importé le :</strong> {formatDate(uploadedAt)}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-yellow-900 mb-1">⚠️ Attention :</p>
              <p className="text-yellow-800">
                Cette action ne supprimera que l'enregistrement de l'import. Les données déjà
                intégrées à votre profil fiscal resteront inchangées.
              </p>
            </div>

            <p className="text-sm text-gray-600">
              Pour supprimer les données de votre profil, rendez-vous dans la section "Mes données".
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Supprimer l'enregistrement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
