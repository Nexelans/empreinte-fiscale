/**
 * Bouton "Analyser avec mon IA"
 * Phase 4 - Module AI
 *
 * Ouvre le chat IA avec contexte spécifique
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AIChatInterface } from './AIChatInterface';
import { MessageSquare } from 'lucide-react';

interface AIAnalysisButtonProps {
  context?: string;
  initialMessage?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AIAnalysisButton({
  context,
  initialMessage,
  variant = 'outline',
  size = 'sm',
  className,
}: AIAnalysisButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Analyser avec mon IA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Assistant IA Personnel</DialogTitle>
          </DialogHeader>
          <AIChatInterface
            context={context}
            initialMessage={initialMessage}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
