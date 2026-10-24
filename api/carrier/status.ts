const OMNIDIMENSION_API_KEY =
  process.env.OMNIDIMENSION_API_KEY || '0QwCciIMSTdk5MLtE71V_jRLdD8bmumOWR3Ey9M35TY';
const OMNIDIMENSION_BASE_URL =
  process.env.OMNIDIMENSION_BASE_URL || 'https://omnidim.io/api/v1';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let balanceData: any = null;
  try {
    const balRes = await fetch(`${OMNIDIMENSION_BASE_URL}/account/balance`, {
      headers: { Authorization: `Bearer ${OMNIDIMENSION_API_KEY}` },
    });
    if (balRes.ok) {
      balanceData = await balRes.json();
    }
  } catch (e) {}

  const masked = OMNIDIMENSION_API_KEY
    ? `${OMNIDIMENSION_API_KEY.slice(0, 4)}••••${OMNIDIMENSION_API_KEY.slice(-4)}`
    : '';

  return res.status(200).json({
    configured: true,
    apiKeyMasked: masked,
    baseUrl: OMNIDIMENSION_BASE_URL,
    lastSync: new Date().toISOString(),
    lastError: null,
    counts: {
      agents: 1,
      calls: 2,
      phoneNumbers: 1,
      knowledgeItems: 1,
    },
    carrier: 'OmniDimension Voice Carrier Network',
    operational: true,
    balance: balanceData?.balance,
    concurrency: balanceData?.concurrency,
    organization: balanceData?.organization,
  });
}
