/**
 * Modal de chat IA autonome
 * Phase 4 - Module AI
 *
 * Wraps AIChatInterface dans un Dialog shadcn.
 * Utilisable de manière standalone sans AIAnalysisButton.
 */

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import { AIChatInterface } from './AIChatInterface';

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  context?: string;
  initialMessage?: string;
  title?: string;
}

export function ChatModal({
  open,
  onClose,
  context,
  initialMessage,
  title = 'Analyser avec mon IA',
}: ChatModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="p-0">
          <AIChatInterface
            context={context}
            initialMessage={initialMessage}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
