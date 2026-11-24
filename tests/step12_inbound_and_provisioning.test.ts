import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import http from 'http';
import { app } from '../server.ts';

describe('Auris 2.0 Inbound Plivo Routing & Workspace Provisioning Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  const TEST_PORT = 3212;

  let tenantTokenA = '';
  let tenantBizA: any = null;
  let starterAgentA: any = null;
  let provisionedNumberA: any = null;

  let tenantTokenB = '';
  let tenantBizB: any = null;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(TEST_PORT, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${TEST_PORT}`;
        resolve();
      });
    });

    // 1. Sign up Tenant A (Kavya Healthcare Hyderabad)
    const resA = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `kavya.clinic.${Date.now()}@aurishealth.in`,
        password: 'securePassword123',
        name: 'Dr. Kavya',
        businessName: 'Kavya Dental Care Hyderabad',
      }),
    });
    const dataA = await resA.json();
    tenantTokenA = dataA.token;
    tenantBizA = dataA.business;

    // 2. Sign up Tenant B (Apna Real Estate Bangalore)
    const resB = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `rajesh.realty.${Date.now()}@apnabiz.in`,
        password: 'securePassword456',
        name: 'Rajesh Sharma',
        businessName: 'Apna Real Estate Bangalore',
      }),
    });
    const dataB = await resB.json();
    tenantTokenB = dataB.token;
    tenantBizB = dataB.business;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('provisions starter agent and initial trunk line on signup for Tenant A', async () => {
    const res = await fetch(`${baseUrl}/api/bootstrap`, {
      headers: { Authorization: `Bearer ${tenantTokenA}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.business.id).toBe(tenantBizA.id);
    expect(data.agents.length).toBeGreaterThanOrEqual(1);
    starterAgentA = data.agents[0];
    expect(starterAgentA.businessId).toBe(tenantBizA.id);

    expect(data.phoneNumbers.length).toBeGreaterThanOrEqual(1);
    const initialLine = data.phoneNumbers[0];
    expect(initialLine.businessId).toBe(tenantBizA.id);
    expect(initialLine.assignedAgentId).toBe(starterAgentA.id);
  });

  it('provisions a dedicated carrier DID for Tenant A via POST /api/telephony/provision-number', async () => {
    const res = await fetch(`${baseUrl}/api/telephony/provision-number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantTokenA}`,
      },
      body: JSON.stringify({
        country: 'IN',
        friendlyName: 'Kavya Dental Inbound Line',
        assignedAgentId: starterAgentA.id,
      }),
    });

    expect(res.status).toBe(201);
    provisionedNumberA = await res.json();

    expect(provisionedNumberA.businessId).toBe(tenantBizA.id);
    expect(provisionedNumberA.number).toContain('+91');
    expect(provisionedNumberA.assignedAgentId).toBe(starterAgentA.id);
    expect(provisionedNumberA.friendlyName).toBe('Kavya Dental Inbound Line');
  });

  it('allows reassigning phone number to a new agent via PATCH /api/phone-numbers/:id', async () => {
    // 1. Create a 2nd agent for Tenant A
    const agentRes = await fetch(`${baseUrl}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantTokenA}`,
      },
      body: JSON.stringify({
        name: 'Dr. Kavya Emergency Triage AI',
        language: 'Telugu, English',
        role: 'Emergency Medical Triage',
      }),
    });
    expect(agentRes.status).toBe(201);
    const secondAgent = await agentRes.json();
    expect(secondAgent.businessId).toBe(tenantBizA.id);

    // 2. Reassign the provisioned phone number to secondAgent
    const patchRes = await fetch(`${baseUrl}/api/phone-numbers/${provisionedNumberA.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantTokenA}`,
      },
      body: JSON.stringify({
        assignedAgentId: secondAgent.id,
        friendlyName: 'Emergency Triage Direct Line',
      }),
    });

    expect(patchRes.status).toBe(200);
    const patchData = await patchRes.json();
    expect(patchData.phoneNumber.assignedAgentId).toBe(secondAgent.id);
    expect(patchData.phoneNumber.assignedAgentName).toBe('Dr. Kavya Emergency Triage AI');
  });

  it('dynamically routes an inbound call from Plivo to Tenant A agent with XML stream response', async () => {
    const inboundCallUuid = `plivo_inbound_uuid_${Date.now()}`;
    const callerNumber = '+919876543210';
    const plivoToken = process.env.PLIVO_AUTH_TOKEN || '';

    const answerRes = await fetch(`${baseUrl}/api/telephony/plivo/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auris-webhook-token': plivoToken,
      },
      body: JSON.stringify({
        CallUUID: inboundCallUuid,
        From: callerNumber,
        To: provisionedNumberA.number,
        Direction: 'inbound',
        CallStatus: 'in-progress',
      }),
    });

    expect(answerRes.status).toBe(200);
    const xml = await answerRes.text();
    expect(xml).toContain('<Response>');
    expect(xml).toContain('<Stream');

    // Verify inbound call was logged in Tenant A's workspace
    const callsRes = await fetch(`${baseUrl}/api/calls`, {
      headers: { Authorization: `Bearer ${tenantTokenA}` },
    });
    const callsData = await callsRes.json();
    const inboundCall = callsData.find((c: any) => c.providerCallId === inboundCallUuid);
    expect(inboundCall).toBeDefined();
    expect(inboundCall.businessId).toBe(tenantBizA.id);
    expect(inboundCall.direction).toBe('inbound');
    expect(inboundCall.callerNumber).toBe(callerNumber);
  });

  it('processes Plivo hangup callback and applies 20-second pulse slot deduction to Tenant A', async () => {
    const plivoToken = process.env.PLIVO_AUTH_TOKEN || '';
    // 1. Get initial wallet of Tenant A
    const walletBeforeRes = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tenantTokenA}` },
    });
    const walletBefore = await walletBeforeRes.json();
    const balBefore = walletBefore.balanceInr;

    // 2. Fetch the logged call to find its UUID
    const callsRes = await fetch(`${baseUrl}/api/calls`, {
      headers: { Authorization: `Bearer ${tenantTokenA}` },
    });
    const callsData = await callsRes.json();
    const inboundCall = callsData.find((c: any) => c.direction === 'inbound');
    expect(inboundCall).toBeDefined();

    // 3. Send Hangup webhook for 45-second call (45s = 3 slots @ ₹1.67 or ₹1.60)
    const hangupRes = await fetch(`${baseUrl}/api/telephony/plivo/hangup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auris-webhook-token': plivoToken,
      },
      body: JSON.stringify({
        CallUUID: inboundCall.providerCallId,
        Duration: 45,
        BillDuration: 45,
        HangupCause: 'NORMAL_CLEARING',
        CallStatus: 'completed',
        To: provisionedNumberA.number,
        From: inboundCall.callerNumber,
      }),
    });

    expect(hangupRes.status).toBe(200);

    // 4. Verify wallet reflects deduction
    const walletAfterRes = await fetch(`${baseUrl}/api/wallet`, {
      headers: { Authorization: `Bearer ${tenantTokenA}` },
    });
    const walletAfter = await walletAfterRes.json();
    expect(walletAfter.balanceInr).toBeLessThan(balBefore);

    const deductionTxn = walletAfter.transactions.find(
      (t: any) => t.type === 'deduction' && t.callId === inboundCall.id
    );
    expect(deductionTxn).toBeDefined();
    expect(deductionTxn.description).toContain('20s slots');
  });

  it('strictly isolates knowledge base items and leads between Tenant A and Tenant B', async () => {
    // Tenant A creates a knowledge document
    const kbResA = await fetch(`${baseUrl}/api/knowledge-base`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantTokenA}`,
      },
      body: JSON.stringify({
        title: 'Kavya Dental Root Canal Pricing 2026',
        content: 'Root canal treatment is ₹3,500 for molar teeth.',
      }),
    });
    expect(kbResA.status).toBe(201);

    // Tenant B creates a knowledge document
    const kbResB = await fetch(`${baseUrl}/api/knowledge-base`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tenantTokenB}`,
      },
      body: JSON.stringify({
        title: 'Apna Real Estate Whitefield Luxury Villas',
        content: '3BHK villas start at ₹1.45 Cr in Whitefield.',
      }),
    });
    expect(kbResB.status).toBe(201);

    // Fetch Tenant A's KB -> must only see Tenant A
    const listKbA = await (
      await fetch(`${baseUrl}/api/knowledge-base`, {
        headers: { Authorization: `Bearer ${tenantTokenA}` },
      })
    ).json();
    expect(listKbA.some((k: any) => k.title.includes('Kavya Dental'))).toBe(true);
    expect(listKbA.some((k: any) => k.title.includes('Whitefield Luxury Villas'))).toBe(false);

    // Fetch Tenant B's KB -> must only see Tenant B
    const listKbB = await (
      await fetch(`${baseUrl}/api/knowledge-base`, {
        headers: { Authorization: `Bearer ${tenantTokenB}` },
      })
    ).json();
    expect(listKbB.some((k: any) => k.title.includes('Whitefield Luxury Villas'))).toBe(true);
    expect(listKbB.some((k: any) => k.title.includes('Kavya Dental'))).toBe(false);
  });
});
