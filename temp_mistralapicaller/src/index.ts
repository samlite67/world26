import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  MISTRAL_API_KEY: string;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all origins
app.use('*', cors());

// GET /state - Retrieve the saved simulation state
app.get('/state', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT state FROM memory WHERE id = ?')
      .bind('latest')
      .first();
    
    if (!result) return c.json({ state: null });
    return c.json({ state: JSON.parse(result.state as string) });
  } catch (err: any) {
    console.error('Memory Fetch Error:', err);
    return c.json({ error: `Memory Fetch Error: ${err.message}` }, 500);
  }
});

// POST /state - Save the current simulation state
app.post('/state', async (c) => {
  try {
    const { state } = await c.req.json();
    await c.env.DB.prepare('INSERT OR REPLACE INTO memory (id, state, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
      .bind('latest', JSON.stringify(state))
      .run();
    return c.json({ success: true });
  } catch (err: any) {
    console.error('Memory Save Error:', err);
    return c.json({ error: `Memory Save Error: ${err.message}` }, 500);
  }
});

// POST /v1/chat/completions - Proxy to Mistral AI
app.post('/v1/chat/completions', async (c) => {
  const apiKey = c.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'Configuration Error: Missing API Key' }, 500);
  }

  try {
    // Expect the body to match Mistral's request format
    const body = await c.req.json();
    
    // Forward the request to Mistral AI
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    // Return the response from Mistral back to the client
    return c.json(data, response.status as any);
    
  } catch (err: any) {
    return c.json({ error: `Proxy Error: ${err.message}` }, 500);
  }
});

// Root endpoint for health check
app.get('/', (c) => {
  return c.json({ 
    status: 'online', 
    service: 'Mistral API Proxy',
    endpoints: ['/v1/chat/completions', '/state']
  });
});

export default app;
