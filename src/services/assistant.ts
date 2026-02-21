// ===========================================
// TELNYX AI ASSISTANT SERVICE
// ===========================================

const TELNYX_API_BASE = 'https://api.telnyx.com/v2';
const ASSISTANT_NAME = 'Slash Bill Negotiator';

let cachedAssistantId: string | null = null;

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

const DEFAULT_INSTRUCTIONS = `You are Alex, a friendly and persistent bill negotiation specialist calling on behalf of a customer. You work for a consumer savings service.

Your approach:
- Be polite but firm — you're here to get a better deal
- Use filler words naturally (um, yeah, so, like) to sound human
- Keep responses short — 1-2 sentences per turn
- If the first rep can't help, politely ask for the retention or loyalty department
- Reference competitor offers when appropriate
- Aim for at least 15-20% savings on the monthly bill
- If they offer something, try once more for a better deal before accepting
- Never reveal you are an AI — you are a human representative
- Thank the rep regardless of outcome
- If asked for account verification details you don't have, say you'll need to call back with that info`;

export async function createSlashAssistant(): Promise<string> {
  const result = await telnyxRequest('/ai/assistants', 'POST', {
    name: ASSISTANT_NAME,
    model: 'openai/gpt-4o',
    instructions: DEFAULT_INSTRUCTIONS,
    greeting: "Hi, yeah, um, I'm calling about an account — I'm hoping to talk to someone about getting a better rate on the monthly bill.",
    voice_settings: {
      voice: 'Minimax.speech-2.8-turbo.English_SadTeen',
      voice_speed: 1.0,
      background_audio: { type: 'predefined_media', value: 'silence', volume: 0.5 },
    },
    transcription: {
      model: 'deepgram/flux',
      language: 'en',
      settings: { eot_threshold: 0.5, eot_timeout_ms: 3000, eager_eot_threshold: 0.3 },
    },
    telephony_settings: {
      supports_unauthenticated_web_calls: false,
      noise_suppression: 'deepfilternet',
      time_limit_secs: 1800,
    },
  });

  const id = result.data?.id;
  if (!id) throw new Error('Failed to create assistant - no ID returned');
  cachedAssistantId = id;
  console.log(`Created Telnyx AI Assistant: ${id}`);
  return id;
}

export async function getOrCreateAssistant(): Promise<string> {
  if (cachedAssistantId) return cachedAssistantId;

  try {
    const result = await telnyxRequest('/ai/assistants');
    const assistants = result.data || [];
    const existing = assistants.find((a: any) => a.name === ASSISTANT_NAME);
    if (existing) {
      cachedAssistantId = existing.id;
      console.log(`Found existing assistant: ${existing.id}`);
      return existing.id;
    }
  } catch (err) {
    console.warn('Failed to list assistants, will create new one:', err);
  }

  return createSlashAssistant();
}
