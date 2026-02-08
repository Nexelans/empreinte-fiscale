/**
 * Types pour le système d'amis (Social Friends)
 * Phase 4 - Module Social
 */

export enum SharingLevel {
  SCORE_ONLY = 'SCORE_ONLY',     // Partage uniquement du score fiscal global
  SUMMARY = 'SUMMARY',           // Partage du score + ratio + solde net
  DETAILED = 'DETAILED',         // Partage complet avec détails des impôts et services
}

export enum FriendStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export interface FriendInvitation {
  id: string;
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  token: string;
  expiresAt: Date;
  status: InvitationStatus;
  createdAt: Date;
  acceptedAt?: Date;
}

export interface FriendConnection {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
  friendImage?: string;
  status: FriendStatus;
  sharingLevel: SharingLevel;
  createdAt: Date;
  acceptedAt?: Date;
  lastActive?: Date;
}

export interface SharedFiscalData {
  // Toujours partagé (SCORE_ONLY)
  soldeNet: number;

  // Partagé si SUMMARY ou DETAILED
  ratio?: number;
  totalPaye?: number;
  totalRecu?: number;

  // Partagé uniquement si DETAILED
  detailPaye?: {
    impotRevenu?: number;
    csg_crds?: number;
    cotisationsSalariales?: number;
    cotisationsPatronales?: number;
    tva?: number;
    ticpe?: number;
    taxeFonciere?: number;
    ifi?: number;
    autresTaxes?: number;
  };
  detailRecu?: {
    transfertsDirects?: number;
    servicesMutualises?: number;
  };

  scoreConfiance?: number;
  calculatedAt?: Date;
}

export interface FriendComparisonData {
  user: {
    id: string;
    name: string;
    data: SharedFiscalData;
  };
  friend: {
    id: string;
    name: string;
    data: SharedFiscalData;
  };
  sharingLevel: SharingLevel;
}
