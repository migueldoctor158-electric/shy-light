import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, message } = req.body;
  res.status(200).json({
    success: true,
    publishedTopic: topic || "skylight/nodes/telemetry",
    receivedPayload: message,
    timestamp: new Date().toISOString()
  });
}
