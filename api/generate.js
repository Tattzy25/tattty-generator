export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },
    responseLimit: false,
  },
  maxDuration: 300,
};

const DIFY_MCP_URL = process.env.DIFY_MCP_URL;
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS || 120000);

function validateIncomingBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Request body must be a JSON object';
  if (typeof body.method !== 'string') return 'Missing or invalid JSON-RPC method';
  if ('id' in body) {
    const validId = typeof body.id === 'string' || typeof body.id === 'number' || body.id === null;
    if (!validId) return 'Invalid JSON-RPC id';
  }
  return null;
}

export default async function handler(req, res) {
  const requestId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  res.setHeader('X-Request-ID', requestId);
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!DIFY_MCP_URL) {
    console.error('Missing DIFY_MCP_URL', { requestId });
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const validationError = validateIncomingBody(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  req.on?.('close', () => controller.abort());

  const startedAt = Date.now();

  try {
    const upstream = await fetch(DIFY_MCP_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'X-User-ID': 'ak1234',
        'Prefer': 'wait',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify(req.body),
    });

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const retryAfter = upstream.headers.get('retry-after');

    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    if (retryAfter) res.setHeader('Retry-After', retryAfter);

    console.info('Dify upstream connected', {
      requestId,
      upstreamStatus: upstream.status,
      contentType,
      durationMs: Date.now() - startedAt,
    });

    upstream.body.pipe(res);

    upstream.body.on('error', (err) => {
      console.error('Dify stream error', { requestId, error: err.message });
      if (!res.headersSent) res.status(502).json({ error: 'Upstream stream error', requestId });
      else res.destroy(err);
    });

  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    console.error('Dify MCP request failed', {
      requestId,
      durationMs: Date.now() - startedAt,
      error: err?.message,
      name: err?.name,
    });
    if (!res.headersSent) {
      res.status(isAbort ? 504 : 502).json({
        error: isAbort ? 'Upstream request timed out' : 'Upstream request failed',
        requestId,
      });
    }
  } finally {
    clearTimeout(timeout);
  }
}
