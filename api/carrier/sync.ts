const OMNIDIMENSION_API_KEY =
  process.env.OMNIDIMENSION_API_KEY || '0QwCciIMSTdk5MLtE71V_jRLdD8bmumOWR3Ey9M35TY';
const OMNIDIMENSION_BASE_URL =
  process.env.OMNIDIMENSION_BASE_URL || 'https://omnidim.io/api/v1';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let agentsCount = 1;
  let callsCount = 2;
  let error: string | null = null;

  try {
    const agentsRes = await fetch(`${OMNIDIMENSION_BASE_URL}/agents`, {
      headers: { Authorization: `Bearer ${OMNIDIMENSION_API_KEY}` },
    });
    if (agentsRes.ok) {
      const d: any = await agentsRes.json();
      if (Array.isArray(d.bots)) agentsCount = d.bots.length;
    }

    const callsRes = await fetch(`${OMNIDIMENSION_BASE_URL}/calls/logs`, {
      headers: { Authorization: `Bearer ${OMNIDIMENSION_API_KEY}` },
    });
    if (callsRes.ok) {
      const d: any = await callsRes.json();
      if (Array.isArray(d.call_log_data)) callsCount = d.call_log_data.length;
    }
  } catch (err: any) {
    error = err.message;
  }

  return res.status(200).json({
    success: true,
    lastSync: new Date().toISOString(),
    lastError: error,
    counts: {
      agents: agentsCount,
      calls: callsCount,
      phoneNumbers: 1,
      knowledgeItems: 1,
    },
  });
}
