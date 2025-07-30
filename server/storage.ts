import { SharedPortfolio, CreateSharedPortfolioInput } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Portfolio sharing operations
  createSharedPortfolio(input: CreateSharedPortfolioInput, portfolioData: any): Promise<SharedPortfolio>;
  getSharedPortfolio(shareId: string): Promise<SharedPortfolio | undefined>;
  deleteSharedPortfolio(shareId: string): Promise<void>;
  listSharedPortfolios(): Promise<SharedPortfolio[]>;
}

export class MemStorage implements IStorage {
  private sharedPortfolios: Map<string, SharedPortfolio> = new Map();

  async createSharedPortfolio(input: CreateSharedPortfolioInput, portfolioData: any): Promise<SharedPortfolio> {
    const shareId = this.generateShareId();
    const now = new Date();
    let expiresAt: string | undefined;
    
    if (input.expiresIn !== "never") {
      const expiration = new Date(now);
      switch (input.expiresIn) {
        case "1h":
          expiration.setHours(expiration.getHours() + 1);
          break;
        case "24h":
          expiration.setHours(expiration.getHours() + 24);
          break;
        case "7d":
          expiration.setDate(expiration.getDate() + 7);
          break;
        case "30d":
          expiration.setDate(expiration.getDate() + 30);
          break;
      }
      expiresAt = expiration.toISOString();
    }

    const sharedPortfolio: SharedPortfolio = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      subPortfolios: portfolioData.subPortfolios || [],
      stocks: portfolioData.stocks || [],
      totalValue: portfolioData.totalValue || 0,
      totalGain: portfolioData.totalGain || 0,
      totalGainPercent: portfolioData.totalGainPercent || 0,
      shareId,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.sharedPortfolios.set(shareId, sharedPortfolio);
    return sharedPortfolio;
  }

  async getSharedPortfolio(shareId: string): Promise<SharedPortfolio | undefined> {
    const portfolio = this.sharedPortfolios.get(shareId);
    
    // Check if portfolio has expired
    if (portfolio && portfolio.expiresAt) {
      const now = new Date();
      const expiryDate = new Date(portfolio.expiresAt);
      if (now > expiryDate) {
        this.sharedPortfolios.delete(shareId);
        return undefined;
      }
    }
    
    return portfolio;
  }

  async deleteSharedPortfolio(shareId: string): Promise<void> {
    this.sharedPortfolios.delete(shareId);
  }

  async listSharedPortfolios(): Promise<SharedPortfolio[]> {
    const now = new Date();
    const validPortfolios: SharedPortfolio[] = [];
    
    // Clean up expired portfolios and return valid ones
    const entries = Array.from(this.sharedPortfolios.entries());
    for (const [shareId, portfolio] of entries) {
      if (portfolio.expiresAt) {
        const expiryDate = new Date(portfolio.expiresAt);
        if (now > expiryDate) {
          this.sharedPortfolios.delete(shareId);
          continue;
        }
      }
      validPortfolios.push(portfolio);
    }
    
    return validPortfolios;
  }

  private generateShareId(): string {
    // Generate a random 8-character alphanumeric ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const storage = new MemStorage();