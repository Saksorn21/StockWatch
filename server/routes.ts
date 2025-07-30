import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for stock data proxy (if needed for CORS handling)
  
  // Example: Proxy route for Finnhub API to handle CORS issues
  // app.get('/api/stock/quote/:symbol', async (req, res) => {
  //   try {
  //     const { symbol } = req.params;
  //     const apiKey = process.env.FINNHUB_API_KEY;
  //     const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
  //     const data = await response.json();
  //     res.json(data);
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to fetch stock data' });
  //   }
  // });

  const httpServer = createServer(app);
  return httpServer;
}
