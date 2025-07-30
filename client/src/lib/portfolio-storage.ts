import { Stock } from "../types/stock";

const PORTFOLIO_KEY = "portfolio_stocks";

export class PortfolioStorage {
  static getPortfolio(): Stock[] {
    try {
      const stored = localStorage.getItem(PORTFOLIO_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading portfolio:", error);
      return [];
    }
  }

  static savePortfolio(stocks: Stock[]): void {
    try {
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(stocks));
    } catch (error) {
      console.error("Error saving portfolio:", error);
      throw new Error("Failed to save portfolio");
    }
  }

  static addStock(stock: Omit<Stock, "id">): Stock {
    const portfolio = this.getPortfolio();
    const newStock: Stock = {
      ...stock,
      id: Date.now().toString(),
    };
    
    portfolio.push(newStock);
    this.savePortfolio(portfolio);
    return newStock;
  }

  static updateStock(id: string, updates: Partial<Stock>): void {
    const portfolio = this.getPortfolio();
    const index = portfolio.findIndex(stock => stock.id === id);
    
    if (index === -1) {
      throw new Error("Stock not found");
    }
    
    portfolio[index] = { ...portfolio[index], ...updates };
    this.savePortfolio(portfolio);
  }

  static deleteStock(id: string): void {
    const portfolio = this.getPortfolio();
    const filtered = portfolio.filter(stock => stock.id !== id);
    this.savePortfolio(filtered);
  }

  static calculatePortfolioMetrics(stocks: Stock[]) {
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.currentPrice * stock.shares), 0);
    const totalInvested = stocks.reduce((sum, stock) => sum + (stock.costPrice * stock.shares), 0);
    const totalGain = totalValue - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    // Calculate current allocations
    const stocksWithAllocations = stocks.map(stock => {
      const currentValue = stock.currentPrice * stock.shares;
      const costValue = stock.costPrice * stock.shares;
      const profitLoss = currentValue - costValue;
      const profitLossPercent = costValue > 0 ? (profitLoss / costValue) * 100 : 0;
      const currentAllocation = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

      return {
        ...stock,
        profitLoss,
        profitLossPercent,
        currentAllocation,
      };
    });

    return {
      stocks: stocksWithAllocations,
      totalValue,
      totalInvested,
      totalGain,
      totalGainPercent,
      stockCount: stocks.length,
    };
  }
}
