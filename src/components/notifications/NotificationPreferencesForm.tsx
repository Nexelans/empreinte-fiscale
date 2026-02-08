"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Smartphone, Check, AlertCircle, Loader2 } from "lucide-react";
import { QuietHoursSelector } from "./QuietHoursSelector";

interface NotificationPreferences {
  dailyFactsEnabled: boolean;
  fiscalAlertsEnabled: boolean;
  weeklyDigestEnabled: boolean;
  emailChannel: boolean;
  pushChannel: boolean;
  inAppChannel: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  timezone: string;
}

interface NotificationPreferencesFormProps {
  onSave?: (preferences: NotificationPreferences) => void;
}

export function NotificationPreferencesForm({
  onSave,
}: NotificationPreferencesFormProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    dailyFactsEnabled: false,
    fiscalAlertsEnabled: true,
    weeklyDigestEnabled: false,
    emailChannel: true,
    pushChannel: false,
    inAppChannel: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    timezone: "Europe/Paris",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications/preferences");
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      setErrorMessage("Erreur lors du chargement des préférences");
      setSaveStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
        setSaveStatus("success");
        if (onSave) {
          onSave(data.preferences);
        }

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      } else {
        const error = await res.json();
        setErrorMessage(error.error || "Erreur lors de la sauvegarde");
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setErrorMessage("Erreur réseau lors de la sauvegarde");
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channels: [
            preferences.inAppChannel && "in-app",
            preferences.emailChannel && "email",
            preferences.pushChannel && "push",
          ].filter(Boolean),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          alert("✅ Notification de test envoyée avec succès !");
        } else {
          alert(
            `⚠️ Notification envoyée partiellement :\n\n${data.tips.join("\n")}`
          );
        }
      }
    } catch (error) {
      alert("❌ Erreur lors de l'envoi de la notification de test");
    }
  };

  const handleDisableAll = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir désactiver toutes les notifications ? Vous ne recevrez plus aucun email ni notification push."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchPreferences();
        alert("✅ Toutes les notifications ont été désactivées");
      }
    } catch (error) {
      alert("❌ Erreur lors de la désactivation des notifications");
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const atLeastOneChannelEnabled =
    preferences.emailChannel ||
    preferences.pushChannel ||
    preferences.inAppChannel;

  return (
    <div className="space-y-8">
      {/* Notification Types */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Types de notifications
        </h3>
        <div className="space-y-4">
          <NotificationToggle
            icon="💡"
            label="Fait fiscal du jour"
            description="Recevez chaque matin un fait intéressant personnalisé avec vos données"
            enabled={preferences.dailyFactsEnabled}
            onChange={(value) => updatePreference("dailyFactsEnabled", value)}
          />

          <NotificationToggle
            icon="⏰"
            label="Alertes fiscales"
            description="Rappels pour les échéances fiscales importantes (déclaration, paiements)"
            enabled={preferences.fiscalAlertsEnabled}
            onChange={(value) => updatePreference("fiscalAlertsEnabled", value)}
            recommended
          />

          <NotificationToggle
            icon="📊"
            label="Résumé hebdomadaire"
            description="Bilan de votre activité fiscale chaque dimanche soir"
            enabled={preferences.weeklyDigestEnabled}
            onChange={(value) => updatePreference("weeklyDigestEnabled", value)}
          />
        </div>
      </section>

      {/* Notification Channels */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Canaux de notification
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choisissez comment vous souhaitez recevoir les notifications
        </p>
        <div className="space-y-4">
          <ChannelToggle
            icon={<Bell className="w-5 h-5" />}
            label="In-App"
            description="Notifications dans l'application"
            enabled={preferences.inAppChannel}
            onChange={(value) => updatePreference("inAppChannel", value)}
            disabled={
              !atLeastOneChannelEnabled &&
              !preferences.inAppChannel
            }
            recommended
          />

          <ChannelToggle
            icon={<Mail className="w-5 h-5" />}
            label="Email"
            description="Notifications par email"
            enabled={preferences.emailChannel}
            onChange={(value) => updatePreference("emailChannel", value)}
            disabled={
              !atLeastOneChannelEnabled && !preferences.emailChannel
            }
          />

          <ChannelToggle
            icon={<Smartphone className="w-5 h-5" />}
            label="Push"
            description="Notifications push sur votre appareil"
            enabled={preferences.pushChannel}
            onChange={(value) => updatePreference("pushChannel", value)}
            disabled={
              !atLeastOneChannelEnabled && !preferences.pushChannel
            }
            badge="Bientôt"
          />
        </div>

        {!atLeastOneChannelEnabled && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Au moins un canal doit rester activé pour recevoir les notifications importantes
            </p>
          </div>
        )}
      </section>

      {/* Quiet Hours */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Heures de silence</h3>
        <p className="text-sm text-gray-600 mb-4">
          Définissez une plage horaire pendant laquelle vous ne souhaitez pas recevoir de notifications
        </p>
        <QuietHoursSelector
          startHour={preferences.quietHoursStart}
          endHour={preferences.quietHoursEnd}
          onChange={(start, end) => {
            updatePreference("quietHoursStart", start);
            updatePreference("quietHoursEnd", end);
          }}
        />
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les préférences"
          )}
        </Button>

        <Button variant="outline" onClick={handleTestNotification}>
          Envoyer une notification de test
        </Button>

        <Button
          variant="outline"
          onClick={handleDisableAll}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Tout désactiver
        </Button>
      </div>

      {/* Save Status */}
      {saveStatus === "success" && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">
            Préférences enregistrées avec succès
          </p>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

interface NotificationToggleProps {
  icon: string;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  recommended?: boolean;
}

function NotificationToggle({
  icon,
  label,
  description,
  enabled,
  onChange,
  recommended,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
      <div className="text-3xl mt-1">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900">{label}</h4>
          {recommended && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Recommandé
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}

interface ChannelToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  recommended?: boolean;
  badge?: string;
}

function ChannelToggle({
  icon,
  label,
  description,
  enabled,
  onChange,
  disabled,
  recommended,
  badge,
}: ChannelToggleProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white border-2 rounded-xl transition-colors ${
        disabled
          ? "border-gray-100 opacity-50 cursor-not-allowed"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="text-gray-600">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900">{label}</h4>
          {recommended && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Recommandé
            </span>
          )}
          {badge && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
      </label>
    </div>
  );
}
