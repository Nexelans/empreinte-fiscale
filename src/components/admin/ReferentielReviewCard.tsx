/**
 * Carte de review d'une mise à jour du Référentiel
 * Phase 4 - Admin Interface
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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

interface ReferentielReviewCardProps {
  update: ReferentielUpdate;
  onApprove: (updateId: string) => void;
  onReject: (updateId: string, reason: string) => void;
}

export function ReferentielReviewCard({
  update,
  onApprove,
  onReject,
}: ReferentielReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'CREATED':
        return 'bg-green-100 text-green-800';
      case 'MODIFIED':
        return 'bg-blue-100 text-blue-800';
      case 'DELETED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    await onApprove(update.id);
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Veuillez indiquer une raison de rejet');
      return;
    }
    setActionLoading(true);
    await onReject(update.id, rejectReason);
    setActionLoading(false);
    setRejecting(false);
    setRejectReason('');
  };

  const isPending = update.status === 'PENDING';

  return (
    <Card className={update.status === 'PENDING' ? 'border-amber-300' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{update.millesime}</Badge>
              <Badge className={getChangeTypeColor(update.changeType)}>
                {update.changeType === 'CREATED' && 'Création'}
                {update.changeType === 'MODIFIED' && 'Modification'}
                {update.changeType === 'DELETED' && 'Suppression'}
              </Badge>
              {update.status !== 'PENDING' && (
                <Badge
                  variant={
                    update.status === 'APPROVED' ? 'default' : 'destructive'
                  }
                >
                  {update.status === 'APPROVED' ? 'Approuvée' : 'Rejetée'}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">
              {update.categorie} · {update.cle}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                Confiance:{' '}
                <span className={`font-medium ${getConfidenceColor(update.confidence)}`}>
                  {Math.round(update.confidence * 100)}%
                </span>
              </span>
              <span>
                Détecté le {new Date(update.detectedAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Current Value */}
          {update.changeType !== 'CREATED' && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2 text-gray-700">
                Valeur actuelle
              </h4>
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-900">
                {formatValue(update.currentValue)}
              </pre>
            </div>
          )}

          {/* New Value */}
          {update.changeType !== 'DELETED' && (
            <div
              className={`border rounded-lg p-4 ${
                update.changeType === 'CREATED'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <h4 className="text-sm font-medium mb-2 text-gray-700">
                {update.changeType === 'CREATED' ? 'Nouvelle entrée' : 'Nouvelle valeur'}
              </h4>
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-900">
                {formatValue(update.newValue)}
              </pre>
            </div>
          )}

          {/* Deletion indicator */}
          {update.changeType === 'DELETED' && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="text-sm font-medium mb-2 text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Cette entrée sera supprimée
              </h4>
            </div>
          )}
        </div>

        {/* Source */}
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Source</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">{update.source}</p>
              {update.urlSource && (
                <a
                  href={update.urlSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Consulter la source officielle
                </a>
              )}
            </div>
          </div>
        )}

        {/* Confidence warning */}
        {isPending && update.confidence < 0.7 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Confiance faible</p>
              <p className="text-xs mt-1">
                Vérifiez manuellement la source avant d'approuver cette mise à jour.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {isPending && (
        <CardFooter className="flex-col items-stretch gap-3">
          {!rejecting ? (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="default"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setRejecting(true)}
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                placeholder="Raison du rejet (obligatoire)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  Confirmer le rejet
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRejecting(false);
                    setRejectReason('');
                  }}
                  disabled={actionLoading}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
