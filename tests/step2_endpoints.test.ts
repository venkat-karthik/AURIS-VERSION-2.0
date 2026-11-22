import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import http from 'http';
import { app } from '../server.ts';
import { setPlivoClientForTesting } from '../src/services/telephonyService.ts';

import fs from 'fs';
import path from 'path';

let server: http.Server;
let baseUrl: string;
const TEST_PORT = 3199;
const dbPath = path.join(process.cwd(), 'data', 'auris_db.json');
let initialDbContent = '';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = String(TEST_PORT);
  process.env.AURIS_PUBLIC_URL = `http://127.0.0.1:${TEST_PORT}`;

  if (fs.existsSync(dbPath)) {
    initialDbContent = fs.readFileSync(dbPath, 'utf8');
  }

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${TEST_PORT}`;
      resolve();
    });
  });
});

afterAll(async () => {
  setPlivoClientForTesting(null);
  if (initialDbContent) {
    fs.writeFileSync(dbPath, initialDbContent, 'utf8');
  }
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

describe('Auris 2.0 Telephony Endpoints Integration Tests', () => {
  const testAuthToken = 'auris_test_auth_secret_777';

  beforeEach(() => {
    process.env.PLIVO_AUTH_TOKEN = testAuthToken;
    process.env.PLIVO_AUTH_ID = 'MAMOCKAUTHID12345';
    process.env.PLIVO_CALLER_ID = '+918048799695';
  });

  describe('POST /api/telephony/dispatch-call', () => {
    it('rejects invalid destination phone number with 400', async () => {
      const res = await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: 'invalid_number',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.code).toBe('INVALID_DESTINATION_NUMBER');
      expect(data.error).toBeDefined();
    });

    it('returns 503 when Plivo credentials are not configured', async () => {
      setPlivoClientForTesting(null);
      const origAuthId = process.env.PLIVO_AUTH_ID;
      process.env.PLIVO_AUTH_ID = '';

      const res = await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: '+919876543210',
        }),
      });

      process.env.PLIVO_AUTH_ID = origAuthId;
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.code).toBe('TELEPHONY_NOT_CONFIGURED');
    });

    it('successfully dispatches outbound call via mocked Plivo client', async () => {
      let createCallArgs: any = null;
      const mockRequestUuid = `req_${Date.now()}`;

      setPlivoClientForTesting({
        calls: {
          create: async (from: string, to: string, answerUrl: string, params: any) => {
            createCallArgs = { from, to, answerUrl, params };
            return {
              apiId: 'mock_api_id',
              message: 'call fired',
              requestUuid: mockRequestUuid,
            };
          },
        },
      });

      const uniqueDest = `+9191234${Math.floor(10000 + Math.random() * 90000)}`;

      const res = await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: uniqueDest,
          callerName: 'Rajesh Sharma',
          scenario: 'Real Estate Consultation',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();

      // Verify Plivo SDK method was called with verified server-side public URLs
      expect(createCallArgs).not.toBeNull();
      expect(createCallArgs.from).toBe('+918048799695');
      expect(createCallArgs.to).toBe(uniqueDest);
      expect(createCallArgs.answerUrl).toBe(`${baseUrl}/api/telephony/plivo/answer`);
      expect(createCallArgs.params.hangupUrl).toBe(`${baseUrl}/api/telephony/plivo/hangup`);
      expect(createCallArgs.params.answerMethod).toBe('POST');
      expect(createCallArgs.params.hangupMethod).toBe('POST');

      // Verify response shape and pending call record
      expect(data.liveCarrierDispatched).toBe(true);
      expect(data.success).toBe(true);
      expect(data.status).toBe('initiated');
      expect(data.durationSeconds).toBe(0);
      expect(data.durationFormatted).toBe('00:00');
      expect(data.transcript).toEqual([]);
      expect(data.providerCallId).toBe(mockRequestUuid);
      expect(data.callerNumber).toBe(uniqueDest);
      expect(data.callerName).toBe('Rajesh Sharma');
    });

    it('prevents duplicate dispatches on retries within active window', async () => {
      const mockRequestUuid = `req_dup_${Date.now()}`;
      setPlivoClientForTesting({
        calls: {
          create: async () => ({
            apiId: 'mock_api_id',
            message: 'call fired',
            requestUuid: mockRequestUuid,
          }),
        },
      });

      const uniqueDest = `+9198888${Math.floor(10000 + Math.random() * 90000)}`;

      // First dispatch
      const res1 = await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: uniqueDest,
          callerName: 'Pooja Reddy',
        }),
      });
      expect(res1.status).toBe(201);

      // Immediate retry to same destination number
      const res2 = await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: uniqueDest,
          callerName: 'Pooja Reddy',
        }),
      });

      expect(res2.status).toBe(409);
      const data2 = await res2.json();
      expect(data2.code).toBe('DUPLICATE_CALL_IN_PROGRESS');
      expect(data2.activeCallId).toBeDefined();
    });

    it('handles Plivo provider errors gracefully with 502', async () => {
      setPlivoClientForTesting({
        calls: {
          create: async () => {
            throw new Error('Insufficient carrier balance / account suspended');
          },
        },
      });

      const uniqueDest = `+9197777${Math.floor(10000 + Math.random() * 90000)}`;

      const res = await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: uniqueDest,
        }),
      });

      expect(res.status).toBe(502);
      const data = await res.json();
      expect(data.code).toBe('PLIVO_PROVIDER_ERROR');
      expect(data.details).toContain('Insufficient carrier balance');
    });

    it('handles Plivo provider timeouts with 504', async () => {
      setPlivoClientForTesting({
        calls: {
          create: async () => {
            throw new Error('Plivo call dispatch timed out after 10000ms');
          },
        },
      });

      const uniqueDest = `+9196666${Math.floor(10000 + Math.random() * 90000)}`;

      const res = await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: uniqueDest,
        }),
      });

      expect(res.status).toBe(504);
      const data = await res.json();
      expect(data.code).toBe('PLIVO_TIMEOUT');
    });
  });

  describe('POST /api/telephony/plivo/answer', () => {
    it('rejects unauthorized callback request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/telephony/plivo/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CallUUID: 'unauthorized_uuid',
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('returns valid Plivo XML and updates call to answered when authorized', async () => {
      // First, dispatch a call so we have a pending record
      const uniqueDest = `+9195555${Math.floor(10000 + Math.random() * 90000)}`;
      const mockUuid = `uuid_${Date.now()}`;

      setPlivoClientForTesting({
        calls: {
          create: async () => ({
            requestUuid: mockUuid,
            apiId: 'api_1',
          }),
        },
      });

      const dispatchRes = await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: uniqueDest,
        }),
      });
      expect(dispatchRes.status).toBe(201);

      // Now send answer callback with authorized token header
      const answerRes = await fetch(`${baseUrl}/api/telephony/plivo/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auris-webhook-token': testAuthToken,
        },
        body: JSON.stringify({
          CallUUID: mockUuid,
          To: uniqueDest,
          CallStatus: 'in-progress',
        }),
      });

      expect(answerRes.status).toBe(200);
      expect(answerRes.headers.get('content-type')).toContain('application/xml');

      const xml = await answerRes.text();
      expect(xml).toContain('<Response>');
      expect(xml).toContain('<Stream');
      expect(xml).toContain('</Response>');
    });
  });

  describe('POST /api/telephony/plivo/hangup', () => {
    it('rejects unauthorized hangup request with 401', async () => {
      const res = await fetch(`${baseUrl}/api/telephony/plivo/hangup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CallUUID: 'some_call',
          Duration: '30',
        }),
      });

      expect(res.status).toBe(401);
    });

    it('rejects missing CallUUID and To with 400', async () => {
      const res = await fetch(`${baseUrl}/api/telephony/plivo/hangup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auris-webhook-token': testAuthToken,
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Missing CallUUID or To');
    });

    it('processes hangup callback, updates duration and status', async () => {
      const uniqueDest = `+9194444${Math.floor(10000 + Math.random() * 90000)}`;
      const mockUuid = `uuid_hangup_${Date.now()}`;

      setPlivoClientForTesting({
        calls: {
          create: async () => ({
            requestUuid: mockUuid,
          }),
        },
      });

      await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: uniqueDest,
        }),
      });

      // Send hangup callback
      const hangupRes = await fetch(`${baseUrl}/api/telephony/plivo/hangup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auris-webhook-token': testAuthToken,
        },
        body: JSON.stringify({
          CallUUID: mockUuid,
          To: uniqueDest,
          Duration: '45',
          BillDuration: '60',
          HangupCause: 'NORMAL_CLEARING',
          CallStatus: 'completed',
        }),
      });

      expect(hangupRes.status).toBe(200);
      const hangupData = await hangupRes.json();
      expect(hangupData.received).toBe(true);
      expect(hangupData.status).toBe('answered');
      expect(hangupData.durationSeconds).toBe(45);

      // Verify duplicate callback is handled safely and idempotently
      const dupRes = await fetch(`${baseUrl}/api/telephony/plivo/hangup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auris-webhook-token': testAuthToken,
        },
        body: JSON.stringify({
          CallUUID: mockUuid,
          To: uniqueDest,
          Duration: '45',
        }),
      });

      expect(dupRes.status).toBe(200);
      const dupData = await dupRes.json();
      expect(dupData.duplicate).toBe(true);
    });

    it('marks unanswered or busy call as missed', async () => {
      const uniqueDest = `+9193333${Math.floor(10000 + Math.random() * 90000)}`;
      const mockUuid = `uuid_busy_${Date.now()}`;

      setPlivoClientForTesting({
        calls: {
          create: async () => ({
            requestUuid: mockUuid,
          }),
        },
      });

      await fetch(`${baseUrl}/api/telephony/dispatch-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: uniqueDest,
        }),
      });

      const hangupRes = await fetch(`${baseUrl}/api/telephony/plivo/hangup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auris-webhook-token': testAuthToken,
        },
        body: JSON.stringify({
          CallUUID: mockUuid,
          To: uniqueDest,
          Duration: '0',
          HangupCause: 'USER_BUSY',
          CallStatus: 'busy',
        }),
      });

      expect(hangupRes.status).toBe(200);
      const hangupData = await hangupRes.json();
      expect(hangupData.status).toBe('missed');
      expect(hangupData.durationSeconds).toBe(0);
    });
  });
});
