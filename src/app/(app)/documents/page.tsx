"use client";

import { useEffect, useState } from "react";
import { useDocumentUpload } from "@/modules/documents/hooks/useDocumentUpload";
import { UploadZone } from "@/components/upload/UploadZone";
import { ConsentDialog } from "@/components/upload/ConsentDialog";
import { DocumentPreview } from "@/components/upload/DocumentPreview";
import { ValidationForm } from "@/components/upload/ValidationForm";
import { DeleteConfirmDialog } from "@/components/upload/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { DocumentType } from "@/modules/documents/types";

interface DocumentHistoryItem {
  id: string;
  type: DocumentType;
  status: string;
  uploadedAt: string;
  metadata?: any;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  bulletin_paie: "Bulletin de paie",
  avis_imposition: "Avis d'imposition",
  taxe_fonciere: "Avis de taxe foncière",
  releve_caf: "Relevé CAF",
};

export default function DocumentsPage() {
  const {
    step,
    file,
    documentType,
    parseResult,
    error,
    isLoading,
    selectFile,
    acceptConsent,
    declineConsent,
    confirmValidation,
    cancelValidation,
    reset,
  } = useDocumentUpload();

  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch upload history on mount and after successful upload
  useEffect(() => {
    fetchHistory();
  }, []);

  // Refresh history after successful upload
  useEffect(() => {
    if (step === "success") {
      fetchHistory();
    }
  }, [step]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/documents/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data.documents || []);
      }
    } catch (err) {
      console.error("[DocumentsPage] Failed to fetch history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = (document: DocumentHistoryItem) => {
    setDocumentToDelete(document);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      // Refresh history after deletion
      await fetchHistory();
      setDocumentToDelete(null);
    } catch (err) {
      console.error("[DocumentsPage] Delete error:", err);
      alert(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDocumentToDelete(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes documents</h1>
        <p className="text-gray-600 mt-2">
          Importez vos documents fiscaux pour vérifier automatiquement votre profil
        </p>
      </div>

      {/* Upload Flow */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        {step === "idle" && (
          <UploadZone onFileSelect={selectFile} isLoading={isLoading} />
        )}

        {step === "consent" && file && documentType && (
          <>
            <DocumentPreview file={file} documentType={documentType} />
            <ConsentDialog
              isOpen={true}
              fileName={file.name}
              onAccept={acceptConsent}
              onDecline={declineConsent}
            />
          </>
        )}

        {step === "uploading" && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">
              Analyse du document en cours...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Extraction des données, veuillez patienter
            </p>
          </div>
        )}

        {step === "validating" && parseResult && documentType && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Validation des données
            </h2>
            <ValidationForm
              parseResult={parseResult}
              documentType={documentType}
              onConfirm={confirmValidation}
              onCancel={cancelValidation}
              isSubmitting={isLoading}
            />
          </div>
        )}

        {step === "submitting" && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600 font-medium">
              Intégration des données...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Mise à jour de votre profil fiscal
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Document traité avec succès !
            </h3>
            <p className="text-gray-600 mb-6">
              Les données ont été intégrées à votre profil fiscal
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                variant="default"
              >
                Voir mon dashboard
              </Button>
              <Button onClick={reset} variant="outline">
                Importer un autre document
              </Button>
            </div>
          </div>
        )}

        {step === "error" && error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-3xl">✕</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur lors du traitement
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={reset} variant="outline">
              Réessayer
            </Button>
          </div>
        )}
      </div>

      {/* Upload History */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Historique des importations
        </h2>

        {isLoadingHistory ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            <p className="text-gray-500 text-sm mt-2">Chargement...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Aucun document importé pour le moment</p>
            <p className="text-xs mt-1">
              Importez votre premier document ci-dessus pour commencer
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Type de document
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Date d'import
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {DOCUMENT_TYPE_LABELS[item.type as DocumentType] || item.type}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(item.uploadedAt)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "VALIDATED"
                            ? "bg-green-100 text-green-800"
                            : item.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status === "VALIDATED"
                          ? "✓ Validé"
                          : item.status === "FAILED"
                          ? "✕ Échoué"
                          : item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        🗑️ Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {documentToDelete && (
        <DeleteConfirmDialog
          isOpen={true}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          documentType={DOCUMENT_TYPE_LABELS[documentToDelete.type as DocumentType] || documentToDelete.type}
          uploadedAt={documentToDelete.uploadedAt}
        />
      )}
    </div>
  );
}
