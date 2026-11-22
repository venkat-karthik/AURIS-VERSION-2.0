import plivo from 'plivo';
import crypto from 'crypto';

// Read Plivo credentials exclusively from server-side environment variables. Never hardcode.
export function getPlivoCredentials() {
  return {
    authId: process.env.PLIVO_AUTH_ID?.trim() || '',
    authToken: process.env.PLIVO_AUTH_TOKEN?.trim() || '',
    callerId: (process.env.PLIVO_CALLER_ID || process.env.PLIVO_DEFAULT_CALLER_ID)?.trim() || '',
  };
}

let customPlivoClient: any = null;

/**
 * Set a custom/mock Plivo client (used for automated unit and integration tests)
 */
export function setPlivoClientForTesting(client: any | null): void {
  customPlivoClient = client;
}

/**
 * Get or initialize the official Plivo client instance
 */
export function getPlivoClient(): plivo.Client | any | null {
  if (customPlivoClient) {
    return customPlivoClient;
  }
  const { authId, authToken } = getPlivoCredentials();
  if (!authId || !authToken) {
    return null;
  }
  return new plivo.Client(authId, authToken);
}

/**
 * Validate and sanitize destination phone number.
 * Enforces E.164 international format (+[country code][number]).
 * Automatically formats 10-digit Indian numbers with +91 prefix.
 */
export function validatePhoneNumber(num: unknown): { valid: boolean; formatted: string; error?: string } {
  if (!num || typeof num !== 'string') {
    return { valid: false, formatted: '', error: 'Destination phone number is required and must be a string.' };
  }

  let cleaned = num.trim().replace(/[^\d+]/g, '');
  if (!cleaned) {
    return { valid: false, formatted: '', error: 'Destination phone number contains no valid digits.' };
  }

  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = `+91${cleaned.slice(1)}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }

  // Standard E.164: + followed by 7 to 15 digits
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (!e164Regex.test(cleaned)) {
    return {
      valid: false,
      formatted: cleaned,
      error: `Invalid phone number "${num}". Must be in E.164 format (+[country code][number], 7-15 digits).`,
    };
  }

  return { valid: true, formatted: cleaned };
}

/**
 * Validate and resolve the caller ID number
 */
export function resolveCallerId(
  requestedCallerId?: string,
  businessPhone?: string
): { valid: boolean; callerId: string; error?: string } {
  const { callerId: envCallerId } = getPlivoCredentials();
  const candidate = (requestedCallerId && requestedCallerId.trim()) || envCallerId || businessPhone || '+918048799695';
  
  const val = validatePhoneNumber(candidate);
  if (!val.valid) {
    return {
      valid: false,
      callerId: candidate,
      error: `Configured caller ID "${candidate}" is not a valid E.164 number. Check PLIVO_CALLER_ID.`,
    };
  }

  return { valid: true, callerId: val.formatted };
}

/**
 * Resolve target agent from database or return default fallback agent
 */
export function resolveAgent(
  agentId: unknown,
  agentsList: any[] = [],
  businessName: string = 'Auris Voice AI Cloud'
): { valid: boolean; agent: any; error?: string } {
  const fallbackDefaultAgent = {
    id: 'ag_default',
    name: 'Auris Voice Assistant',
    callsCount: 0,
    minutesUsed: 0,
    instructions: {
      greeting: `Hello! Thank you for calling ${businessName}. How may I help you?`,
      role: 'Receptionist',
    },
  };

  if (!agentId) {
    const defaultAgent = agentsList[0] || fallbackDefaultAgent;
    return { valid: true, agent: defaultAgent };
  }

  const needle = String(agentId).trim();
  const matched = agentsList.find(
    (a) => a.id === needle || String(a.id) === needle || a.providerAgentId === needle
  );

  if (matched) {
    return { valid: true, agent: matched };
  }

  // Try numeric match
  const parsedId = parseInt(needle.replace(/\D/g, ''), 10);
  if (!isNaN(parsedId)) {
    const numMatch = agentsList.find(
      (a) => a.id === String(parsedId) || a.providerAgentId === String(parsedId)
    );
    if (numMatch) {
      return { valid: true, agent: numMatch };
    }
  }

  if (agentsList.length > 0) {
    return { valid: true, agent: agentsList[0] };
  }

  return { valid: true, agent: fallbackDefaultAgent };
}

/**
 * Validates and normalizes the public base URL for Plivo callbacks.
 * Never accepts arbitrary callback URLs from user input.
 */
export function getValidatedPublicUrl(port: number = 3000): string {
  const raw = (process.env.AURIS_PUBLIC_URL || process.env.APP_URL || '').trim();
  if (!raw) {
    return `http://localhost:${port}`;
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Unsupported protocol: ${parsed.protocol}`);
    }
    return raw.replace(/\/$/, '');
  } catch (err: any) {
    console.warn(`[Config Warning] Invalid AURIS_PUBLIC_URL "${raw}": ${err.message}. Using default.`);
    return `http://localhost:${port}`;
  }
}

