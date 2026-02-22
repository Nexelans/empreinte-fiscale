/**
 * API Route pour le chat IA
 * POST /api/ai/chat - Envoie un message et reçoit une réponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendChat } from '@/modules/ai/service';
import { generateFiscalContext } from '@/modules/ai/context';
import { createConversation, getConversation, addMessage } from '@/modules/ai/chat';
import {
  checkAIOperation,
  recordSuccess,
  recordError,
  checkChatRateLimit,
} from '@/modules/ai/rateLimit';
import { recordUsage } from '@/modules/ai/usage';
import { checkAIConsent } from '@/modules/ai/consent';

/**
 * POST /api/ai/chat
 * Envoie un message au chatbot IA avec contexte fiscal
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ RGPD: Vérifier le consentement AVANT toute opération
    const hasConsent = await checkAIConsent(session.user.id);
    if (!hasConsent) {
      return NextResponse.json(
        {
          error: 'Consentement requis',
          message: 'Vous devez accepter la transmission de données à votre IA avant utilisation.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.message || body.message.trim() === '') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Vérifier les limites (rate limit + circuit breaker)
    const operationCheck = checkAIOperation(session.user.id, 'chat');
    if (!operationCheck.allowed) {
      return NextResponse.json(
        {
          error: operationCheck.reason,
          retryAfter: operationCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // Vérifier le rate limit quotidien (DB)
    const dailyLimit = await checkChatRateLimit(session.user.id);
    if (!dailyLimit.allowed) {
      return NextResponse.json(
        {
          error: dailyLimit.reason,
          retryAfter: dailyLimit.retryAfter,
          current: dailyLimit.current,
          limit: dailyLimit.limit,
        },
        { status: 429 }
      );
    }

    // Récupérer ou créer la conversation
    let conversation;
    if (body.conversationId) {
      conversation = getConversation(body.conversationId);
      if (!conversation || conversation.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Conversation not found or unauthorized' },
          { status: 404 }
        );
      }
    } else {
      // Créer une nouvelle conversation avec le contexte fiscal
      const fiscalContext = await generateFiscalContext(session.user.id);
      conversation = createConversation(
        session.user.id,
        fiscalContext.systemPrompt,
        body.context // Ex: "dashboard", "simulation", etc.
      );
    }

    // Ajouter le message de l'utilisateur
    addMessage(conversation.id, {
      role: 'user',
      content: body.message,
    });

    // Envoyer au service IA
    try {
      const response = await sendChat(session.user.id, {
        messages: conversation.messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
      });

      // Enregistrer le succès
      recordSuccess(session.user.id);

      // Enregistrer l'utilisation
      await recordUsage({
        userId: session.user.id,
        provider: response.model.split('-')[0] || 'unknown', // Approximation
        model: response.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        estimatedCost: response.estimatedCost || 0,
        context: conversation.context,
      });

      // Ajouter la réponse de l'assistant
      addMessage(conversation.id, {
        role: 'assistant',
        content: response.content,
      });

      // Get updated daily usage stats
      const updatedLimit = await checkChatRateLimit(session.user.id);

      return NextResponse.json({
        conversationId: conversation.id,
        response: response.content,
        message: response.content, // Backward compatibility
        usage: {
          ...response.usage,
          chatRequestsToday: updatedLimit.current || 0,
        },
        estimatedCost: response.estimatedCost,
      });
    } catch (error: any) {
      // Enregistrer l'erreur
      recordError(session.user.id);

      console.error('AI chat error:', error);

      return NextResponse.json(
        {
          error: 'Failed to get AI response',
          details: error.message || 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
