"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X, AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationId: string;
  simulationLabel: string;
}

export function ShareModal({ isOpen, onClose, simulationId, simulationLabel }: ShareModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch("/api/simulations/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulationId,
          expiresInDays: expiryDays,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.shareUrl);
        setExpiresAt(new Date(data.expiresAt));
      } else {
        alert("Erreur lors de la création du lien de partage");
      }
    } catch (error) {
      console.error("Error sharing simulation:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert("Impossible de copier le lien");
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setExpiresAt(null);
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Partager la simulation</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-blue-100 text-sm">{simulationLabel}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {!shareUrl ? (
                  <>
                    {/* Anonymization warning */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-2">
                            Données anonymisées
                          </h4>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>✓ Seuls les résultats de la simulation seront partagés</li>
                            <li>✓ Aucune information personnelle n'est incluse</li>
                            <li>✓ Le lien expire automatiquement</li>
                            <li>✓ Vous pouvez révoquer l'accès à tout moment</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Expiry selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Durée de validité du lien
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 7, 30, 90].map((days) => (
                          <button
                            key={days}
                            onClick={() => setExpiryDays(days)}
                            className={`
                              p-3 rounded-lg border-2 transition-all text-center
                              ${
                                expiryDays === days
                                  ? "bg-blue-100 border-blue-500 text-blue-900"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                              }
                            `}
                          >
                            <div className="text-lg font-bold">{days}</div>
                            <div className="text-xs">{days === 1 ? "jour" : "jours"}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Privacy info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                        Que verra la personne ?
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Le nom de la simulation</li>
                        <li>• Les résultats (total payé, total reçu, solde net)</li>
                        <li>• La comparaison avant/après</li>
                        <li>• Aucune donnée personnelle (nom, revenus exacts, etc.)</li>
                      </ul>
                    </div>

                    {/* Action button */}
                    <Button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3"
                    >
                      {isSharing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Création du lien...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-5 h-5 mr-2" />
                          Créer le lien de partage
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Success state */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-900 mb-1">
                            Lien créé avec succès !
                          </h4>
                          <p className="text-sm text-green-700">
                            Partagez ce lien avec qui vous voulez
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Share URL */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Lien de partage
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 font-mono break-all">
                          {shareUrl}
                        </div>
                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          className="flex-shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-2 text-green-600" />
                              Copié
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copier
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expiry info */}
                    {expiresAt && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="text-blue-900 font-semibold">Expire le : </span>
                          <span className="text-blue-700">
                            {expiresAt.toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(shareUrl, "_blank")}
                        variant="outline"
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Prévisualiser
                      </Button>
                      <Button onClick={handleClose} className="flex-1">
                        Fermer
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
