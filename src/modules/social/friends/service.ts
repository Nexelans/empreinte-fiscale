/**
 * Service pour la gestion des amis (Social Friends)
 * Phase 4 - Module Social
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import {
  FriendInvitation,
  FriendConnection,
  SharingLevel,
  FriendStatus,
  InvitationStatus,
  SharedFiscalData,
} from './types';

const INVITATION_EXPIRY_DAYS = 7;

/**
 * Génère un token unique et sécurisé pour une invitation d'ami
 * Durée de validité : 7 jours
 */
export function generateInvitationToken(): {
  token: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  return { token, expiresAt };
}

/**
 * Crée une invitation d'ami
 * @param inviterId - ID de l'utilisateur qui invite
 * @param inviteeEmail - Email de la personne invitée
 * @returns Lien d'invitation complet
 */
export async function createInvitation(
  inviterId: string,
  inviteeEmail: string
): Promise<{ invitation: FriendInvitation; invitationLink: string }> {
  // Vérifier que l'email n'est pas déjà ami
  const inviter = await prisma.user.findUnique({
    where: { id: inviterId },
    select: { email: true, name: true },
  });

  if (!inviter) {
    throw new Error('Inviter not found');
  }

  if (inviter.email === inviteeEmail) {
    throw new Error('Cannot invite yourself');
  }

  // Vérifier si l'utilisateur invité existe et s'ils sont déjà amis
  const invitee = await prisma.user.findUnique({
    where: { email: inviteeEmail },
    select: { id: true },
  });

  if (invitee) {
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: inviterId, friendId: invitee.id },
          { userId: invitee.id, friendId: inviterId },
        ],
      },
    });

    if (existingFriendship) {
      throw new Error('Already friends or invitation pending');
    }
  }

  // Vérifier s'il y a déjà une invitation en attente
  const existingInvitation = await prisma.friendInvitation.findFirst({
    where: {
      inviterId,
      inviteeEmail,
      status: InvitationStatus.PENDING,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvitation) {
    throw new Error('Invitation already sent');
  }

  // Générer le token et créer l'invitation
  const { token, expiresAt } = generateInvitationToken();

  const dbInvitation = await prisma.friendInvitation.create({
    data: {
      inviterId,
      inviteeEmail,
      token,
      expiresAt,
      status: InvitationStatus.PENDING,
    },
    include: {
      inviter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const invitation: FriendInvitation = {
    id: dbInvitation.id,
    inviterId: dbInvitation.inviterId,
    inviterName: dbInvitation.inviter.name || dbInvitation.inviter.email,
    inviterEmail: dbInvitation.inviter.email,
    inviteeEmail: dbInvitation.inviteeEmail,
    token: dbInvitation.token,
    expiresAt: dbInvitation.expiresAt,
    status: dbInvitation.status as InvitationStatus,
    createdAt: dbInvitation.createdAt,
    acceptedAt: dbInvitation.acceptedAt || undefined,
  };

  const invitationLink = `${process.env.NEXTAUTH_URL}/social/friends/accept?token=${token}`;

  return { invitation, invitationLink };
}

/**
 * Valide un token d'invitation
 * @param token - Token d'invitation
 * @returns Invitation si valide, null sinon
 */
export async function validateInvitation(
  token: string
): Promise<FriendInvitation | null> {
  const invitation = await prisma.friendInvitation.findUnique({
    where: { token },
    include: {
      inviter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!invitation) {
    return null;
  }

  // Vérifier l'expiration
  if (invitation.expiresAt < new Date()) {
    await prisma.friendInvitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED },
    });
    return null;
  }

  // Vérifier le statut
  if (invitation.status !== InvitationStatus.PENDING) {
    return null;
  }

  return {
    id: invitation.id,
    inviterId: invitation.inviterId,
    inviterName: invitation.inviter.name || invitation.inviter.email,
    inviterEmail: invitation.inviter.email,
    inviteeEmail: invitation.inviteeEmail,
    token: invitation.token,
    expiresAt: invitation.expiresAt,
    status: invitation.status as InvitationStatus,
    createdAt: invitation.createdAt,
    acceptedAt: invitation.acceptedAt || undefined,
  };
}

/**
 * Accepte une invitation d'ami
 * @param token - Token d'invitation
 * @param acceptorId - ID de l'utilisateur qui accepte
 */
export async function acceptInvitation(
  token: string,
  acceptorId: string
): Promise<FriendConnection> {
  const invitation = await validateInvitation(token);

  if (!invitation) {
    throw new Error('Invalid or expired invitation');
  }

  // Vérifier que l'accepteur est bien le destinataire
  const acceptor = await prisma.user.findUnique({
    where: { id: acceptorId },
    select: { email: true, name: true, image: true },
  });

  if (!acceptor) {
    throw new Error('Acceptor not found');
  }

  if (acceptor.email !== invitation.inviteeEmail) {
    throw new Error('You are not the intended recipient of this invitation');
  }

  // Créer la relation d'amitié (bidirectionnelle)
  const now = new Date();

  const [friendship1, friendship2] = await prisma.$transaction([
    // Relation A → B
    prisma.friend.create({
      data: {
        userId: invitation.inviterId,
        friendId: acceptorId,
        status: FriendStatus.ACTIVE,
        sharingLevel: SharingLevel.SCORE_ONLY, // Défaut : partage minimal
        acceptedAt: now,
      },
    }),
    // Relation B → A
    prisma.friend.create({
      data: {
        userId: acceptorId,
        friendId: invitation.inviterId,
        status: FriendStatus.ACTIVE,
        sharingLevel: SharingLevel.SCORE_ONLY,
        acceptedAt: now,
      },
    }),
    // Marquer l'invitation comme acceptée
    prisma.friendInvitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: now,
      },
    }),
  ]);

  // Récupérer les infos de l'inviter pour le retour
  const inviter = await prisma.user.findUnique({
    where: { id: invitation.inviterId },
    select: { name: true, email: true, image: true },
  });

  return {
    id: friendship2.id,
    userId: acceptorId,
    friendId: invitation.inviterId,
    friendName: inviter?.name || inviter?.email || 'Unknown',
    friendEmail: inviter?.email || '',
    friendImage: inviter?.image || undefined,
    status: FriendStatus.ACTIVE,
    sharingLevel: SharingLevel.SCORE_ONLY,
    createdAt: friendship2.createdAt,
    acceptedAt: friendship2.acceptedAt || undefined,
  };
}

