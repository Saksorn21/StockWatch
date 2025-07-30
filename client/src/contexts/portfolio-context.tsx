import React, { createContext, useContext, useEffect, useState } from "react";
import { Stock, SubPortfolio } from "../types/stock";
import { PortfolioStorage } from "../lib/portfolio-storage";
import { StockAPI } from "../lib/stock-api";

interface PortfolioContextType {
  stocks: Stock[];
  subPortfolios: SubPortfolio[];
  currentPortfolioId: string | null;
  portfolioMetrics: {
    totalValue: number;
    totalInvested: number;
    totalGain: number;
    totalGainPercent: number;
    stockCount: number;
  };
  isLoading: boolean;
  addStock: (stock: Omit<Stock, "id" | "currentPrice">) => Promise<void>;
  updateStock: (id: string, updates: Partial<Stock>) => void;
  deleteStock: (id: string) => void;
  refreshPrices: () => Promise<void>;
  addSubPortfolio: (portfolio: Omit<SubPortfolio, "id" | "createdAt">) => SubPortfolio;
  deleteSubPortfolio: (id: string) => void;
  setCurrentPortfolio: (id: string | null) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [subPortfolios, setSubPortfolios] = useState<SubPortfolio[]>([]);
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      
      // Load sub-portfolios
      const storedSubPortfolios = PortfolioStorage.getSubPortfolios();
      setSubPortfolios(storedSubPortfolios);
      
      // Load stocks - only for current portfolio if one is selected
      const storedStocks = currentPortfolioId 
        ? PortfolioStorage.getStocksByPortfolio(currentPortfolioId)
        : [];
      
      if (storedStocks.length > 0) {
        // Update current prices
        const updatedStocks = await Promise.all(
          storedStocks.map(async (stock) => {
            try {
              const quote = await StockAPI.getStockQuote(stock.symbol);
              return { ...stock, currentPrice: quote.price };
            } catch (error) {
              console.error(`Error updating price for ${stock.symbol}:`, error);
              return stock;
            }
          })
        );
        setStocks(updatedStocks);
        PortfolioStorage.savePortfolio(PortfolioStorage.getPortfolio().map(s => 
          updatedStocks.find(us => us.id === s.id) || s
        ));
      } else {
        setStocks([]);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
      setStocks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addStock = async (stockData: Omit<Stock, "id" | "currentPrice">) => {
    try {
      // Check if we have a current portfolio selected
      if (!currentPortfolioId) {
        throw new Error("Please select a sub-portfolio before adding stocks");
      }

      // Get current price and company name
      const [quote, profile] = await Promise.all([
        StockAPI.getStockQuote(stockData.symbol),
        StockAPI.getCompanyProfile(stockData.symbol)
      ]);

      const newStock = PortfolioStorage.addStock({
        ...stockData,
        portfolioId: currentPortfolioId,
        name: profile.name || stockData.symbol,
        currentPrice: quote.price,
      });

      setStocks(prev => [...prev, newStock]);
    } catch (error) {
      console.error("Error adding stock:", error);
      throw error;
    }
  };

  const updateStock = (id: string, updates: Partial<Stock>) => {
    PortfolioStorage.updateStock(id, updates);
    setStocks(prev => prev.map(stock => 
      stock.id === id ? { ...stock, ...updates } : stock
    ));
  };

  const deleteStock = (id: string) => {
    PortfolioStorage.deleteStock(id);
    setStocks(prev => prev.filter(stock => stock.id !== id));
  };

  const refreshPrices = async () => {
    if (stocks.length === 0) return;

    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const quote = await StockAPI.getStockQuote(stock.symbol);
            return { ...stock, currentPrice: quote.price };
          } catch (error) {
            console.error(`Error updating price for ${stock.symbol}:`, error);
            return stock;
          }
        })
      );
      
      setStocks(updatedStocks);
      PortfolioStorage.savePortfolio(updatedStocks);
    } catch (error) {
      console.error("Error refreshing prices:", error);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, [currentPortfolioId]);

  const addSubPortfolio = (portfolioData: Omit<SubPortfolio, "id" | "createdAt">) => {
    const newPortfolio = PortfolioStorage.addSubPortfolio(portfolioData);
    setSubPortfolios(prev => [...prev, newPortfolio]);
    return newPortfolio;
  };

  const deleteSubPortfolio = (id: string) => {
    PortfolioStorage.deleteSubPortfolio(id);
    setSubPortfolios(prev => prev.filter(p => p.id !== id));
    if (currentPortfolioId === id) {
      setCurrentPortfolioId(null);
      setStocks([]);
    }
  };

  const setCurrentPortfolio = (id: string | null) => {
    setCurrentPortfolioId(id);
  };

  const portfolioMetrics = PortfolioStorage.calculatePortfolioMetrics(stocks);

  return (
    <PortfolioContext.Provider
      value={{
        stocks: portfolioMetrics.stocks,
        subPortfolios,
        currentPortfolioId,
        portfolioMetrics,
        isLoading,
        addStock,
        updateStock,
        deleteStock,
        refreshPrices,
        addSubPortfolio,
        deleteSubPortfolio,
        setCurrentPortfolio,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
