/**
 * Modal pour inviter un ami
 * Phase 4 - Module Social - Friends UI
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, UserPlus, Loader2 } from 'lucide-react';

interface FriendInviteModalProps {
  trigger?: React.ReactNode;
}

export function FriendInviteModal({ trigger }: FriendInviteModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email) {
      toast({
        title: 'Email requis',
        description: 'Veuillez saisir une adresse email',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social/friends/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invitation');
      }

      setInvitationLink(data.invitationLink);
      toast({
        title: 'Invitation créée',
        description: `Un lien d'invitation a été généré pour ${email}`,
      });
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'invitation',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast({
        title: 'Copié !',
        description: 'Le lien d\'invitation a été copié dans le presse-papier',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien',
        type: 'error',
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setInvitationLink('');
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Inviter un ami
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter un ami</DialogTitle>
          <DialogDescription>
            Saisissez l'adresse email de la personne que vous souhaitez inviter.
            Un lien d'invitation valable 7 jours sera généré.
          </DialogDescription>
        </DialogHeader>

        {!invitationLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ami@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleInvite();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleInvite}
              disabled={loading || !email}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                'Générer le lien d\'invitation'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lien d'invitation</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={invitationLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Partagez ce lien avec {email}. Il expirera dans 7 jours.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Fermer
              </Button>
              <Button
                onClick={() => {
                  setInvitationLink('');
                  setEmail('');
                }}
                className="flex-1"
              >
                Nouvelle invitation
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
