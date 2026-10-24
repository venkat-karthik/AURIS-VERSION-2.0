export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

  const transcript = body?.transcript || [];
  const textAll = Array.isArray(transcript)
    ? transcript.map((t: any) => t.text || '').join(' ').toLowerCase()
    : '';

  const isNegative =
    textAll.includes('cut the call') ||
    textAll.includes('end call') ||
    textAll.includes('dnd') ||
    textAll.includes('legal') ||
    textAll.includes('illegal') ||
    textAll.includes('police') ||
    textAll.includes('stop calling') ||
    textAll.includes('complaint');

  const hasAppointment =
    !isNegative &&
    (textAll.includes('appointment') ||
      textAll.includes('schedule') ||
      textAll.includes('book') ||
      textAll.includes('campus visit') ||
      textAll.includes('counseling'));

  const isPositive =
    !isNegative &&
    (hasAppointment ||
      textAll.includes('thank') ||
      textAll.includes('great') ||
      textAll.includes('good') ||
      textAll.includes('interested') ||
      textAll.includes('sounds good'));

  if (isNegative) {
    return res.status(200).json({
      intent: 'Immediate Disconnection / Complaint',
      summary: 'Caller requested call termination or expressed friction; immediate review advised.',
      sentiment: 'negative',
      sentimentScorePercent: 22,
      leadScore: 15,
      appointmentRequested: false,
      appointmentTime: null,
      priority: 'urgent',
      customerRequest: 'Caller expressed friction or requested termination',
    });
  }

  if (hasAppointment) {
    return res.status(200).json({
      intent: 'Admissions & Counseling Scheduling',
      summary: 'Prospective applicant scheduled counseling session or campus tour.',
      sentiment: 'positive',
      sentimentScorePercent: 92,
      leadScore: 92,
      appointmentRequested: true,
      appointmentTime: 'Saturday at 11:30 AM',
      priority: 'high',
      customerRequest: 'B.Tech Program Admissions & Campus Tour',
    });
  }

  if (isPositive) {
    return res.status(200).json({
      intent: 'Course & Campus Information Inquiry',
      summary: 'Prospective applicant interacted with AI voice agent Aria regarding college admissions and curriculum options.',
      sentiment: 'positive',
      sentimentScorePercent: 84,
      leadScore: 78,
      appointmentRequested: false,
      appointmentTime: null,
      priority: 'medium',
      customerRequest: 'Curriculum & Admissions Guidance',
    });
  }

  return res.status(200).json({
    intent: 'General Inquiry / Brief Call',
    summary: 'Brief conversation completed with standard telephone greeting exchange.',
    sentiment: 'neutral',
    sentimentScorePercent: 50,
    leadScore: 35,
    appointmentRequested: false,
    appointmentTime: null,
    priority: 'low',
    customerRequest: 'General inquiries',
  });
}
