"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Download, Trash2, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [wrappedOptIn, setWrappedOptIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger les préférences wrapped
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        const data = await response.json();
        setWrappedOptIn(data.wrappedOptIn || false);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  // Sauvegarder la préférence wrapped
  const handleWrappedToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wrappedOptIn: checked }),
      });

      if (response.ok) {
        setWrappedOptIn(checked);
      }
    } catch (error) {
      console.error('Error updating preference:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Paramètres</h1>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du compte</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-medium">{session?.user?.email}</p>
            </div>
            {session?.user?.name && (
              <div>
                <label className="text-sm text-gray-600">Nom</label>
                <p className="font-medium">{session.user.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Confidentialité & Données</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Wrapped Fiscal annuel
                </p>
                <p className="text-sm text-gray-600">
                  Générer automatiquement un bilan annuel de votre empreinte fiscale (à la fin de chaque année).
                  Vous pourrez le consulter, le télécharger et le partager sur les réseaux sociaux.
                </p>
              </div>
              <Switch
                checked={wrappedOptIn}
                onCheckedChange={handleWrappedToggle}
                disabled={loading}
              />
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="font-medium">Exporter mes données</p>
                <p className="text-sm text-gray-600">
                  Téléchargez une copie de toutes vos données (RGPD Art. 20)
                </p>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exporter
              </Button>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <p className="font-medium text-red-600">Supprimer mon compte</p>
                <p className="text-sm text-gray-600">
                  Suppression définitive de toutes vos données (RGPD Art. 17)
                </p>
              </div>
              <Button variant="outline" className="text-red-600 border-red-600 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Préférences</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notifications
                </p>
                <p className="text-sm text-gray-600">
                  Gérez vos préférences de notification (email, push, in-app)
                </p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = "/settings/notifications"}>
                Configurer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
