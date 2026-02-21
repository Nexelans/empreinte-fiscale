'use client';

/**
 * Page de configuration IA utilisateur
 * Phase 4 - Module AI
 *
 * Affiche soit le wizard de configuration, soit le dashboard usage
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowLeft, Trash2, Settings } from 'lucide-react';
import { AIConfigWizard } from '@/components/ai/AIConfigWizard';
import { AIUsageHistory } from '@/components/ai/AIUsageHistory';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface AIConfigSafe {
  id: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  endpoint?: string;
  customSystemPrompt?: string;
  lastTestedAt?: string;
  lastTestStatus: string;
  hasApiKey: boolean;
}

export default function AISettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AIConfigSafe | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/ai/config');
      const data = await res.json();
      setConfig(data.config || null);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch AI config:', error);
      toast.error('Erreur lors du chargement de la configuration');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/ai/config', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete config');
      }

      toast.success('Configuration IA supprimée avec succès');
      setConfig(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete AI config:', error);
      toast.error('Erreur lors de la suppression de la configuration');
    } finally {
      setDeleting(false);
    }
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    fetchConfig();
    toast.success('Configuration IA enregistrée avec succès');
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Configuration IA</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Mode wizard (pas de config existante)
  if (!config || showWizard) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => {
            if (showWizard && config) {
              setShowWizard(false);
            } else {
              router.push('/settings');
            }
          }}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">
            {config ? 'Modifier' : 'Configurer'} votre IA
          </h1>
        </div>

        <AIConfigWizard
          onComplete={handleWizardComplete}
          existingConfig={config || undefined}
        />
      </div>
    );
  }

  // Mode dashboard (config existante)
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/settings')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux paramètres
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Votre IA</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowWizard(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Configuration actuelle */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Configuration actuelle</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Provider</p>
            <p className="font-medium capitalize">{config.provider}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Modèle</p>
            <p className="font-medium">{config.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Température</p>
            <p className="font-medium">{config.temperature}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Max Tokens</p>
            <p className="font-medium">{config.maxTokens}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Statut de test</p>
            <p className="font-medium">
              {config.lastTestStatus === 'SUCCESS' && (
                <span className="text-green-600">✓ Connexion réussie</span>
              )}
              {config.lastTestStatus === 'FAILED' && (
                <span className="text-red-600">✗ Échec de connexion</span>
              )}
              {config.lastTestStatus === 'UNTESTED' && (
                <span className="text-gray-600">Non testé</span>
              )}
            </p>
          </div>
          {config.lastTestedAt && (
            <div>
              <p className="text-sm text-gray-600">Dernière vérification</p>
              <p className="font-medium">
                {new Date(config.lastTestedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Historique d'utilisation */}
      <AIUsageHistory />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la configuration IA ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera votre configuration IA et révoquera votre consentement
              de transmission de données. Vous devrez reconfigurer votre IA si vous souhaitez
              l'utiliser à nouveau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
