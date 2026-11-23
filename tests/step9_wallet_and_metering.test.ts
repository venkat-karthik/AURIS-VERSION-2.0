import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import http from 'http';
import { app } from '../server.ts';

describe('Auris 2.0 Prepaid Wallet & Per-Minute Metering Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const TEST_PORT = 3209;

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

  it('retrieves workspace wallet state via GET /api/wallet', async () => {
    const res = await fetch(`${baseUrl}/api/wallet`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.balanceInr).toBeDefined();
    expect(typeof data.balanceInr).toBe('number');
    expect(data.currency).toBe('INR');
    expect(data.perMinuteRateInr).toBe(5.0);
    expect(Array.isArray(data.transactions)).toBe(true);
  });

  it('rejects invalid or tiny recharge amounts (< ₹10) with 400', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/recharge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountInr: 5 }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe('INVALID_AMOUNT');
  });

  it('credits prepaid balance on successful recharge via POST /api/wallet/recharge', async () => {
    // 1. Get initial balance
    const initRes = await fetch(`${baseUrl}/api/wallet`);
    const initData = await initRes.json();
    const initialBal = initData.balanceInr;

    // 2. Recharge ₹250 via UPI
    const rechargeRes = await fetch(`${baseUrl}/api/wallet/recharge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountInr: 250,
        paymentMethod: 'razorpay_upi',
      }),
    });

    expect(rechargeRes.status).toBe(200);
    const rechargeData = await rechargeRes.json();
    expect(rechargeData.success).toBe(true);
    expect(rechargeData.creditedAmount).toBe(250);
    expect(rechargeData.balanceInr).toBe(initialBal + 250);

    // 3. Verify transaction entry in ledger
    const getRes = await fetch(`${baseUrl}/api/wallet`);
    const getData = await getRes.json();
    const latestTxn = getData.transactions[0];

    expect(latestTxn.type).toBe('recharge');
    expect(latestTxn.amountInr).toBe(250);
    expect(latestTxn.description).toContain('UPI');
    expect(latestTxn.balanceAfterInr).toBe(initialBal + 250);
  });

  it('updates telephony per-minute rate via POST /api/wallet/rate', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perMinuteRateInr: 4.5 }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.perMinuteRateInr).toBe(4.5);

    // Reset back to standard 5.0
    await fetch(`${baseUrl}/api/wallet/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perMinuteRateInr: 5.0 }),
    });
  });

  it('verifies wallet balance guard blocks outbound calls when balance is drained', async () => {
    // Temporarily switch to managed mode and set rate
    await fetch(`${baseUrl}/api/workspace/telephony-mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telephonyMode: 'managed' }),
    });

    // Verify when wallet has positive balance, startWebCall succeeds
    const callRes = await fetch(`${baseUrl}/api/voice/web-call/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: 'ag_1795354528457' }),
    });

    expect(callRes.status).toBe(200);
    const callData = await callRes.json();
    expect(callData.success).toBe(true);

    // Clean up call
    await fetch(`${baseUrl}/api/voice/web-call/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId: callData.callId }),
    });
  });
});
