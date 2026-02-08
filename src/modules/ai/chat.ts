/**
 * Gestion de l'historique des conversations IA
 * Phase 4 - Module AI
 *
 * Stocke et récupère l'historique des conversations
 * pour maintenir le contexte entre les messages
 */

import { AIMessage } from './types';

/**
 * Conversation IA avec historique
 */
export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: string; // Contexte spécifique (ex: "dashboard", "simulation", "document-analysis")
}

/**
 * Stockage en mémoire de l'historique
 * TODO: Migrer vers la base de données pour persistance
 */
const conversationStore = new Map<string, AIConversation>();

/**
 * Crée une nouvelle conversation
 */
export function createConversation(
  userId: string,
  systemPrompt: string,
  context?: string
): AIConversation {
  const id = generateConversationId();

  const conversation: AIConversation = {
    id,
    userId,
    title: 'Nouvelle conversation',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    context,
  };

  conversationStore.set(id, conversation);

  return conversation;
}

/**
 * Récupère une conversation
 */
export function getConversation(conversationId: string): AIConversation | null {
  return conversationStore.get(conversationId) || null;
}

/**
 * Ajoute un message à une conversation
 */
export function addMessage(
  conversationId: string,
  message: AIMessage
): AIConversation {
  const conversation = conversationStore.get(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  conversation.messages.push(message);
  conversation.updatedAt = new Date();

  // Mettre à jour le titre si c'est le premier message utilisateur
  if (
    message.role === 'user' &&
    conversation.title === 'Nouvelle conversation' &&
    conversation.messages.filter((m) => m.role === 'user').length === 1
  ) {
    conversation.title = generateTitle(message.content);
  }

  conversationStore.set(conversationId, conversation);

  return conversation;
}

/**
 * Supprime une conversation
 */
export function deleteConversation(conversationId: string): void {
  conversationStore.delete(conversationId);
}

/**
 * Liste toutes les conversations d'un utilisateur
 */
export function listConversations(userId: string): AIConversation[] {
  const conversations: AIConversation[] = [];

  for (const conversation of Array.from(conversationStore.values())) {
    if (conversation.userId === userId) {
      conversations.push(conversation);
    }
  }

  // Trier par date de mise à jour (plus récent en premier)
  return conversations.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * Supprime toutes les conversations d'un utilisateur
 */
export function deleteUserConversations(userId: string): void {
  const conversationIds: string[] = [];

  for (const [id, conversation] of Array.from(conversationStore.entries())) {
    if (conversation.userId === userId) {
      conversationIds.push(id);
    }
  }

  for (const id of conversationIds) {
    conversationStore.delete(id);
  }
}

/**
 * Obtient les messages d'une conversation (sans le system prompt)
 */
export function getConversationMessages(
  conversationId: string
): AIMessage[] {
  const conversation = conversationStore.get(conversationId);

  if (!conversation) {
    return [];
  }

  // Retourner tous les messages sauf le system prompt initial
  return conversation.messages.filter((msg) => msg.role !== 'system');
}

/**
 * Obtient tous les messages d'une conversation (incluant system prompt)
 */
export function getAllMessages(conversationId: string): AIMessage[] {
  const conversation = conversationStore.get(conversationId);

  if (!conversation) {
    return [];
  }

  return conversation.messages;
}

/**
 * Tronque l'historique pour respecter la limite de tokens
 * Garde le system prompt et les N derniers messages
 */
export function truncateConversation(
  conversationId: string,
  maxMessages: number = 20
): AIConversation {
  const conversation = conversationStore.get(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Séparer system prompt et messages
  const systemMessages = conversation.messages.filter((m) => m.role === 'system');
  const otherMessages = conversation.messages.filter((m) => m.role !== 'system');

  // Garder les N derniers messages
  const truncatedMessages = otherMessages.slice(-maxMessages);

  conversation.messages = [...systemMessages, ...truncatedMessages];
  conversation.updatedAt = new Date();

  conversationStore.set(conversationId, conversation);

  return conversation;
}

/**
 * Résume l'historique avec l'IA (pour réduire le contexte)
 * TODO: Implémenter avec l'IA pour générer un résumé
 */
export async function summarizeConversation(
  conversationId: string
): Promise<string> {
  const conversation = conversationStore.get(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Pour l'instant, simple concaténation
  // Dans une version future, utiliser l'IA pour générer un vrai résumé
  const messages = conversation.messages.filter((m) => m.role !== 'system');

  const summary = messages
    .map((m) => `${m.role}: ${m.content.substring(0, 100)}...`)
    .join('\n');

  return summary;
}

/**
 * Génère un ID unique pour une conversation
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Génère un titre à partir du premier message
 */
function generateTitle(firstMessage: string): string {
  // Prendre les 50 premiers caractères
  let title = firstMessage.substring(0, 50);

  // Couper au dernier espace pour éviter de couper un mot
  const lastSpace = title.lastIndexOf(' ');
  if (lastSpace > 20) {
    title = title.substring(0, lastSpace);
  }

  // Ajouter des points de suspension si tronqué
  if (firstMessage.length > 50) {
    title += '...';
  }

  return title;
}

/**
 * Nettoie les conversations anciennes (plus de 30 jours)
 * À appeler via un cron job
 */
export function cleanupOldConversations(maxAgeDays: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  const conversationIds: string[] = [];

  for (const [id, conversation] of Array.from(conversationStore.entries())) {
    if (conversation.updatedAt < cutoffDate) {
      conversationIds.push(id);
    }
  }

  for (const id of conversationIds) {
    conversationStore.delete(id);
  }

  return conversationIds.length;
}

/**
 * Exporte une conversation au format JSON
 */
export function exportConversation(conversationId: string): string {
  const conversation = conversationStore.get(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  return JSON.stringify(conversation, null, 2);
}

/**
 * Importe une conversation depuis JSON
 */
export function importConversation(json: string): AIConversation {
  const conversation: AIConversation = JSON.parse(json);

  // Générer un nouvel ID pour éviter les conflits
  conversation.id = generateConversationId();
  conversation.createdAt = new Date(conversation.createdAt);
  conversation.updatedAt = new Date(conversation.updatedAt);

  conversationStore.set(conversation.id, conversation);

  return conversation;
}
