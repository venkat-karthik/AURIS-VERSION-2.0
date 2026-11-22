import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import crypto from 'crypto';
import {
  validatePhoneNumber,
  resolveCallerId,
  resolveAgent,
  getValidatedPublicUrl,
  verifyPlivoWebhook,
  generateAnswerXml,
  processHangupPayload,
  setPlivoClientForTesting,
  getPlivoClient,
} from '../src/services/telephonyService.ts';

describe('Auris 2.0 Telephony Service Unit Tests', () => {
  describe('Phone Number Validation', () => {
    it('accepts valid E.164 phone numbers', () => {
      const res1 = validatePhoneNumber('+919876543210');
      expect(res1.valid).toBe(true);
      expect(res1.formatted).toBe('+919876543210');

      const res2 = validatePhoneNumber('+14155552671');
      expect(res2.valid).toBe(true);
      expect(res2.formatted).toBe('+14155552671');
    });

    it('formats 10-digit Indian national numbers with +91', () => {
      const res = validatePhoneNumber('9876543210');
      expect(res.valid).toBe(true);
      expect(res.formatted).toBe('+919876543210');
    });

    it('formats 11-digit leading zero numbers with +91', () => {
      const res = validatePhoneNumber('09876543210');
      expect(res.valid).toBe(true);
      expect(res.formatted).toBe('+919876543210');
    });

    it('rejects invalid or too short numbers', () => {
      const res1 = validatePhoneNumber('12345');
      expect(res1.valid).toBe(false);
      expect(res1.error).toBeDefined();

      const res2 = validatePhoneNumber('');
      expect(res2.valid).toBe(false);

      const res3 = validatePhoneNumber('invalid-phone');
      expect(res3.valid).toBe(false);

      const res4 = validatePhoneNumber(null);
      expect(res4.valid).toBe(false);
    });
  });

  describe('Caller ID Resolution', () => {
    it('resolves valid requested caller ID', () => {
      const res = resolveCallerId('+918048799695');
      expect(res.valid).toBe(true);
      expect(res.callerId).toBe('+918048799695');
    });

    it('resolves business fallback phone if not specified', () => {
      const orig = process.env.PLIVO_CALLER_ID;
      process.env.PLIVO_CALLER_ID = '';
      const res = resolveCallerId(undefined, '+918012345678');
      process.env.PLIVO_CALLER_ID = orig;
      expect(res.valid).toBe(true);
      expect(res.callerId).toBe('+918012345678');
    });

    it('rejects malformed caller ID', () => {
      const res = resolveCallerId('invalid_number');
      expect(res.valid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('Agent Resolution', () => {
    const mockAgents = [
      { id: '143143', name: 'Real Estate Scheduler', providerAgentId: '143143' },
      { id: 'ag_sales', name: 'Sales Assistant' },
    ];

    it('resolves agent by ID', () => {
      const res = resolveAgent('143143', mockAgents);
      expect(res.valid).toBe(true);
      expect(res.agent.id).toBe('143143');
      expect(res.agent.name).toBe('Real Estate Scheduler');
    });

    it('falls back to first agent when ID is not found', () => {
      const res = resolveAgent('unknown_id', mockAgents);
      expect(res.valid).toBe(true);
      expect(res.agent.id).toBe('143143');
    });

    it('falls back to default agent when agents list is empty', () => {
      const res = resolveAgent(undefined, []);
      expect(res.valid).toBe(true);
      expect(res.agent.id).toBe('ag_default');
    });
  });

  describe('Public URL Validation', () => {
    const origAppUrl = process.env.APP_URL;
    const origAurisUrl = process.env.AURIS_PUBLIC_URL;

    afterEach(() => {
      process.env.APP_URL = origAppUrl;
      process.env.AURIS_PUBLIC_URL = origAurisUrl;
    });

    it('normalizes valid public URL and trims trailing slash', () => {
      process.env.AURIS_PUBLIC_URL = 'https://voice.auris.ai/';
      const url = getValidatedPublicUrl(3000);
      expect(url).toBe('https://voice.auris.ai');
    });

    it('falls back safely for invalid URL schemes', () => {
      process.env.AURIS_PUBLIC_URL = 'ftp://invalid-server';
      const url = getValidatedPublicUrl(3001);
      expect(url).toBe('http://localhost:3001');
    });
  });

  describe('Plivo Answer XML Generation', () => {
    it('generates valid Plivo XML containing speak greeting', () => {
      const xml = generateAnswerXml('Hello from Auris Voice AI');
      expect(xml).toContain('<Response>');
      expect(xml).toContain('<Speak');
      expect(xml).toContain('Hello from Auris Voice AI');
      expect(xml).toContain('</Speak>');
      expect(xml).toContain('</Response>');
    });
  });

  describe('Hangup Payload Processing', () => {
    it('processes completed call and computes duration', () => {
      const payload = {
        CallUUID: 'call_test_123',
        Duration: '75',
        BillDuration: '90',
        HangupCause: 'NORMAL_CLEARING',
        CallStatus: 'completed',
      };
      const result = processHangupPayload(payload);
      expect(result.finalStatus).toBe('answered');
      expect(result.durationSeconds).toBe(75);
      expect(result.durationFormatted).toBe('01:15');
      expect(result.billDurationSeconds).toBe(90);
      expect(result.isDuplicate).toBe(false);
    });

    it('processes busy/unanswered call as missed', () => {
      const payload = {
        CallUUID: 'call_test_busy',
        Duration: '0',
        HangupCause: 'USER_BUSY',
        CallStatus: 'busy',
      };
      const result = processHangupPayload(payload);
      expect(result.finalStatus).toBe('missed');
      expect(result.durationSeconds).toBe(0);
      expect(result.durationFormatted).toBe('00:00');
    });

    it('detects duplicate callbacks idempotently', () => {
      const existingCall = {
        id: 'call_1',
        hangupProcessed: true,
      };
      const payload = {
        CallUUID: 'call_test_dup',
        Duration: '30',
      };
      const result = processHangupPayload(payload, existingCall);
      expect(result.isDuplicate).toBe(true);
    });
  });

  describe('Webhook Authenticity Verification', () => {
    const testSecret = 'test_token_secret_xyz123';
    const origToken = process.env.PLIVO_AUTH_TOKEN;

    beforeEach(() => {
      process.env.PLIVO_AUTH_TOKEN = testSecret;
      process.env.AURIS_PUBLIC_URL = 'https://voice.auris.ai';
    });

    afterEach(() => {
      process.env.PLIVO_AUTH_TOKEN = origToken;
    });

    it('accepts authorized internal test token header', () => {
      const isAuth = verifyPlivoWebhook({
        method: 'POST',
        path: '/api/telephony/plivo/answer',
        headers: { 'x-auris-webhook-token': testSecret },
        body: {},
      });
      expect(isAuth).toBe(true);
    });

    it('validates authentic Plivo V2 signature', () => {
      const uri = 'https://voice.auris.ai/api/telephony/plivo/answer';
      const nonce = '1234567890';
      const hmac = crypto.createHmac('sha256', testSecret);
      const signature = hmac.update(uri + nonce).digest('base64');

      const isAuth = verifyPlivoWebhook({
        method: 'POST',
        path: '/api/telephony/plivo/answer',
        headers: {
          'x-plivo-signature-v2': signature,
          'x-plivo-signature-v2-nonce': nonce,
        },
        body: {},
      });
      expect(isAuth).toBe(true);
    });

    it('rejects invalid or tampered signature', () => {
      const isAuth = verifyPlivoWebhook({
        method: 'POST',
        path: '/api/telephony/plivo/answer',
        headers: {
          'x-plivo-signature-v2': 'tampered_signature_value',
          'x-plivo-signature-v2-nonce': '1234567890',
        },
        body: {},
      });
      expect(isAuth).toBe(false);
    });
  });
});
