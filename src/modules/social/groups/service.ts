/**
 * Service pour la gestion des groupes (Social Groups)
 * Phase 4 - Module Social
 */

import { prisma } from '@/lib/prisma';
import {
  Group,
  GroupType,
  GroupMember,
  GroupMemberRole,
  GroupStats,
  GroupMemberWithData,
  UserGroupPercentile,
  GroupComparison,
} from './types';
import { SharingLevel } from '../friends/types';

/**
 * Crée un nouveau groupe
 */
export async function createGroup(
  ownerId: string,
  name: string,
  type: GroupType,
  anonymous: boolean = false
): Promise<Group> {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { name: true, email: true },
  });

  if (!owner) {
    throw new Error('Owner not found');
  }

  const group = await prisma.group.create({
    data: {
      name,
      type,
      ownerId,
      anonymous,
    },
  });

  // Ajouter le propriétaire comme membre
  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: ownerId,
      role: GroupMemberRole.OWNER,
    },
  });

  return {
    id: group.id,
    name: group.name,
    type: group.type as GroupType,
    ownerId: group.ownerId,
    ownerName: owner.name || owner.email,
    anonymous: group.anonymous,
    memberCount: 1,
    createdAt: group.createdAt,
    archivedAt: group.archivedAt || undefined,
  };
}

/**
 * Ajoute un membre à un groupe
 */
export async function addMember(
  groupId: string,
  userId: string,
  addedBy: string,
  role: GroupMemberRole = GroupMemberRole.MEMBER
): Promise<GroupMember> {
  // Vérifier que le groupe existe et n'est pas archivé
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new Error('Group not found');
  }

  if (group.archivedAt) {
    throw new Error('Cannot add members to archived group');
  }

  // Vérifier que l'utilisateur qui ajoute a les permissions
  const adderMembership = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: addedBy,
      role: { in: [GroupMemberRole.OWNER, GroupMemberRole.ADMIN] },
    },
  });

  if (!adderMembership) {
    throw new Error('Insufficient permissions to add members');
  }

  // Vérifier que l'utilisateur n'est pas déjà membre
  const existingMembership = await prisma.groupMember.findFirst({
    where: { groupId, userId },
  });

  if (existingMembership) {
    throw new Error('User is already a member of this group');
  }

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Ajouter le membre
  const membership = await prisma.groupMember.create({
    data: {
      groupId,
      userId,
      role,
    },
  });

  return {
    id: membership.id,
    groupId: membership.groupId,
    userId: membership.userId,
    userName: user.name || user.email,
    userEmail: user.email,
    userImage: user.image || undefined,
    role: membership.role as GroupMemberRole,
    joinedAt: membership.joinedAt,
  };
}

/**
 * Récupère les membres d'un groupe
 */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' }, // OWNER first, then ADMIN, then MEMBER
      { joinedAt: 'asc' },
    ],
  });

  return memberships.map((m) => ({
    id: m.id,
    groupId: m.groupId,
    userId: m.userId,
    userName: m.user.name || m.user.email,
    userEmail: m.user.email,
    userImage: m.user.image || undefined,
    role: m.role as GroupMemberRole,
    joinedAt: m.joinedAt,
  }));
}

/**
 * Récupère les groupes d'un utilisateur
 */
export async function getUserGroups(userId: string): Promise<Group[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          owner: {
            select: { name: true, email: true },
          },
          members: {
            select: { id: true },
          },
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  });

  return memberships
    .filter((m) => !m.group.archivedAt) // Exclure les groupes archivés
    .map((m) => ({
      id: m.group.id,
      name: m.group.name,
      type: m.group.type as GroupType,
      ownerId: m.group.ownerId,
      ownerName: m.group.owner.name || m.group.owner.email,
      anonymous: m.group.anonymous,
      memberCount: m.group.members.length,
      createdAt: m.group.createdAt,
      archivedAt: m.group.archivedAt || undefined,
    }));
}

/**
 * Calcule les statistiques d'un groupe
 */