/**
 * Verify webhook authenticity using Plivo's documented signature validation mechanisms:
 * 1. Plivo Signature V3 (X-Plivo-Signature-V3 & X-Plivo-Signature-V3-Nonce)
 * 2. Plivo Signature V2 / V1 (X-Plivo-Signature-V2 / X-Plivo-Signature & Nonce)
 * 3. Authorized Bearer / Internal Webhook Secret for testing
 */
export function verifyPlivoWebhook(options: {
  method: string;
  path: string;
  headers: Record<string, any>;
  body: any;
  port?: number;
}): boolean {
  const { authToken } = getPlivoCredentials();
  if (!authToken) {
    // If auth token is not configured in environment, log warning and allow in local dev
    console.warn('[Plivo Webhook] PLIVO_AUTH_TOKEN is not configured; skipping signature verification in development.');
    return true;
  }

  const publicBase = getValidatedPublicUrl(options.port || 3000);
  const configuredUri = `${publicBase}${options.path}`;

  // Normalize header keys (case-insensitive)
  const headersLower: Record<string, string> = {};
  for (const key of Object.keys(options.headers || {})) {
    const val = options.headers[key];
    if (val !== undefined && val !== null) {
      headersLower[key.toLowerCase()] = Array.isArray(val) ? val[0] : String(val);
    }
  }

  const proto = headersLower['x-forwarded-proto'] || 'http';
  const host = headersLower['x-forwarded-host'] || headersLower['host'] || 'localhost';
  const requestUri = `${proto}://${host}${options.path}`;

  // 1. Check Plivo V3 Signature
  const v3Sig = headersLower['x-plivo-signature-v3'];
  const v3Nonce = headersLower['x-plivo-signature-v3-nonce'];
  if (v3Sig && v3Nonce) {
    for (const testUri of [configuredUri, requestUri]) {
      try {
        if (plivo.validateV3Signature(options.method, testUri, v3Nonce, authToken, v3Sig, options.body || {})) {
          return true;
        }
      } catch (err: any) {
        console.warn('[Plivo Webhook] V3 validation check error:', err.message);
      }
    }
  }

  // 2. Check Plivo V2 / V1 Signature
  const v2Sig = headersLower['x-plivo-signature-v2'] || headersLower['x-plivo-signature'];
  const v2Nonce = headersLower['x-plivo-signature-v2-nonce'] || headersLower['x-plivo-signature-nonce'];
  if (v2Sig && v2Nonce) {
    for (const testUri of [configuredUri, requestUri]) {
      try {
        if (plivo.validateSignature(testUri, v2Nonce, v2Sig, authToken)) {
          return true;
        }
      } catch (err: any) {
        console.warn('[Plivo Webhook] V2 validation check error:', err.message);
      }
    }
  }

  // 3. Check authorized internal token
  const authHeader = headersLower['x-auris-webhook-token'] || headersLower['authorization'];
  if (authHeader && (authHeader === authToken || authHeader === `Bearer ${authToken}`)) {
    return true;
  }

  return false;
}

