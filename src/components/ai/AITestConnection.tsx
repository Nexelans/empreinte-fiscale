/**
 * Composant de test de connexion IA
 * Phase 4 - Module AI
 *
 * Teste la connexion avec le provider configuré
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  latency?: number;
  model?: string;
  error?: string;
}

export function AITestConnection() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
      });

      const data = await response.json();

      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Test failed',
        error: error.message || 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Test de connexion</h3>
              <p className="text-sm text-muted-foreground">
                Vérifiez que votre configuration fonctionne correctement
              </p>
            </div>

            <Button onClick={handleTest} disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Tester
                </>
              )}
            </Button>
          </div>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{result.message}</p>

                  {result.model && (
                    <p className="text-sm">
                      <strong>Modèle :</strong> {result.model}
                    </p>
                  )}

                  {result.latency && (
                    <p className="text-sm">
                      <strong>Latence :</strong> {result.latency}ms
                    </p>
                  )}

                  {result.error && (
                    <p className="text-sm text-destructive">
                      <strong>Erreur :</strong> {result.error}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
