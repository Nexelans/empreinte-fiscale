"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileJson, Loader2, Check } from "lucide-react";

interface ExportButtonProps {
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
}

export function ExportButton({
  startYear,
  startMonth,
  endYear,
  endMonth,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<"csv" | "json" | null>(null);

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    setExportedFormat(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set("format", format);
      if (startYear) params.set("startYear", startYear.toString());
      if (startMonth) params.set("startMonth", startMonth.toString());
      if (endYear) params.set("endYear", endYear.toString());
      if (endMonth) params.set("endMonth", endMonth.toString());

      // Fetch export
      const response = await fetch(`/api/score/history/export?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename =
        filenameMatch?.[1] ||
        `empreinte-fiscale-${new Date().toISOString().split("T")[0]}.${format}`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success
      setExportedFormat(format);
      setTimeout(() => {
        setExportedFormat(null);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Export error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'export"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Exporter
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => !isExporting && setIsOpen(false)}
          ></div>

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border-2 border-gray-200 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <p className="font-semibold text-gray-900">Format d'export</p>
              <p className="text-xs text-gray-600 mt-1">
                Choisissez le format de téléchargement
              </p>
            </div>

            <div className="p-2 space-y-1">
              {/* CSV option */}
              <button
                onClick={() => handleExport("csv")}
                disabled={isExporting}
                className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex-shrink-0">
                  {exportedFormat === "csv" ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">CSV</p>
                  <p className="text-xs text-gray-600">
                    Compatible Excel, Google Sheets
                  </p>
                </div>
              </button>

              {/* JSON option */}
              <button
                onClick={() => handleExport("json")}
                disabled={isExporting}
                className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex-shrink-0">
                  {exportedFormat === "json" ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <FileJson className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">JSON</p>
                  <p className="text-xs text-gray-600">
                    Format structuré avec détails complets
                  </p>
                </div>
              </button>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                💡 L'export inclut toutes les données de la période sélectionnée
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
