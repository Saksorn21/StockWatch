export interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  costPrice: number;
  shares: number;
  targetAllocation: number;
  portfolioId?: string; // Add portfolio association
  currentAllocation?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}

export interface SubPortfolio {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface StockHistory {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RebalanceResult {
  symbol: string;
  name: string;
  shareChange: number;
  newShares: number;
  avgCost: number;
  newAllocation: number;
}
