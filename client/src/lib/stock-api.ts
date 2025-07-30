const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || "default_key";
const BASE_URL = "https://finnhub.io/api/v1";

export class StockAPI {
  private static async fetchWithAuth(url: string) {
    const response = await fetch(`${url}&token=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  static async getStockQuote(symbol: string) {
    try {
      const data = await this.fetchWithAuth(`${BASE_URL}/quote?symbol=${symbol}`);
      return {
        symbol,
        price: data.c || 0,
        change: data.d || 0,
        changePercent: data.dp || 0,
        high: data.h || 0,
        low: data.l || 0,
        open: data.o || 0,
        previousClose: data.pc || 0,
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  static async getCompanyProfile(symbol: string) {
    try {
      const data = await this.fetchWithAuth(`${BASE_URL}/stock/profile2?symbol=${symbol}`);
      return {
        name: data.name || symbol,
        country: data.country || "",
        currency: data.currency || "USD",
        exchange: data.exchange || "",
        ipo: data.ipo || "",
        marketCapitalization: data.marketCapitalization || 0,
        shareOutstanding: data.shareOutstanding || 0,
        ticker: data.ticker || symbol,
        weburl: data.weburl || "",
        logo: data.logo || "",
        finnhubIndustry: data.finnhubIndustry || "",
      };
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      throw error;
    }
  }

  static async getStockCandles(symbol: string, resolution: string = "D", from?: number, to?: number) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const fromTime = from || now - (30 * 24 * 60 * 60); // 30 days ago
      const toTime = to || now;
      
      const data = await this.fetchWithAuth(
        `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTime}&to=${toTime}`
      );
      
      // Check for access error (free plan limitation)
      if (data.error || data.s !== "ok") {
        // Fallback: create a simple chart with current price point
        const quote = await this.getStockQuote(symbol);
        const currentTime = Date.now();
        return [
          {
            timestamp: currentTime - (24 * 60 * 60 * 1000), // Yesterday
            open: quote.previousClose,
            high: Math.max(quote.price, quote.previousClose),
            low: Math.min(quote.price, quote.previousClose),
            close: quote.previousClose,
            volume: 0,
          },
          {
            timestamp: currentTime,
            open: quote.previousClose,
            high: quote.high || quote.price,
            low: quote.low || quote.price,
            close: quote.price,
            volume: 0,
          },
        ];
      }

      return data.t.map((timestamp: number, index: number) => ({
        timestamp: timestamp * 1000,
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
      }));
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error);
      // Return empty array to prevent app crash
      return [];
    }
  }

  static async searchStocks(query: string) {
    try {
      const data = await this.fetchWithAuth(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
      return data.result || [];
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
      throw error;
    }
  }

  static async getMarketIndices() {
    const indices = [
      { symbol: "SPY", name: "S&P 500 (SPY)" },
      { symbol: "QQQ", name: "NASDAQ (QQQ)" },
      { symbol: "TSLA", name: "Tesla (TSLA)" },  // Using TSLA instead of crypto for demo
      { symbol: "GLD", name: "Gold (GLD)" },
    ];

    try {
      const promises = indices.map(async (index) => {
        try {
          const quote = await StockAPI.getStockQuote(index.symbol);
          return {
            symbol: index.symbol,
            name: index.name,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
          };
        } catch (error) {
          console.error(`Error fetching ${index.symbol}:`, error);
          return {
            symbol: index.symbol,
            name: index.name,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching market indices:", error);
      throw error;
    }
  }
}