/**
 * Constructs the WebSocket streaming URL from validated deployment configuration.
 * Never accepts arbitrary callback URLs from user input.
 */
export function getValidatedWebSocketUrl(port: number = 3000, path: string = '/media-stream'): string {
  const publicBase = getValidatedPublicUrl(port);
  const wsBase = publicBase.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${wsBase}${cleanPath}`;
}

/**
 * Generate a cryptographically signed stream auth token for a specific callId
 */
export function createStreamAuthToken(callId: string): string {
  const { authToken } = getPlivoCredentials();
  if (!authToken) return 'dev_token';
  return crypto.createHmac('sha256', authToken).update(callId).digest('hex').slice(0, 32);
}

/**
 * Verify a stream auth token against the configured server secret
 */
export function verifyStreamAuthToken(callId: string, token: string): boolean {
  const { authToken } = getPlivoCredentials();
  if (!authToken) return true; // dev mode
  const expected = crypto.createHmac('sha256', authToken).update(callId).digest('hex').slice(0, 32);
  return token === expected || token === authToken;
}

/**
 * Generate valid Plivo XML for the answered call flow with bidirectional audio streaming
 */
export function generateAnswerXml(
  wsStreamUrlOrSpeakText?: string,
  optionalParam?: string
): string {
  const ResponseConstructor = (plivo as any).Response || plivo.Response;
  const response = new ResponseConstructor();

  let wsStreamUrl: string | undefined;
  let speakText: string | undefined;

  if (wsStreamUrlOrSpeakText) {
    if (wsStreamUrlOrSpeakText.startsWith('ws://') || wsStreamUrlOrSpeakText.startsWith('wss://')) {
      wsStreamUrl = wsStreamUrlOrSpeakText;
      speakText = optionalParam;
    } else {
      speakText = wsStreamUrlOrSpeakText;
      wsStreamUrl = optionalParam;
    }
  }

  if (speakText) {
    response.addSpeak(speakText, {
      voice: 'WOMAN',
      language: 'en-IN',
    });
  }

  if (wsStreamUrl) {
    response.addStream(wsStreamUrl, {
      bidirectional: 'true',
      keepCallAlive: 'true',
      contentType: 'audio/x-mulaw;rate=8000',
    });
  }

  return response.toXML();
}

/**
 * Parse and validate Plivo hangup callback payload
 */
export function processHangupPayload(payload: any, existingCall?: any) {
  const durationSec = parseInt(String(payload.Duration || payload.duration || '0'), 10) || 0;
  const billDurationSec = parseInt(String(payload.BillDuration || payload.bill_duration || durationSec), 10) || durationSec;
  const hangupCause = payload.HangupCause || payload.hangup_cause || 'NORMAL_CLEARING';
  const callStatus = (payload.CallStatus || payload.call_status || (durationSec > 0 ? 'completed' : 'no-answer')).toLowerCase();

  let finalStatus: 'answered' | 'missed' | 'failed' = 'answered';
  if (durationSec > 0 || callStatus === 'completed') {
    finalStatus = 'answered';
  } else if (callStatus === 'busy' || hangupCause === 'USER_BUSY') {
    finalStatus = 'missed';
  } else if (callStatus === 'no-answer' || hangupCause === 'NO_ANSWER') {
    finalStatus = 'missed';
  } else {
    finalStatus = 'failed';
  }

  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const isDuplicate = !!(existingCall && existingCall.hangupProcessed);

  return {
    finalStatus,
    durationSeconds: durationSec,
    durationFormatted,
    billDurationSeconds: billDurationSec,
    hangupCause,
    callStatus,
    isDuplicate,
  };
}
