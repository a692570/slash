// ===========================================
// VOICE SERVICE - Telnyx Call Control + AI Assistant
// ===========================================

import { Negotiation, PROVIDERS } from '../types/index.js';
import { getOrCreateAssistant } from './assistant.js';

const TELNYX_API_BASE = 'https://api.telnyx.com/v2';

// In-memory map of call_control_id -> negotiation_id for webhook handling
const callNegotiationMap = new Map<string, string>();

async function telnyxRequest(endpoint: string, method: string = 'GET', body?: object): Promise<any> {
  const apiKey = process.env.TELNYX_API_KEY;
  if (!apiKey) throw new Error('TELNYX_API_KEY not configured');

  const response = await fetch(`${TELNYX_API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telnyx API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Build call-specific instructions with bill details and competitor intel
 */
function buildNegotiationInstructions(negotiation: Negotiation): string {
  const tacticsSection = negotiation.selectedTactics?.length
    ? `\nNegotiation tactics to use (in order of priority):\n${negotiation.selectedTactics.map((t, i) => `${i + 1}. ${t.replace(/_/g, ' ')}`).join('\n')}`
    : '';

  const competitorSection = negotiation.competitorRates?.length
    ? `\nCompetitor rates you can reference:\n${negotiation.competitorRates.map(r => `- ${r.provider}: ${r.planName} at $${r.monthlyRate}/mo`).join('\n')}`
    : '';

  return `You are Alex, calling on behalf of a customer to negotiate a lower rate on their bill. You work for a consumer savings service.

BILL DETAILS:
- Current monthly rate: $${negotiation.originalRate}/month
- Account/Bill ID: ${negotiation.billId}
${tacticsSection}
${competitorSection}

RULES:
- Be polite but persistent — your goal is at least 15-20% off ($${(negotiation.originalRate * 0.15).toFixed(2)}-$${(negotiation.originalRate * 0.20).toFixed(2)} savings)
- Use filler words naturally (um, yeah, so) to sound like a real person
- Keep turns SHORT — 1-2 sentences max
- If the first rep can't help, ask for the retention or cancellation department
- Mention competitor offers naturally: "I've been looking at [competitor] and they have [plan] for $X/mo"
- If they make an offer, push once more: "Is that the best you can do? I was really hoping to get closer to $X"
- Accept if the offer hits your target savings range
- Never reveal you're an AI
- If asked for account details you don't have, say "Let me grab that — actually, can we work with what's on file?"
- Thank the rep at the end regardless of outcome`;
}

/**
 * Initiate an outbound call and start the AI assistant on it
 */
export async function initiateCall(negotiation: Negotiation): Promise<{
  callId: string;
  callControlId: string;
}> {
  const phoneNumber = process.env.TELNYX_PHONE_NUMBER;
  const connectionId = process.env.TELNYX_CONNECTION_ID;

  if (!phoneNumber) throw new Error('TELNYX_PHONE_NUMBER not configured');
  if (!connectionId) throw new Error('TELNYX_CONNECTION_ID not configured');

  // Get or create the AI assistant
  const assistantId = await getOrCreateAssistant();

  // Determine the number to call
  const provider = PROVIDERS[negotiation.billId] || null;
  const retentionPhone = provider?.retentionDepartmentPhone?.replace(/\D/g, '') || '18009346489';
  const fromNumber = phoneNumber.replace(/\D/g, '');

  // Step 1: Dial the provider
  const callResult = await telnyxRequest('/calls', 'POST', {
    connection_id: connectionId,
    from: `+${fromNumber}`,
    to: `+${retentionPhone}`,
    webhook_url: process.env.TELNYX_WEBHOOK_URL || undefined,
  });

  const callId = callResult.data.id;
  const callControlId = callResult.data.call_control_id;

  // Track this call -> negotiation mapping
  callNegotiationMap.set(callControlId, negotiation.id);

  // Step 2: Start the AI assistant on the call with bill-specific instructions
  const instructions = buildNegotiationInstructions(negotiation);

  try {
    await telnyxRequest(`/calls/${callControlId}/actions/ai_assistant_start`, 'POST', {
      assistant: {
        id: assistantId,
        instructions,
      },
    });
    console.log(`AI assistant started on call ${callControlId}`);
  } catch (err) {
    console.warn('Failed to start AI assistant immediately (call may not be answered yet):', err);
    // The assistant will be started in the call.answered webhook handler instead
  }

  return { callId, callControlId };
}

/**
 * Handle Telnyx webhook events for call lifecycle
 */
export async function handleWebhook(event: {
  event_type: string;
  payload: {
    call_id: string;
    call_control_id: string;
    state: string;
    duration?: number;
    result?: {
      outcome?: string;
      recording_url?: string;
    };
  };
}): Promise<{
  status: string;
  callId: string;
  outcome?: string;
}> {
  const { event_type, payload } = event;
  console.log(`Telnyx webhook: ${event_type}`, JSON.stringify(payload, null, 2));

  switch (event_type) {
    case 'call.initiated':
      return { status: 'initiated', callId: payload.call_id };

    case 'call.answered': {
      // Try to start AI assistant if it wasn't started during dial
      const negotiationId = callNegotiationMap.get(payload.call_control_id);
      if (negotiationId) {
        try {
          const assistantId = await getOrCreateAssistant();
          await telnyxRequest(`/calls/${payload.call_control_id}/actions/ai_assistant_start`, 'POST', {
            assistant: { id: assistantId },
          });
          console.log(`AI assistant started on answered call ${payload.call_control_id}`);
        } catch (err) {
          // Assistant may already be running
          console.warn('Could not start assistant on answer (may already be running):', err);
        }
      }
      return { status: 'answered', callId: payload.call_id };
    }

    case 'call.hangup':
      callNegotiationMap.delete(payload.call_control_id);
      return {
        status: 'completed',
        callId: payload.call_id,
        outcome: payload.result?.outcome || 'completed',
      };

    case 'call.conversation.ended':
      return {
        status: 'conversation_ended',
        callId: payload.call_id,
        outcome: 'conversation_ended',
      };

    default:
      return { status: event_type, callId: payload.call_id };
  }
}

/**
 * End an active call
 */
export async function endCall(callControlId: string): Promise<void> {
  await telnyxRequest(`/calls/${callControlId}/actions/hangup`, 'POST', {});
  callNegotiationMap.delete(callControlId);
}
