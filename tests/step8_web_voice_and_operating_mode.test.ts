import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import http from 'http';
import { app } from '../server.ts';

describe('Auris 2.0 Web Voice Playground & Telephony Operating Mode Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const TEST_PORT = 3205;
  let createdWebCallId = '';

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(TEST_PORT, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${TEST_PORT}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('initializes in-browser voice session via POST /api/voice/web-call/start', async () => {
    const res = await fetch(`${baseUrl}/api/voice/web-call/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'ag_1795354528457',
        language: 'Telugu',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.callId).toBeDefined();
    expect(data.callId.startsWith('web_')).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.langCode).toBe('te-IN');

    createdWebCallId = data.callId;
  });

  it('stops in-browser voice session cleanly via POST /api/voice/web-call/stop', async () => {
    expect(createdWebCallId).toBeDefined();

    const res = await fetch(`${baseUrl}/api/voice/web-call/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callId: createdWebCallId,
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('retrieves workspace telephony operating mode via GET /api/workspace/telephony-mode', async () => {
    const res = await fetch(`${baseUrl}/api/workspace/telephony-mode`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.telephonyMode).toBeDefined();
    expect(['managed', 'byok']).toContain(data.telephonyMode);
    expect(data.byokConfigured).toBeDefined();
  });

  it('updates telephony operating mode and BYOK credentials via POST /api/workspace/telephony-mode', async () => {
    // 1. Switch to BYOK with test credentials
    const updateRes = await fetch(`${baseUrl}/api/workspace/telephony-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telephonyMode: 'byok',
        byokCredentials: {
          plivoAuthId: 'TEST_PLIVO_AUTH_ID',
          plivoAuthToken: 'TEST_PLIVO_TOKEN',
          sarvamApiKey: 'TEST_SARVAM_KEY',
          callerId: '+918048799695',
        },
      }),
    });

    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.telephonyMode).toBe('byok');

    // 2. Verify state was updated
    const getRes = await fetch(`${baseUrl}/api/workspace/telephony-mode`);
    const getData = await getRes.json();
    expect(getData.telephonyMode).toBe('byok');
    expect(getData.byokConfigured.hasPlivoAuthId).toBe(true);
    expect(getData.byokConfigured.hasPlivoAuthToken).toBe(true);
    expect(getData.byokConfigured.hasSarvamApiKey).toBe(true);

    // 3. Switch back to Managed mode
    const resetRes = await fetch(`${baseUrl}/api/workspace/telephony-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telephonyMode: 'managed',
      }),
    });
    expect(resetRes.status).toBe(200);
    const resetData = await resetRes.json();
    expect(resetData.telephonyMode).toBe('managed');
  });
});
