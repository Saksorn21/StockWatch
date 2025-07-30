import { z } from "zod";

export const stockSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  currentPrice: z.number(),
  costPrice: z.number(),
  shares: z.number(),
  targetAllocation: z.number(),
});

export const portfolioStockSchema = stockSchema.extend({
  currentAllocation: z.number().optional(),
  profitLoss: z.number().optional(),
  profitLossPercent: z.number().optional(),
});

export const addStockSchema = z.object({
  symbol: z.string().min(1, "Ticker symbol is required"),
  costPrice: z.number().min(0.01, "Cost price must be greater than 0"),
  shares: z.number().min(0.01, "Number of shares must be greater than 0"),
  targetAllocation: z.number().min(0.1).max(100, "Target allocation must be between 0.1% and 100%"),
});

export const marketIndexSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
});

export const stockQuoteSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  high: z.number().optional(),
  low: z.number().optional(),
  volume: z.number().optional(),
});

export const stockHistorySchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type Stock = z.infer<typeof stockSchema>;
export type PortfolioStock = z.infer<typeof portfolioStockSchema>;
export type AddStockInput = z.infer<typeof addStockSchema>;
export type MarketIndex = z.infer<typeof marketIndexSchema>;
export type StockQuote = z.infer<typeof stockQuoteSchema>;
export type StockHistory = z.infer<typeof stockHistorySchema>;
