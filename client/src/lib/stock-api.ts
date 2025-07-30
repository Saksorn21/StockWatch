const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "default_key";
const BASE_URL = "https://yahoo-finance-real-time1.p.rapidapi.com";

export class StockAPI {
  private static async fetchWithAuth(url: string) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'yahoo-finance-real-time1.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  static async getStockQuote(symbol: string) {
    try {
      // Use chart data to get the latest price since quote endpoint might not exist
      const chartData = await this.fetchWithAuth(
        `${BASE_URL}/stock/get-chart?symbol=${symbol}&region=US&lang=en-US&useYfid=true&includeAdjustedClose=true&events=div%2Csplit%2Cearn&range=1d&interval=1m&includePrePost=false`
      );

      if (!chartData.chart?.result?.[0]) {
        throw new Error(`No quote data found for ${symbol}`);
      }

      const result = chartData.chart.result[0];
      const meta = result.meta;
      const prices = result.indicators?.quote?.[0];
      
      // Get latest price from the chart data
      const latestIndex = Math.max(0, (prices?.close?.length || 1) - 1);
      const currentPrice = prices?.close?.[latestIndex] || meta.regularMarketPrice || 0;
      const previousClose = meta.previousClose || meta.chartPreviousClose || currentPrice;
      
      return {
        symbol,
        price: currentPrice,
        change: currentPrice - previousClose,
        changePercent: previousClose && previousClose !== 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        open: meta.regularMarketOpen || currentPrice,
        previousClose: previousClose,
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  static async getCompanyProfile(symbol: string) {
    try {
      const chartData = await this.fetchWithAuth(
        `${BASE_URL}/stock/get-chart?symbol=${symbol}&region=US&lang=en-US&useYfid=true&includeAdjustedClose=true&events=div%2Csplit%2Cearn&range=1d&interval=1m&includePrePost=false`
      );

      const meta = chartData.chart?.result?.[0]?.meta;
      if (!meta) {
        return { name: symbol, country: "", currency: "USD", exchange: "", industry: "", sector: "", website: "", description: "" };
      }
      
      return {
        name: meta.longName || meta.shortName || symbol,
        country: "",
        currency: meta.currency || "USD",
        exchange: meta.exchangeName || "",
        industry: "",
        sector: "",
        website: "",
        description: "",
      };
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
      return {
        name: symbol,
        country: "",
        currency: "USD",
        exchange: "",
        industry: "",
        sector: "",
        website: "",
        description: "",
      };
    }
  }

  static async getStockCandles(symbol: string, range: string = "1d", interval: string = "1m") {
    try {
      const data = await this.fetchWithAuth(
        `${BASE_URL}/stock/get-chart?symbol=${symbol}&region=US&lang=en-US&useYfid=true&includeAdjustedClose=true&events=div%2Csplit%2Cearn&range=${range}&interval=${interval}&includePrePost=false`
      );

      if (!data.chart?.result?.[0]?.timestamp) {
        throw new Error("No chart data available");
      }

      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      return timestamps.map((timestamp: number, index: number) => ({
        timestamp: timestamp * 1000,
        open: quotes.open[index] || 0,
        high: quotes.high[index] || 0,
        low: quotes.low[index] || 0,
        close: quotes.close[index] || 0,
        volume: quotes.volume[index] || 0,
      })).filter((candle: any) => candle.close > 0); // Filter out invalid data points
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error);
      // Fallback to current price if chart data fails
      try {
        const quote = await this.getStockQuote(symbol);
        const currentTime = Date.now();
        return [
          {
            timestamp: currentTime - (24 * 60 * 60 * 1000),
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
      } catch (fallbackError) {
        console.error('Fallback chart data failed:', fallbackError);
        return [];
      }
    }
  }

  static async searchStocks(query: string) {
    try {
      // Since we don't have a search endpoint, return common stocks for demo
      const commonStocks = [
        { symbol: query.toUpperCase(), shortname: query.toUpperCase(), longname: query.toUpperCase(), type: 'EQUITY' }
      ];
      return commonStocks;
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
      return [];
    }
  }

  static async getMarketIndices() {
    const indices = [
      { symbol: "SPY", name: "S&P 500" },
      { symbol: "QQQ", name: "NASDAQ" },
      { symbol: "DIA", name: "Dow Jones" },
      { symbol: "GLD", name: "Gold ETF" },
    ];

    try {
      const promises = indices.map(async (index) => {
        try {
          const quote = await this.getStockQuote(index.symbol);
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