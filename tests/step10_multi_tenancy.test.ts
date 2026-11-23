import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import http from 'http';
import { app } from '../server.ts';

describe('Auris 2.0 Multi-Tenant Auth & Workspace Isolation Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const TEST_PORT = 3210;

  // Test credentials and workspace references
  const userA = {
    email: `dr.rao.${Date.now()}@hyderabadclinic.in`,
    password: 'securePassword123',
    name: 'Dr. Rao',
    businessName: 'Rao Dental Clinic Hyderabad',
  };
  let tokenA = '';
  let workspaceAId = '';
  let agentAId = '';

  const userB = {
    email: `suresh.${Date.now()}@apnaghar.in`,
    password: 'securePassword456',
    name: 'Suresh Kumar',
    businessName: 'Apna Ghar Properties',
  };
  let tokenB = '';
  let workspaceBId = '';

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

  it('rejects signup with missing required fields or short password (< 6 chars)', async () => {
    const res1 = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@clinic.in' }),
    });
    expect(res1.status).toBe(400);
    const data1 = await res1.json();
    expect(data1.code).toBe('MISSING_FIELDS');

    const res2 = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@clinic.in', name: 'Test', password: '123' }),
    });
    expect(res2.status).toBe(400);
    const data2 = await res2.json();
    expect(data2.code).toBe('INVALID_PASSWORD');
  });

  it('registers User A, creates isolated workspace A with ₹500 starter credits & Telugu AI agent', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.token.startsWith('auris_sess_')).toBe(true);
    tokenA = data.token;

    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(userA.email);
    expect(data.user.name).toBe(userA.name);

    expect(data.business).toBeDefined();
    expect(data.business.name).toBe(userA.businessName);
    expect(data.business.wallet).toBeDefined();
    expect(data.business.wallet.balanceInr).toBe(500.0);
    expect(data.business.telephonyMode).toBe('managed');
    workspaceAId = data.business.id;

    expect(data.starterAgent).toBeDefined();
    expect(data.starterAgent.businessId).toBe(workspaceAId);
    expect(data.starterAgent.language).toBe('te-IN');
    expect(data.starterAgent.name).toContain('Rao Dental Clinic');
  });

  it('rejects duplicate signup with the same email', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA),
    });

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.code).toBe('EMAIL_EXISTS');
  });

  it('registers User B with completely distinct isolated workspace B and ₹500 credits', async () => {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userB),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.token).toBeDefined();
    tokenB = data.token;

    expect(data.business.id).not.toBe(workspaceAId);
    workspaceBId = data.business.id;
    expect(data.business.name).toBe(userB.businessName);
    expect(data.business.wallet.balanceInr).toBe(500.0);
  });

  it('enforces agent workspace isolation between User A and User B', async () => {
    // 1. User A creates a specialized root canal agent
    const createAgentRes = await fetch(`${baseUrl}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        name: 'Dr. Rao Root Canal Voice Advisor',
        role: 'Dental Surgery Specialist',
        language: 'te-IN',
      }),
    });

    expect(createAgentRes.status).toBe(201);
    const createdAgent = await createAgentRes.json();
    expect(createdAgent.businessId).toBe(workspaceAId);
    agentAId = createdAgent.id;

    // 2. User A fetches their bootstrap: must see their root canal agent
    const bootARes = await fetch(`${baseUrl}/api/bootstrap`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const bootA = await bootARes.json();
    const agentAFound = bootA.agents.some((a: any) => a.id === agentAId);
    expect(agentAFound).toBe(true);

    // 3. User B fetches their bootstrap: must NOT see User A's root canal agent!
    const bootBRes = await fetch(`${baseUrl}/api/bootstrap`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const bootB = await bootBRes.json();
    const leakFound = bootB.agents.some((a: any) => a.id === agentAId);
    expect(leakFound).toBe(false);

    // User B only sees agents belonging to workspace B
    const userBAgentNames = bootB.agents.map((a: any) => a.name);
    expect(userBAgentNames.some((n: string) => n.includes('Apna Ghar'))).toBe(true);
  });

  it('enforces call logs workspace isolation between User A and User B', async () => {
    // 1. User A saves a call log
    const callAId = `call_rao_${Date.now()}`;
    const createCallRes = await fetch(`${baseUrl}/api/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        id: callAId,
        callerNumber: '+919876543210',
        callerName: 'Patient Suresh',
        agentId: agentAId,
        direction: 'inbound',
        status: 'completed',
        durationSeconds: 95,
      }),
    });

    expect(createCallRes.status).toBe(201);

    // 2. User A retrieves call logs: sees call
    const callsARes = await fetch(`${baseUrl}/api/calls`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const callsA = await callsARes.json();
    expect(callsA.some((c: any) => c.id === callAId)).toBe(true);

    // 3. User B retrieves call logs: does NOT see User A's call!
    const callsBRes = await fetch(`${baseUrl}/api/calls`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const callsB = await callsBRes.json();
    expect(callsB.some((c: any) => c.id === callAId)).toBe(false);
  });

  it('enforces wallet balance isolation: User A recharge does not alter User B balance', async () => {
    // 1. User A recharges ₹1000
    const rechargeRes = await fetch(`${baseUrl}/api/wallet/recharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ amountInr: 1000, paymentMethod: 'razorpay_upi' }),
    });

    expect(rechargeRes.status).toBe(200);
    const rechargeData = await rechargeRes.json();
    expect(rechargeData.balanceInr).toBe(1500.0);

    // 2. User A checks wallet: balance is ₹1500
    const walletARes = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const walletA = await walletARes.json();
    expect(walletA.balanceInr).toBe(1500.0);

    // 3. User B checks wallet: balance remains untouched at ₹500.00!
    const walletBRes = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const walletB = await walletBRes.json();
    expect(walletB.balanceInr).toBe(500.0);
  });

  it('verifies POST /api/auth/login and password verification', async () => {
    // 1. Login with wrong password
    const wrongRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userA.email, password: 'wrongPassword' }),
    });
    expect(wrongRes.status).toBe(401);
    const wrongData = await wrongRes.json();
    expect(wrongData.code).toBe('INVALID_CREDENTIALS');

    // 2. Login with correct password
    const correctRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userA.email, password: userA.password }),
    });
    expect(correctRes.status).toBe(200);
    const correctData = await correctRes.json();
    expect(correctData.token).toBeDefined();
    expect(correctData.user.email).toBe(userA.email);
    expect(correctData.business.id).toBe(workspaceAId);
  });

  it('verifies GET /api/auth/me session resolution with Bearer token', async () => {
    // 1. Missing token returns 401
    const noTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    expect(noTokenRes.status).toBe(401);

    // 2. Valid token returns active user profile and workspace
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    expect(meRes.status).toBe(200);
    const meData = await meRes.json();
    expect(meData.user.email).toBe(userA.email);
    expect(meData.business.id).toBe(workspaceAId);
  });
});