export async function getGroupStats(groupId: string): Promise<GroupStats> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { name: true },
  });

  if (!group) {
    throw new Error('Group not found');
  }

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });

  if (members.length === 0) {
    throw new Error('No members in group');
  }

  // Récupérer les derniers scores fiscaux de tous les membres
  const scores = await Promise.all(
    members.map(async (member) => {
      const score = await prisma.scoreFiscal.findFirst({
        where: { userId: member.userId },
        orderBy: { calculatedAt: 'desc' },
      });
      return score;
    })
  );

  // Filtrer les scores null
  const validScores = scores.filter((s) => s !== null);

  if (validScores.length === 0) {
    throw new Error('No fiscal data available for group members');
  }

  // Calculer les statistiques pour soldeNet
  const soldeNetValues = validScores.map((s) => s!.soldeNet).sort((a, b) => a - b);
  const totalPayeValues = validScores.map((s) => s!.totalPaye).sort((a, b) => a - b);
  const totalRecuValues = validScores.map((s) => s!.totalRecu).sort((a, b) => a - b);
  const ratioValues = validScores.map((s) => s!.ratio).sort((a, b) => a - b);

  const calculateStats = (values: number[]) => {
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const median = values[Math.floor(values.length / 2)] || 0;
    const min = values[0] || 0;
    const max = values[values.length - 1] || 0;

    return { mean, median, min, max };
  };

  const calculatePercentiles = (values: number[]) => {
    const p25 = values[Math.floor(values.length * 0.25)] || 0;
    const p50 = values[Math.floor(values.length * 0.5)] || 0;
    const p75 = values[Math.floor(values.length * 0.75)] || 0;
    return { p25, p50, p75 };
  };

  return {
    groupId,
    groupName: group.name,
    memberCount: validScores.length,
    metrics: {
      soldeNet: {
        ...calculateStats(soldeNetValues),
        percentiles: calculatePercentiles(soldeNetValues),
      },
      totalPaye: calculateStats(totalPayeValues),
      totalRecu: calculateStats(totalRecuValues),
      ratio: calculateStats(ratioValues),
    },
    calculatedAt: new Date(),
  };
}

/**
 * Génère une comparaison de groupe avec données agrégées
 * Respecte les niveaux de partage de chaque membre
 */
export async function generateGroupComparison(
  groupId: string,
  requesterId: string
): Promise<GroupComparison> {
  // Vérifier que le requérant est membre du groupe
  const requesterMembership = await prisma.groupMember.findFirst({
    where: { groupId, userId: requesterId },
  });

  if (!requesterMembership) {
    throw new Error('You are not a member of this group');
  }

  // Récupérer les infos du groupe
  const groupData = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      owner: { select: { name: true, email: true } },
    },
  });

  if (!groupData) {
    throw new Error('Group not found');
  }

  const group: Group = {
    id: groupData.id,
    name: groupData.name,
    type: groupData.type as GroupType,
    ownerId: groupData.ownerId,
    ownerName: groupData.owner.name || groupData.owner.email,
    anonymous: groupData.anonymous,
    memberCount: 0,
    createdAt: groupData.createdAt,
    archivedAt: groupData.archivedAt || undefined,
  };

  // Récupérer tous les membres
  const members = await getGroupMembers(groupId);

  // Pour chaque membre, déterminer le niveau de partage et récupérer les données
  const membersWithData: GroupMemberWithData[] = await Promise.all(
    members.map(async (member) => {
      // Si c'est le requérant lui-même, on a accès à toutes ses données
      if (member.userId === requesterId) {
        const score = await prisma.scoreFiscal.findFirst({
          where: { userId: member.userId },
          orderBy: { calculatedAt: 'desc' },
        });

        return {
          ...member,
          fiscalData: score
            ? {
                soldeNet: score.soldeNet,
                totalPaye: score.totalPaye,
                totalRecu: score.totalRecu,
                ratio: score.ratio,
                scoreConfiance: score.scoreConfiance,
              }
            : undefined,
        };
      }

      // Vérifier s'ils sont amis et quel est le niveau de partage
      const friendship = await prisma.friend.findFirst({
        where: {
          userId: member.userId,
          friendId: requesterId,
          status: 'ACTIVE',
        },
      });

      if (!friendship) {
        // Pas amis, pas de données partagées
        return { ...member, fiscalData: undefined };
      }

      const sharingLevel = friendship.sharingLevel as SharingLevel;
      const score = await prisma.scoreFiscal.findFirst({
        where: { userId: member.userId },
        orderBy: { calculatedAt: 'desc' },
      });

      if (!score) {
        return { ...member, fiscalData: undefined };
      }

      // Appliquer le niveau de partage
      if (sharingLevel === SharingLevel.SCORE_ONLY) {
        return {
          ...member,
          fiscalData: {
            soldeNet: score.soldeNet,
          },
        };
      } else if (sharingLevel === SharingLevel.SUMMARY) {
        return {
          ...member,
          fiscalData: {
            soldeNet: score.soldeNet,
            totalPaye: score.totalPaye,
            totalRecu: score.totalRecu,
            ratio: score.ratio,
            scoreConfiance: score.scoreConfiance,
          },
        };
      } else {
        // DETAILED - toutes les données
        return {
          ...member,
          fiscalData: {
            soldeNet: score.soldeNet,
            totalPaye: score.totalPaye,
            totalRecu: score.totalRecu,
            ratio: score.ratio,
            scoreConfiance: score.scoreConfiance,
          },
        };
      }
    })
  );

  group.memberCount = membersWithData.length;

  // Calculer les stats avec les données disponibles
  const stats = await getGroupStats(groupId);

  return {
    group,
    members: membersWithData,
    stats,
  };
}

/**
 * Calcule le percentile d'un utilisateur dans un groupe pour une métrique donnée
 */
