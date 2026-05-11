export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const response = await fetch('https://api.dify.ai/mcp/server/GTzA5abY7oZKPAsG/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (contentType.includes('text/event-stream')) {
    // Parse SSE — extract last data: line with a result
    const lines = text.split('\n');
    let parsed = null;
    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const json = JSON.parse(line.slice(5).trim());
          if (json.result || json.error) parsed = json;
        } catch {}
      }
    }
    if (!parsed) {
      res.status(500).json({ error: 'Could not parse SSE response', raw: text });
      return;
    }
    res.status(200).json(parsed);
  } else {
    try {
      res.status(response.status).json(JSON.parse(text));
    } catch {
      res.status(500).json({ error: 'Unparseable response', raw: text });
    }
  }
}
