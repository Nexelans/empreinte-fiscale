/**
 * Types pour le système de groupes (Social Groups)
 * Phase 4 - Module Social
 */

export enum GroupType {
  FAMILY = 'FAMILY',
  COLLEAGUES = 'COLLEAGUES',
  FRIENDS = 'FRIENDS',
  CUSTOM = 'CUSTOM',
}

export enum GroupMemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  ownerId: string;
  ownerName: string;
  anonymous: boolean;
  memberCount: number;
  createdAt: Date;
  archivedAt?: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  role: GroupMemberRole;
  joinedAt: Date;
}

export interface GroupMemberWithData extends GroupMember {
  fiscalData?: {
    soldeNet: number;
    totalPaye?: number;
    totalRecu?: number;
    ratio?: number;
    scoreConfiance?: number;
  };
}

export interface GroupStats {
  groupId: string;
  groupName: string;
  memberCount: number;
  metrics: {
    soldeNet: {
      mean: number;
      median: number;
      min: number;
      max: number;
      percentiles: { p25: number; p50: number; p75: number };
    };
    totalPaye?: {
      mean: number;
      median: number;
      min: number;
      max: number;
    };
    totalRecu?: {
      mean: number;
      median: number;
      min: number;
      max: number;
    };
    ratio?: {
      mean: number;
      median: number;
      min: number;
      max: number;
    };
  };
  calculatedAt: Date;
}

export interface UserGroupPercentile {
  userId: string;
  groupId: string;
  metric: 'soldeNet' | 'totalPaye' | 'totalRecu' | 'ratio';
  value: number;
  percentile: number;
  rank: number;
  totalMembers: number;
}

export interface GroupComparison {
  group: Group;
  members: GroupMemberWithData[];
  stats: GroupStats;
  userPercentiles?: UserGroupPercentile[];
}
