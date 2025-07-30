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
  targetAllocation: number; // Percentage allocation for this sub-portfolio
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

export interface SharedPortfolio {
  id: string;
  name: string;
  description?: string;
  subPortfolios: SubPortfolio[];
  stocks: Stock[];
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  shareId: string;
  createdAt: string;
  expiresAt?: string;
}

export interface PortfolioComparison {
  portfolios: SharedPortfolio[];
  comparisonMetrics: {
    totalValueComparison: Array<{
      portfolioId: string;
      portfolioName: string;
      totalValue: number;
      totalGain: number;
      totalGainPercent: number;
    }>;
    allocationComparison: Array<{
      symbol: string;
      name: string;
      portfolios: Array<{
        portfolioId: string;
        portfolioName: string;
        allocation: number;
        value: number;
      }>;
    }>;
    performanceComparison: Array<{
      portfolioId: string;
      portfolioName: string;
      topPerformers: Array<{
        symbol: string;
        name: string;
        gainPercent: number;
        value: number;
      }>;
      bottomPerformers: Array<{
        symbol: string;
        name: string;
        gainPercent: number;
        value: number;
      }>;
    }>;
  };
}