/**
 * Récupère la liste des amis d'un utilisateur
 * @param userId - ID de l'utilisateur
 */
export async function getFriends(userId: string): Promise<FriendConnection[]> {
  const friendships = await prisma.friend.findMany({
    where: {
      userId,
      status: FriendStatus.ACTIVE,
    },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return friendships.map((f) => ({
    id: f.id,
    userId: f.userId,
    friendId: f.friendId,
    friendName: f.friend.name || f.friend.email,
    friendEmail: f.friend.email,
    friendImage: f.friend.image || undefined,
    status: f.status as FriendStatus,
    sharingLevel: f.sharingLevel as SharingLevel,
    createdAt: f.createdAt,
    acceptedAt: f.acceptedAt || undefined,
  }));
}

/**
 * Modifie le niveau de partage avec un ami
 * @param userId - ID de l'utilisateur
 * @param friendId - ID de l'ami
 * @param level - Nouveau niveau de partage
 */
export async function setSharingLevel(
  userId: string,
  friendId: string,
  level: SharingLevel
): Promise<void> {
  // Vérifier que les niveaux de partage sont valides
  if (!Object.values(SharingLevel).includes(level)) {
    throw new Error('Invalid sharing level');
  }

  // Mettre à jour uniquement la relation userId → friendId
  const friendship = await prisma.friend.findFirst({
    where: {
      userId,
      friendId,
      status: FriendStatus.ACTIVE,
    },
  });

  if (!friendship) {
    throw new Error('Friendship not found');
  }

  await prisma.friend.update({
    where: { id: friendship.id },
    data: { sharingLevel: level },
  });
}

/**
 * Supprime une relation d'amitié
 * @param userId - ID de l'utilisateur
 * @param friendId - ID de l'ami
 */
export async function removeFriend(
  userId: string,
  friendId: string
): Promise<void> {
  // Supprimer les deux relations (bidirectionnelles)
  await prisma.$transaction([
    prisma.friend.deleteMany({
      where: { userId, friendId },
    }),
    prisma.friend.deleteMany({
      where: { userId: friendId, friendId: userId },
    }),
  ]);

  // TODO: Invalider le cache (Task 30.4)
  // TODO: Envoyer une notification (Task 2.6)
}

/**
 * Bloque un utilisateur
 * @param userId - ID de l'utilisateur qui bloque
 * @param blockedId - ID de l'utilisateur à bloquer
 */
export async function blockUser(
  userId: string,
  blockedId: string
): Promise<void> {
  // Supprimer toute relation existante
  await removeFriend(userId, blockedId);

  // Créer une relation de blocage (unidirectionnelle)
  await prisma.friend.create({
    data: {
      userId,
      friendId: blockedId,
      status: FriendStatus.BLOCKED,
      sharingLevel: SharingLevel.SCORE_ONLY, // N'a pas d'importance pour un blocage
    },
  });

  // Invalider toutes les invitations en attente
  await prisma.friendInvitation.updateMany({
    where: {
      OR: [
        { inviterId: userId, inviteeEmail: blockedId },
        { inviterId: blockedId, inviteeEmail: userId },
      ],
      status: InvitationStatus.PENDING,
    },
    data: {
      status: InvitationStatus.DECLINED,
    },
  });
}

/**
 * Récupère les données fiscales partagées d'un ami
 * Applique les permissions selon le niveau de partage
 *
 * PERMISSION MODEL:
 * - SCORE_ONLY: Solde net uniquement (soldeNet)
 * - SUMMARY: + Ratio, totaux, confiance, date
 * - DETAILED: + Détails par catégorie (detailPaye, detailRecu)
 *
 * IMPORTANT: Cette fonction est la couche de sécurité centrale pour le partage social.
 * Toute modification doit être auditée pour éviter les fuites de données sensibles.
 *
 * @param userId - ID de l'utilisateur qui demande (celui qui veut voir les données)
 * @param friendId - ID de l'ami dont on veut les données (celui qui partage)
 * @returns Données filtrées selon le niveau de partage, ou null si pas d'accès
 */
export async function getSharedData(
  userId: string,
  friendId: string
): Promise<SharedFiscalData | null> {
  // Étape 1: Vérifier que la relation d'amitié existe et est active
  // IMPORTANT: On cherche la relation où friendId partage avec userId (pas l'inverse)
  // Cela signifie qu'on respecte le niveau de partage configuré PAR l'ami (friendId)
  const friendship = await prisma.friend.findFirst({
    where: {
      userId: friendId,          // L'ami (celui qui possède les données)
      friendId: userId,           // L'utilisateur demandeur (celui qui veut voir)
      status: FriendStatus.ACTIVE, // Seulement les amitiés actives (pas PENDING ou BLOCKED)
    },
  });

  // Si pas d'amitié active, refuser l'accès immédiatement
  // Raisons possibles: pas amis, invitation pas encore acceptée, relation bloquée
  if (!friendship) {
    return null;
  }

  // Étape 2: Récupérer le niveau de partage configuré par l'ami
  // Ce niveau détermine quelles données seront exposées
  const sharingLevel = friendship.sharingLevel as SharingLevel;

  // Étape 3: Récupérer le score fiscal le plus récent de l'ami
  // On ne partage jamais l'historique complet, seulement le dernier calcul
  const latestScore = await prisma.scoreFiscal.findFirst({
    where: { userId: friendId },
    orderBy: { calculatedAt: 'desc' },
  });

  // Si l'ami n'a pas encore de score calculé, retourner null
  if (!latestScore) {
    return null;
  }

  // Étape 4: Construire l'objet de réponse en appliquant le filtrage par niveau
  // Niveau 1 - SCORE_ONLY: On expose UNIQUEMENT le solde net
  // Pas de revenus, pas de détails, juste le résultat final
  const data: SharedFiscalData = {
    soldeNet: latestScore.soldeNet,
  };

  // Niveau 2 - SUMMARY: On ajoute les totaux agrégés et les métadonnées
  // Permet de comprendre le ratio contributeur/bénéficiaire sans voir les détails
  if (sharingLevel === SharingLevel.SUMMARY || sharingLevel === SharingLevel.DETAILED) {
    data.ratio = latestScore.ratio;
    data.totalPaye = latestScore.totalPaye;
    data.totalRecu = latestScore.totalRecu;
    data.scoreConfiance = latestScore.scoreConfiance;
    data.calculatedAt = latestScore.calculatedAt;
  }

  // Niveau 3 - DETAILED: On ajoute les détails par catégorie
  // Expose la ventilation complète: IR, cotisations, TVA, etc.
  // ATTENTION: Ce niveau expose des informations sensibles sur les revenus
  if (sharingLevel === SharingLevel.DETAILED) {
    data.detailPaye = latestScore.detailPaye as any;
    data.detailRecu = latestScore.detailRecu as any;
  }

  // SÉCURITÉ: On ne retourne JAMAIS:
  // - Le ProfilFiscal complet (salaire brut, situation familiale, patrimoine)
  // - Les documents uploadés
  // - Le journal fiscal détaillé
  // - L'historique des scores
  // Ces données restent privées même en mode DETAILED

  return data;
}
