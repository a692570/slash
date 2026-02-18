// ===========================================
// VOICE SERVICE - Telnyx Call Control Integration
// ===========================================

import { Negotiation, PROVIDERS } from '../types/index.js';

// Telnyx API configuration
const TELNYX_API_BASE = 'https://api.telnyx.com/v2';

/**
 * Get Telnyx credentials from environment
 */
function getTelnyxCredentials(): { apiKey: string, phoneNumber: string } {
  const apiKey = process.env.TELNYX_API_KEY;
  const phoneNumber = process.env.TELNYX_PHONE_NUMBER;
  
  if (!apiKey) {
    throw new Error('TELNYX_API_KEY not configured');
  }
  if (!phoneNumber) {
    throw new Error('TELNYX_PHONE_NUMBER not configured');
  }
  
  return { apiKey, phoneNumber };
}

/**
 * Make Telnyx API request
 */
async function telnyxRequest(
  endpoint: string,
  method: string = 'GET',
  body?: object
): Promise<any> {
  const { apiKey } = getTelnyxCredentials();
  
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
 * Initiate an outbound call for negotiation
 */
export async function initiateCall(negotiation: Negotiation): Promise<{
  callId: string;
  callControlId: string;
}> {
  const { phoneNumber } = getTelnyxCredentials();
  
  // Get the provider info
  const provider = PROVIDERS.comcast; // Would be fetched from bill in production
  
  // Get the provider's retention phone number
  const retentionPhone = provider.retentionDepartmentPhone || '+18009346489';
  
  // Clean phone numbers
  const fromNumber = phoneNumber.replace(/\D/g, '');
  const toNumber = retentionPhone.replace(/\D/g, '');
  
  try {
    const result = await telnyxRequest('/calls', 'POST', {
      connection_id: process.env.TELNYX_CONNECTION_ID,
      from: `+${fromNumber}`,
      to: `+${toNumber}`,
      // Use Telnyx AI for voice
      ai_agent: {
        name: 'slash_negotiator',
        prompt: buildNegotiationPrompt(negotiation),
        voice: 'female_1', // Professional female voice
        language: 'en-US',
      },
    });
    
    return {
      callId: result.data.id,
      callControlId: result.data.call_control_id,
    };
  } catch (error) {
    console.error('Failed to initiate call:', error);
    throw error;
  }
}

/**
 * Build the AI prompt for the negotiation
 */
function buildNegotiationPrompt(negotiation: Negotiation): string {
  return `You are a professional bill negotiator named Alex, working for Slash, a service that helps consumers get better rates on their bills.

Your goal is to negotiate a lower monthly rate for the customer's bill. You are polite, persistent, and professional.

Current Bill Details:
- Original Rate: $${negotiation.originalRate}/month
- Account ID: ${negotiation.billId}

${negotiation.selectedTactics?.length ? `Use these tactics in order:
${negotiation.selectedTactics.map((t, i) => `${i + 1}. ${t}`).join('\n')}` : ''}

${negotiation.competitorRates?.length ? `Competitor Intelligence:
${negotiation.competitorRates.map(r => `- ${r.provider}: $${r.monthlyRate}/month`).join('\n')}` : ''}

Guidelines:
- Be polite but persistent
- Don't give up easily
- Know the provider's typical retention policies
- Ask for the supervisor if needed
- Aim for at least 15-20% savings
- Once you get an offer, try to get a better one
- Thank the representative regardless of outcome

Start the conversation by identifying yourself and the purpose of your call.`;
}

/**
 * Handle Telnyx webhook events
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
  
  console.log(`Telnyx webhook: ${event_type}`, payload);
  
  switch (event_type) {
    case 'call_initiated':
      return {
        status: 'initiated',
        callId: payload.call_id,
      };
      
    case 'call_answered':
      return {
        status: 'answered',
        callId: payload.call_id,
      };
      
    case 'call_hangup':
      return {
        status: 'completed',
        callId: payload.call_id,
        outcome: payload.result?.outcome || 'completed',
      };
      
    case 'call_failed':
      return {
        status: 'failed',
        callId: payload.call_id,
        outcome: 'failed',
      };
      
    case 'ai_agent_speech_started':
      return {
        status: 'speaking',
        callId: payload.call_id,
      };
      
    case 'ai_agent_speech_stopped':
      return {
        status: 'listening',
        callId: payload.call_id,
      };
      
    default:
      return {
        status: 'unknown',
        callId: payload.call_id,
      };
  }
}

/**
 * Send a response during an active call (for AI gather)
 */
export async function sendCallResponse(
  callControlId: string,
  text: string
): Promise<void> {
  await telnyxRequest(`/calls/${callControlId}/actions/ai-gather`, 'POST', {
    prompt: text,
    voice: 'female_1',
    language: 'en-US',
  });
}

/**
 * End an active call
 */
export async function endCall(callControlId: string): Promise<void> {
  await telnyxRequest(`/calls/${callControlId}/actions/hangup`, 'POST', {
    reason: 'customer_requested',
  });
}

/**
 * Transfer call to a supervisor
 */
export async function transferToSupervisor(callControlId: string): Promise<void> {
  await telnyxRequest(`/calls/${callControlId}/actions/transfer`, 'POST', {
    to: 'supervisor',
  });
}