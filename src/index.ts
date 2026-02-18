import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'slash-api'
  });
});

// Hello world endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to Slash API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// API info
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'Slash API',
    version: '1.0.0',
    description: 'AI Bill Negotiation Agent API',
    endpoints: {
      auth: '/api/auth',
      bills: '/api/bills',
      negotiations: '/api/negotiations'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Slash API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

export default app;