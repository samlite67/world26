import express from 'express';
import cors from 'cors';
import { Mistral } from '@mistralai/mistralai';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const mistralApiKey = process.env.MISTRAL_API_KEY || 'JCp4pLqmfVTSQXRTFZ61Bf5Q6aV7fXwb';
const client = new Mistral({ apiKey: mistralApiKey });

app.post('/api/mistral/chat', async (req, res) => {
  try {
    const { systemInstruction, prompt, model = 'mistral-large-latest' } = req.body;

    const messages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ];

    const chatResponse = await client.chat.complete({
      model: model,
      messages: messages,
      temperature: 0.7,
      maxTokens: 2000
    });

    const responseText = chatResponse.choices?.[0]?.message?.content || '{}';
    
    res.json({ 
      text: responseText,
      success: true 
    });
  } catch (error) {
    console.error('Mistral API Error:', error);
    res.status(500).json({ 
      error: 'Failed to communicate with Mistral API',
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mistral-proxy' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mistral API proxy server running on http://localhost:${PORT}`);
});
