export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Accept both UPPER and lower case env var names (Vercel may lowercase them)
  const apiKey    = process.env.AIRTABLE_API_KEY  || process.env.airtable_api_key;
  const baseId    = process.env.AIRTABLE_BASE_ID  || process.env.airtable_base_id;
  const tableName = process.env.AIRTABLE_TABLE    || process.env.airtable_table || 'Leads Cyber Scoring';

  if (!apiKey || !baseId) {
    return res.status(500).json({ error: 'Airtable not configured' });
  }

  try {
    const body = req.body;
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: body }),
      }
    );
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
