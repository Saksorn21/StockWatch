import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createSharedPortfolioSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "OK" });
  });

  // Portfolio sharing endpoints
  app.post("/api/portfolio/share", async (req, res) => {
    try {
      const { input, portfolioData } = req.body;
      const validatedInput = createSharedPortfolioSchema.parse(input);
      
      const sharedPortfolio = await storage.createSharedPortfolio(validatedInput, portfolioData);
      res.json(sharedPortfolio);
    } catch (error) {
      console.error("Error creating shared portfolio:", error);
      res.status(400).json({ error: "Failed to create shared portfolio" });
    }
  });

  app.get("/api/portfolio/share/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;
      const sharedPortfolio = await storage.getSharedPortfolio(shareId);
      
      if (!sharedPortfolio) {
        return res.status(404).json({ error: "Shared portfolio not found or expired" });
      }
      
      res.json(sharedPortfolio);
    } catch (error) {
      console.error("Error fetching shared portfolio:", error);
      res.status(500).json({ error: "Failed to fetch shared portfolio" });
    }
  });

  app.delete("/api/portfolio/share/:shareId", async (req, res) => {
    try {
      const { shareId } = req.params;
      await storage.deleteSharedPortfolio(shareId);
      res.json({ message: "Shared portfolio deleted" });
    } catch (error) {
      console.error("Error deleting shared portfolio:", error);
      res.status(500).json({ error: "Failed to delete shared portfolio" });
    }
  });

  app.get("/api/portfolio/shared", async (req, res) => {
    try {
      const sharedPortfolios = await storage.listSharedPortfolios();
      res.json(sharedPortfolios);
    } catch (error) {
      console.error("Error listing shared portfolios:", error);
      res.status(500).json({ error: "Failed to list shared portfolios" });
    }
  });

  // Portfolio comparison endpoint
  app.post("/api/portfolio/compare", async (req, res) => {
    try {
      const { shareIds } = req.body;
      
      if (!Array.isArray(shareIds) || shareIds.length < 2) {
        return res.status(400).json({ error: "At least 2 portfolio IDs are required for comparison" });
      }

      const portfolios = await Promise.all(
        shareIds.map((shareId: string) => storage.getSharedPortfolio(shareId))
      );

      const validPortfolios = portfolios.filter(p => p !== undefined);
      
      if (validPortfolios.length < 2) {
        return res.status(404).json({ error: "Not enough valid portfolios found for comparison" });
      }

      // Generate comparison metrics
      const comparisonMetrics = generateComparisonMetrics(validPortfolios);
      
      res.json({
        portfolios: validPortfolios,
        comparisonMetrics,
      });
    } catch (error) {
      console.error("Error comparing portfolios:", error);
      res.status(500).json({ error: "Failed to compare portfolios" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateComparisonMetrics(portfolios: any[]) {
  // Total value comparison
  const totalValueComparison = portfolios.map(portfolio => ({
    portfolioId: portfolio.id,
    portfolioName: portfolio.name,
    totalValue: portfolio.totalValue,
    totalGain: portfolio.totalGain,
    totalGainPercent: portfolio.totalGainPercent,
  }));

  // Allocation comparison - find common stocks
  const allStocks = new Map<string, any>();
  
  portfolios.forEach(portfolio => {
    portfolio.stocks.forEach((stock: any) => {
      if (!allStocks.has(stock.symbol)) {
        allStocks.set(stock.symbol, {
          symbol: stock.symbol,
          name: stock.name,
          portfolios: [],
        });
      }
      
      const stockData = allStocks.get(stock.symbol);
      const value = stock.currentPrice * stock.shares;
      const allocation = portfolio.totalValue > 0 ? (value / portfolio.totalValue) * 100 : 0;
      
      stockData.portfolios.push({
        portfolioId: portfolio.id,
        portfolioName: portfolio.name,
        allocation,
        value,
      });
    });
  });

  const allocationComparison = Array.from(allStocks.values());

  // Performance comparison - top and bottom performers
  const performanceComparison = portfolios.map(portfolio => {
    const stockPerformance = portfolio.stocks.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.name,
      gainPercent: stock.costPrice > 0 ? ((stock.currentPrice - stock.costPrice) / stock.costPrice) * 100 : 0,
      value: stock.currentPrice * stock.shares,
    }));

    stockPerformance.sort((a: any, b: any) => b.gainPercent - a.gainPercent);

    return {
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      topPerformers: stockPerformance.slice(0, 3),
      bottomPerformers: stockPerformance.slice(-3).reverse(),
    };
  });

  return {
    totalValueComparison,
    allocationComparison,
    performanceComparison,
  };
}
