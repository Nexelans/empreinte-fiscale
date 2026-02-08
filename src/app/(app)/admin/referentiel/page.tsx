/**
 * Page de gestion du Référentiel (Admin)
 * Phase 4 - Admin Interface
 */

'use client';

import { useEffect, useState } from 'react';
import { ReferentielReviewCard } from '@/components/admin/ReferentielReviewCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  RefreshCw,
  PlayCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

interface ReferentielUpdate {
  id: string;
  millesime: string;
  categorie: string;
  cle: string;
  currentValue: any;
  newValue: any;
  source: string;
  urlSource: string;
  detectedAt: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  confidence: number;
  changeType: 'CREATED' | 'MODIFIED' | 'DELETED';
}

export default function AdminReferentielPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<ReferentielUpdate[]>([]);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadUpdates();
  }, [filter]);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter === 'all' ? '' : filter.toUpperCase() });
      const response = await fetch(`/api/admin/referentiel/updates?${params}`);
      const data = await response.json();

      setUpdates(data.updates || []);
    } catch (error) {
      console.error('Error loading updates:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les mises à jour',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async () => {
    setPipelineRunning(true);
    try {
      const response = await fetch('/api/admin/referentiel/pipeline/run', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();

      toast({
        title: 'Pipeline exécuté',
        description: `${data.result.detectedChanges} changements détectés, ${data.result.successfulImports} importés`,
      });

      loadUpdates();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec du pipeline',
        type: 'error',
      });
    } finally {
      setPipelineRunning(false);
    }
  };

  const handleApprove = async (updateId: string) => {
    try {
      const response = await fetch('/api/admin/referentiel/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId, action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed');

      toast({ title: 'Mise à jour approuvée' });
      loadUpdates();
    } catch (error) {
      toast({ title: 'Erreur', type: 'error' });
    }
  };

  const handleReject = async (updateId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/referentiel/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId, action: 'reject', reason }),
      });

      if (!response.ok) throw new Error('Failed');

      toast({ title: 'Mise à jour rejetée' });
      loadUpdates();
    } catch (error) {
      toast({ title: 'Erreur', type: 'error' });
    }
  };

  const pendingCount = updates.filter((u) => u.status === 'PENDING').length;
  const approvedCount = updates.filter((u) => u.status === 'APPROVED').length;
  const rejectedCount = updates.filter((u) => u.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Référentiel Fiscal</h1>
          <p className="text-gray-500 mt-1">
            Validation des mises à jour automatiques
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadUpdates}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            size="sm"
            onClick={runPipeline}
            disabled={pipelineRunning}
          >
            {pipelineRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Pipeline en cours...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Lancer le pipeline
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={`cursor-pointer transition-colors ${
            filter === 'pending' ? 'border-amber-500 bg-amber-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setFilter('pending')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent validation
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            filter === 'approved' ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setFilter('approved')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Publiées dans le référentiel
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${
            filter === 'rejected' ? 'border-red-500 bg-red-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setFilter('rejected')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Non appliquées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Badges */}
      <div className="flex gap-2">
        <Badge
          variant={filter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('all')}
        >
          Toutes
        </Badge>
        <Badge
          variant={filter === 'pending' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('pending')}
        >
          En attente ({pendingCount})
        </Badge>
        <Badge
          variant={filter === 'approved' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('approved')}
        >
          Approuvées
        </Badge>
        <Badge
          variant={filter === 'rejected' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setFilter('rejected')}
        >
          Rejetées
        </Badge>
      </div>

      {/* Updates List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : updates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {filter === 'pending'
                ? 'Aucune mise à jour en attente'
                : `Aucune mise à jour ${filter === 'approved' ? 'approuvée' : 'rejetée'}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <ReferentielReviewCard
              key={update.id}
              update={update}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
