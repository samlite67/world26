import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  MISTRAL_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all origins
app.use('*', cors());

app.post('/', async (c) => {
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

export default app;
