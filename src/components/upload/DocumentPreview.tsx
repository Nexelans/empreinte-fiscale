"use client";

import { DocumentType } from "@/modules/documents/types";

interface DocumentPreviewProps {
  file: File;
  documentType: DocumentType;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  bulletin_paie: "Bulletin de paie",
  avis_imposition: "Avis d'imposition",
  taxe_fonciere: "Avis de taxe foncière",
  releve_caf: "Relevé CAF",
};

export function DocumentPreview({ file, documentType }: DocumentPreviewProps) {
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-3xl">📄</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{file.name}</h3>
          <dl className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <dt className="font-medium text-gray-500">Type :</dt>
              <dd className="text-gray-900">{DOCUMENT_TYPE_LABELS[documentType]}</dd>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <dt className="font-medium text-gray-500">Taille :</dt>
              <dd className="text-gray-900">{fileSizeMB} MB</dd>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <dt className="font-medium text-gray-500">Format :</dt>
              <dd className="text-gray-900">PDF</dd>
            </div>
          </dl>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Prêt à analyser
          </span>
        </div>
      </div>
    </div>
  );
}
