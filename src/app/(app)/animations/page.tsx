"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FiscalDayAnimation } from "@/components/animations/FiscalDayAnimation";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Share2,
  Download,
  Copy,
  Check,
  Calendar,
  Settings,
  Twitter,
  Linkedin,
  Facebook,
  Code,
  Palette,
  Gauge,
  Music,
} from "lucide-react";
import type { FiscalDayData, AnimationConfig } from "@/modules/animations/types";

type Theme = "moderne" | "vintage" | "minimaliste" | "colore";

export default function AnimationsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [animationData, setAnimationData] = useState<FiscalDayData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  // Animation config (Tasks 26.8, 26.9, 26.10)
  const [config, setConfig] = useState<AnimationConfig>({
    duration: 3,
    theme: "moderne",
    speed: 1,
    enableMusic: false,
    autoPlay: true,
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnimation();
    }
  }, [session, selectedDate]);

  const fetchAnimation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/animations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          useJournalData: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnimationData(data.data);
      } else {
        console.error("Failed to generate animation");
      }
    } catch (error) {
      console.error("Error fetching animation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Task 26.4: Share with anonymization confirmation
  const handleShare = async () => {
    if (!animationData) return;

    const confirmed = confirm(
      "Cette animation sera rendue anonyme avant le partage :\n\n" +
        "• Votre identité sera masquée\n" +
        "• Les montants seront arrondis au 5€ près\n" +
        "• Le lien expirera dans 7 jours\n\n" +
        "Voulez-vous continuer ?"
    );

    if (!confirmed) return;

    setIsSharing(true);
    try {
      const res = await fetch("/api/animations/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: animationData,
          expiryDays: 7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.shareLink.url);
      } else {
        alert("Erreur lors de la création du lien de partage");
      }
    } catch (error) {
      alert("Erreur réseau");
    } finally {
      setIsSharing(false);
    }
  };

  // Copy share URL
  const handleCopyUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Task 26.5: Social media share buttons
  const handleSocialShare = (platform: "twitter" | "linkedin" | "facebook") => {
    if (!shareUrl) return;

    const text = "Découvrez mon empreinte fiscale d'une journée";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    window.open(url, "_blank", "width=600,height=400");
  };

  // Task 26.6: Embed code generator
  const generateEmbedCode = () => {
    if (!shareUrl) return "";

    return `<iframe src="${shareUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;
  };

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Task 26.7: Export button
  const handleExport = async (format: "png" | "webm") => {
    if (!animationData) return;

    try {
      const res = await fetch("/api/animations/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: animationData,
          format,
          quality: "high",
          dimensions: { width: 1920, height: 1080 },
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.open(data.downloadUrl, "_blank");
      } else {
        alert(data.message || "Export non disponible pour le moment");
      }
    } catch (error) {
      alert("Erreur lors de l'export");
    }
  };

  const themes: Array<{ id: Theme; label: string; colors: string }> = [
    { id: "moderne", label: "Moderne", colors: "bg-gradient-to-r from-blue-500 to-purple-500" },
    { id: "vintage", label: "Vintage", colors: "bg-gradient-to-r from-amber-500 to-orange-500" },
    { id: "minimaliste", label: "Minimaliste", colors: "bg-gradient-to-r from-gray-400 to-gray-600" },
    { id: "colore", label: "Coloré", colors: "bg-gradient-to-r from-pink-500 to-yellow-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!animationData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Journée Fiscale Animée</h1>
          <p className="text-gray-600 mb-8">Visualisez votre empreinte fiscale quotidienne</p>

          <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune donnée disponible</h2>
            <p className="text-gray-600 mb-6">
              Complétez votre profil fiscal pour générer votre animation
            </p>
            <Button onClick={() => (window.location.href = "/profil")}>
              Compléter mon profil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Journée Fiscale Animée</h1>
              <p className="text-gray-600">
                {animationData.dataSource === "real"
                  ? "Basé sur vos données réelles"
                  : "Estimation basée sur votre profil"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Paramètres
              </Button>
              <Button onClick={fetchAnimation} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Panel (Tasks 26.8, 26.9, 26.10) */}
        {showSettings && (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Paramètres d'animation</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme selector (Task 26.8) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Thème
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setConfig({ ...config, theme: theme.id })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        config.theme === theme.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`h-4 rounded mb-2 ${theme.colors}`}></div>
                      <p className="text-sm font-medium text-gray-900">{theme.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed control (Task 26.9) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Vitesse de lecture
                </label>
                <div className="flex gap-2">
                  {[0.5, 1, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setConfig({ ...config, speed })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                        config.speed === speed
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {speed}×
                    </button>
                  ))}
                </div>
              </div>

              {/* Background music toggle (Task 26.10) */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableMusic}
                    onChange={(e) => setConfig({ ...config, enableMusic: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <Music className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">
                    Musique de fond (à venir)
                  </span>
                </label>
              </div>

              {/* Date selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Animation Player (Task 26.1, 26.2, 26.3) */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 mb-6">
          <FiscalDayAnimation
            data={animationData}
            config={config}
            onComplete={() => console.log("Animation completed")}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Share Button (Task 26.4) */}
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center justify-center gap-2"
          >
            {isSharing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            Partager (anonyme)
          </Button>

          {/* Export Button (Task 26.7) */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleExport("png")}
            >
              <Download className="w-4 h-4" />
              Exporter (bientôt)
            </Button>
          </div>

          {/* Embed Code (Task 26.6) */}
          <Button
            onClick={() => setShowEmbedCode(!showEmbedCode)}
            variant="outline"
            disabled={!shareUrl}
            className="flex items-center justify-center gap-2"
          >
            <Code className="w-4 h-4" />
            Code d'intégration
          </Button>
        </div>

        {/* Share Panel (Task 26.5) */}
        {shareUrl && (
          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">
              ✅ Lien de partage créé !
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-sm"
              />
              <Button onClick={handleCopyUrl} variant="outline">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div>
              <p className="text-sm text-green-800 mb-2">Partager sur :</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSocialShare("twitter")}
                  size="sm"
                  className="bg-blue-400 hover:bg-blue-500"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleSocialShare("linkedin")}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => handleSocialShare("facebook")}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
              </div>
            </div>

            <p className="text-xs text-green-700 mt-4">
              Ce lien est anonyme et expirera dans 7 jours.
            </p>
          </div>
        )}

        {/* Embed Code Panel (Task 26.6) */}
        {showEmbedCode && shareUrl && (
          <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Code d'intégration</h3>
            <div className="bg-white rounded-lg p-4 mb-4 font-mono text-sm overflow-x-auto">
              {generateEmbedCode()}
            </div>
            <Button onClick={handleCopyEmbedCode} variant="outline" size="sm">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le code
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-2">À propos de cette animation</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • Basée sur {animationData.dataSource === "real" ? "vos données réelles du " + selectedDate : "une estimation de votre profil"}
            </li>
            <li>• Les montants sont calculés pour une journée type</li>
            <li>• Les services reçus sont valorisés selon votre profil</li>
            <li>• Le partage anonymise automatiquement vos données</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
