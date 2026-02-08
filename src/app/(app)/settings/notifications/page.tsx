"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationPreferencesForm } from "@/components/notifications/NotificationPreferencesForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Info, CheckCircle } from "lucide-react";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSave = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/settings")}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux paramètres
          </Button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="text-gray-600">
                Gérez vos préférences de notification
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">
              Vos préférences ont été enregistrées avec succès !
            </p>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">
                À propos des notifications
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>
                  • <strong>Fait fiscal du jour</strong> : Recevez chaque matin
                  un fait intéressant personnalisé avec vos données réelles
                </li>
                <li>
                  • <strong>Alertes fiscales</strong> : Ne manquez plus jamais
                  une échéance importante (déclaration, paiements)
                </li>
                <li>
                  • <strong>Résumé hebdomadaire</strong> : Un bilan complet de
                  votre activité fiscale chaque dimanche
                </li>
                <li>
                  • <strong>Notifications instantanées</strong> : Badges
                  débloqués, défis accomplis, niveaux gagnés
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
          <NotificationPreferencesForm onSave={handleSave} />
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Privacy Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              🔒 Confidentialité
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Vos préférences de notification sont strictement personnelles et
              ne sont jamais partagées avec des tiers.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>✓ Données chiffrées</li>
              <li>✓ Conformité RGPD</li>
              <li>✓ Désabonnement instantané</li>
            </ul>
          </div>

          {/* Delivery Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              📬 Canaux de livraison
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">In-App</p>
                <p className="text-gray-500 text-xs">
                  Instantané, visible dans l'application
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Email</p>
                <p className="text-gray-500 text-xs">
                  Envoyé à {getUserEmail()}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Push</p>
                <p className="text-gray-500 text-xs">
                  Sur votre appareil (bientôt disponible)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h3>
          <div className="space-y-4">
            <FAQItem
              question="Puis-je changer mes préférences à tout moment ?"
              answer="Oui, vous pouvez modifier vos préférences de notification quand vous le souhaitez. Les changements sont appliqués immédiatement."
            />
            <FAQItem
              question="Que se passe-t-il si je désactive toutes les notifications ?"
              answer="Vous continuerez à recevoir les notifications in-app pour les événements importants liés à votre compte, mais vous ne recevrez plus d'emails ni de notifications push."
            />
            <FAQItem
              question="Comment fonctionnent les heures de silence ?"
              answer="Pendant les heures de silence, vous ne recevrez pas de notifications par email ou push. Les notifications in-app seront toujours disponibles mais sans alerte sonore."
            />
            <FAQItem
              question="Puis-je tester mes paramètres ?"
              answer="Oui, utilisez le bouton 'Envoyer une notification de test' pour vérifier que vos préférences fonctionnent correctement."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push("/settings")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux paramètres
          </Button>

          <div className="text-sm text-gray-500">
            Dernière modification : {new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-start justify-between gap-4 group"
      >
        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {question}
        </span>
        <span className="text-gray-400 flex-shrink-0">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

function getUserEmail(): string {
  // This would normally come from session
  // For now, return a placeholder
  if (typeof window !== "undefined") {
    return "votre.email@example.com";
  }
  return "";
}
