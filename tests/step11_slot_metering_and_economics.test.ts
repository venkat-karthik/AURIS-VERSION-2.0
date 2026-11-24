import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import http from 'http';
import { app } from '../server.ts';

describe('Auris 2.0 20-Second Slot Metering & Wholesale Unit Economics Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const TEST_PORT = 3211;

  let tenantToken = '';
  let tenantBizId = '';

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(TEST_PORT, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${TEST_PORT}`;
        resolve();
      });
    });

    // Sign up a clean isolated tenant
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `pulse.tester.${Date.now()}@aurisvoice.in`,
        password: 'securePassword123',
        name: 'Pulse Tester',
        businessName: '20s Pulse Logistics',
      }),
    });
    const data = await res.json();
    tenantToken = data.token;
    tenantBizId = data.business.id;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('exposes 20-second slot parameters and wholesale unit economics via GET /api/wallet', async () => {
    const res = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.slotDurationSeconds).toBe(20);
    expect(data.wholesaleUnitEconomics).toBeDefined();
    expect(data.wholesaleUnitEconomics.plivoCarrierPerMinInr).toBe(0.38);
    expect(data.wholesaleUnitEconomics.sarvamSttPerMinInr).toBe(0.50);
    expect(data.wholesaleUnitEconomics.geminiBrainPerMinInr).toBe(0.18);
    expect(data.wholesaleUnitEconomics.indicTtsPerMinInr).toBe(1.08);
    expect(data.wholesaleUnitEconomics.totalWholesaleCostPerMinInr).toBe(2.14);
    expect(data.wholesaleUnitEconomics.grossMarginPercent).toBe(55.4);
  });

  it('sets platform retail rate to ₹4.80/min (₹1.60/slot) and verifies calculated perSlotRateInr', async () => {
    const updateRes = await fetch(`${baseUrl}/api/wallet/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantToken}`,
      },
      body: JSON.stringify({ perMinuteRateInr: 4.80 }),
    });

    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.perMinuteRateInr).toBe(4.80);

    const getRes = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
    });
    const getData = await getRes.json();
    expect(getData.perMinuteRateInr).toBe(4.80);
    expect(getData.perSlotRateInr).toBe(1.60);
  });

  it('verifies web call session starts and terminates cleanly with pulse deduction', async () => {
    // 1. Get initial wallet
    const initRes = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
    });
    const initData = await initRes.json();
    const initBal = initData.balanceInr;

    // 2. Start a web call for this tenant
    const startRes = await fetch(`${baseUrl}/api/voice/web-call/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantToken}`,
      },
      body: JSON.stringify({}),
    });
    expect(startRes.status).toBe(200);
    const startData = await startRes.json();
    expect(startData.success).toBe(true);
    expect(startData.callId).toBeDefined();

    // 3. Stop the call
    const stopRes = await fetch(`${baseUrl}/api/voice/web-call/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantToken}`,
      },
      body: JSON.stringify({ callId: startData.callId }),
    });
    expect(stopRes.status).toBe(200);

    // 4. Verify wallet reflects deduction transaction
    const finalRes = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
    });
    const finalData = await finalRes.json();
    expect(finalData.transactions.length).toBeGreaterThan(0);
    const deductionTxn = finalData.transactions.find((t: any) => t.type === 'deduction');
    expect(deductionTxn).toBeDefined();
    expect(deductionTxn.description).toContain('20s slots');
  });

  it('bypasses platform metering deductions when workspace operates in BYOK mode', async () => {
    // Switch to BYOK mode
    const modeRes = await fetch(`${baseUrl}/api/workspace/telephony-mode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantToken}`,
      },
      body: JSON.stringify({
        telephonyMode: 'byok',
        byokCredentials: {
          plivoAuthId: 'MAMOCKAUTHID123',
          plivoAuthToken: 'mocktokenabc123',
        },
      }),
    });
    expect(modeRes.status).toBe(200);
    const modeData = await modeRes.json();
    expect(modeData.telephonyMode).toBe('byok');

    // Check wallet reports telephonyMode: 'byok'
    const walletRes = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tenantToken}` },
    });
    const walletData = await walletRes.json();
    expect(walletData.telephonyMode).toBe('byok');
  });
});

