export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const {
    userMessage = '',
    agentName = 'Aria',
    businessName = 'HITAM',
    history = [],
  } = body || {};

  const lower = userMessage.toLowerCase();
  let reply = `Hello! I am ${agentName} from ${businessName}. How may I assist you with your academic inquiries and admissions today?`;

  if (lower.includes('admission') || lower.includes('fee') || lower.includes('apply')) {
    reply = `Admissions for B.Tech CSE, AI & ML, and ECE at ${businessName} are currently active. I can schedule a counseling appointment or help with application submission. Would you like to reserve a time?`;
  } else if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule') || lower.includes('visit')) {
    reply = `I would be delighted to schedule your counseling session! We have availability tomorrow at 11:00 AM or 3:30 PM. Which time works best for you?`;
  } else if (lower.includes('hostel') || lower.includes('campus') || lower.includes('transport')) {
    reply = `${businessName} provides secure campus hostels with Wi-Fi and nutritious dining, plus AC bus routes across Hyderabad and Secunderabad. Would you like our campus brochure sent to you?`;
  } else if (lower.includes('thank') || lower.includes('bye')) {
    reply = `You're very welcome! Thank you for contacting ${businessName}. Have a wonderful day ahead!`;
  } else if (userMessage.trim().length > 0) {
    reply = `Thank you for sharing that. As your ${businessName} admissions assistant, I'm happy to help you with branch selection, scholarships, and campus visits. What would you like to know next?`;
  }

  return res.status(200).json({
    reply,
    latencyMs: 180,
    timestamp: new Date().toISOString(),
  });
}