export async function calculateGroupPercentile(
  groupId: string,
  userId: string,
  metric: 'soldeNet' | 'totalPaye' | 'totalRecu' | 'ratio'
): Promise<UserGroupPercentile> {
  // Vérifier que l'utilisateur est membre
  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId },
  });

  if (!membership) {
    throw new Error('User is not a member of this group');
  }

  // Récupérer le score de l'utilisateur
  const userScore = await prisma.scoreFiscal.findFirst({
    where: { userId },
    orderBy: { calculatedAt: 'desc' },
  });

  if (!userScore) {
    throw new Error('User has no fiscal data');
  }

  const userValue = userScore[metric];

  // Récupérer tous les membres et leurs scores
  const members = await prisma.groupMember.findMany({
    where: { groupId },
  });

  const scores = await Promise.all(
    members.map(async (m) => {
      const score = await prisma.scoreFiscal.findFirst({
        where: { userId: m.userId },
        orderBy: { calculatedAt: 'desc' },
      });
      return score ? score[metric] : null;
    })
  );

  const validScores = scores.filter((s) => s !== null) as number[];

  if (validScores.length < 2) {
    throw new Error('Insufficient data for percentile calculation');
  }

  // Compter combien ont une valeur inférieure
  const countBelow = validScores.filter((s) => s < userValue).length;

  // Calculer le percentile
  const percentile = Math.floor((countBelow / validScores.length) * 100);

  // Calculer le rang (1 = meilleur)
  const sortedScores = [...validScores].sort((a, b) => b - a); // Tri décroissant
  const rank = sortedScores.indexOf(userValue) + 1;

  return {
    userId,
    groupId,
    metric,
    value: userValue,
    percentile,
    rank,
    totalMembers: validScores.length,
  };
}

/**
 * Transfère la propriété d'un groupe
 */
export async function transferOwnership(
  groupId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<void> {
  // Vérifier que le groupe existe
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new Error('Group not found');
  }

  if (group.archivedAt) {
    throw new Error('Cannot transfer ownership of archived group');
  }

  // Vérifier que le requérant est bien le propriétaire
  if (group.ownerId !== currentOwnerId) {
    throw new Error('Only the owner can transfer ownership');
  }

  // Vérifier que le nouveau propriétaire est membre
  const newOwnerMembership = await prisma.groupMember.findFirst({
    where: { groupId, userId: newOwnerId },
  });

  if (!newOwnerMembership) {
    throw new Error('New owner must be a member of the group');
  }

  // Transférer la propriété
  await prisma.$transaction([
    // Mettre à jour le propriétaire du groupe
    prisma.group.update({
      where: { id: groupId },
      data: { ownerId: newOwnerId },
    }),
    // Mettre à jour le rôle de l'ancien propriétaire
    prisma.groupMember.updateMany({
      where: { groupId, userId: currentOwnerId },
      data: { role: GroupMemberRole.ADMIN },
    }),
    // Mettre à jour le rôle du nouveau propriétaire
    prisma.groupMember.update({
      where: { id: newOwnerMembership.id },
      data: { role: GroupMemberRole.OWNER },
    }),
  ]);
}

/**
 * Archive un groupe (soft delete)
 */
export async function archiveGroup(groupId: string, userId: string): Promise<void> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new Error('Group not found');
  }

  if (group.ownerId !== userId) {
    throw new Error('Only the owner can archive the group');
  }

  if (group.archivedAt) {
    throw new Error('Group is already archived');
  }

  await prisma.group.update({
    where: { id: groupId },
    data: { archivedAt: new Date() },
  });
}

/**
 * Supprime un groupe définitivement
 */
export async function deleteGroup(groupId: string, userId: string): Promise<void> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new Error('Group not found');
  }

  if (group.ownerId !== userId) {
    throw new Error('Only the owner can delete the group');
  }

  // Supprimer le groupe et tous les membres (cascade)
  await prisma.group.delete({
    where: { id: groupId },
  });
}

/**
 * Retire un membre d'un groupe
 */
export async function removeMember(
  groupId: string,
  memberId: string,
  removedBy: string
): Promise<void> {
  // Vérifier les permissions
  const removerMembership = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: removedBy,
      role: { in: [GroupMemberRole.OWNER, GroupMemberRole.ADMIN] },
    },
  });

  if (!removerMembership && removedBy !== memberId) {
    throw new Error('Insufficient permissions to remove members');
  }

  // Ne pas permettre de retirer le propriétaire
  const memberToRemove = await prisma.groupMember.findFirst({
    where: { groupId, userId: memberId },
  });

  if (!memberToRemove) {
    throw new Error('Member not found');
  }

  if (memberToRemove.role === GroupMemberRole.OWNER) {
    throw new Error('Cannot remove the owner. Transfer ownership first.');
  }

  await prisma.groupMember.delete({
    where: { id: memberToRemove.id },
  });
}
