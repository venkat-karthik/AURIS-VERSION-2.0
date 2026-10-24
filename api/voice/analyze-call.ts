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

  const hasAppointment = textAll.includes('appointment') || textAll.includes('schedule') || textAll.includes('book') || textAll.includes('tomorrow');
  const sentiment = textAll.includes('thank') || textAll.includes('great') || textAll.includes('good') || textAll.includes('yes') ? 'positive' : 'neutral';

  return res.status(200).json({
    intent: hasAppointment ? 'Admissions & Counseling Scheduling' : 'Course & Campus Information Inquiry',
    summary: 'Prospective applicant interacted with AI voice agent Aria regarding college admissions, curriculum options, and counseling.',
    sentiment,
    sentimentScorePercent: sentiment === 'positive' ? 94 : 78,
    leadScore: hasAppointment ? 92 : 80,
    appointmentRequested: hasAppointment,
    appointmentTime: hasAppointment ? 'Tomorrow at 11:00 AM' : null,
    priority: hasAppointment ? 'high' : 'medium',
    customerRequest: 'B.Tech Program Admissions & Campus Tour',
  });
}
