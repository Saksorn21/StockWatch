
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "../contexts/portfolio-context";

interface PerformanceData {
  date: string;
  portfolioValueUSD: number;
  portfolioPercentage: number;
  indexValueUSD: number;
  indexPercentage: number;
  timestamp: number;
}

export default function PerformancePage() {
  const [selectedIndex, setSelectedIndex] = useState<"^GSPC" | "^IXIC">("^GSPC");
  const [viewMode, setViewMode] = useState<"USD" | "percentage">("percentage");
  
  const { getAllPortfolioStocks, portfolioMetrics } = usePortfolio();
  const allStocks = getAllPortfolioStocks();

  // Generate performance data based on actual portfolio
  const performanceData = useMemo(() => {
    if (allStocks.length === 0) {
      return [];
    }

    const startDate = new Date("2024-01-01");
    const data: PerformanceData[] = [];
    
    // Use actual portfolio metrics as current values
    const currentPortfolioValue = portfolioMetrics.totalValue;
    const portfolioInvested = portfolioMetrics.totalInvested;
    
    // If no portfolio value, return empty data
    if (currentPortfolioValue === 0) {
      return [];
    }
    
    const baseIndexValues = {
      "^GSPC": 4700, // S&P 500 approximate start value
      "^IXIC": 14500  // Nasdaq 100 approximate start value
    };

    // Generate historical data points (last 12 months)
    for (let i = 0; i < 365; i += 7) { // Weekly data points
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      if (currentDate > new Date()) break;
      
      // Calculate progress through the year (0 to 1)
      const progress = i / 365;
      
      // Simulate portfolio growth from invested amount to current value
      const portfolioGrowthFactor = currentPortfolioValue / Math.max(portfolioInvested, 1);
      const portfolioValue = portfolioInvested * (1 + (portfolioGrowthFactor - 1) * progress);
      
      // Generate realistic market index performance
      const baseIndexValue = baseIndexValues[selectedIndex];
      const marketVolatility = 0.15; // 15% annual volatility
      const marketReturn = selectedIndex === "^GSPC" ? 0.10 : 0.12; // Historical returns
      
      const randomFactor = 1 + (Math.random() - 0.5) * marketVolatility * Math.sqrt(progress);
      const indexValue = baseIndexValue * (1 + marketReturn * progress) * randomFactor;
      
      // Calculate percentage returns from start
      const portfolioPercentage = portfolioInvested > 0 ? ((portfolioValue - portfolioInvested) / portfolioInvested) * 100 : 0;
      const indexPercentage = ((indexValue - baseIndexValue) / baseIndexValue) * 100;
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        portfolioValueUSD: portfolioValue,
        portfolioPercentage,
        indexValueUSD: indexValue,
        indexPercentage,
        timestamp: currentDate.getTime(),
      });
    }

    return data;
  }, [selectedIndex, allStocks, portfolioMetrics.totalValue, portfolioMetrics.totalInvested]);

  const indexName = selectedIndex === "^GSPC" ? "S&P 500" : "Nasdaq 100";
  
  // Get the latest data point for summary stats
  const latestData = performanceData[performanceData.length - 1];

  // Show message if no portfolio data
  if (allStocks.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Performance</h2>
          <p className="text-gray-600 mt-1">Compare your portfolio against market indices</p>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Data</h3>
            <p className="text-gray-600 mb-4">
              Add stocks to your portfolio to see performance comparisons against market indices.
            </p>
            <Button asChild>
              <a href="/portfolio">Go to Portfolio</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Portfolio Performance</h2>
        <p className="text-gray-600 mt-1">Compare your portfolio against market indices</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${portfolioMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500">
              Invested: ${portfolioMetrics.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Gain/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioMetrics.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioMetrics.totalGain >= 0 ? '+' : ''}${portfolioMetrics.totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm ${portfolioMetrics.totalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioMetrics.totalGainPercent >= 0 ? '+' : ''}{portfolioMetrics.totalGainPercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Number of Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {portfolioMetrics.stockCount}
            </div>
            <div className="text-sm text-gray-500">
              Active positions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <CardTitle>Portfolio Performance vs. Market Index</CardTitle>
            <div className="flex space-x-2">
              {/* Index Selection */}
              <Button
                variant={selectedIndex === "^GSPC" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIndex("^GSPC")}
              >
                S&P 500
              </Button>
              <Button
                variant={selectedIndex === "^IXIC" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIndex("^IXIC")}
              >
                Nasdaq 100
              </Button>
              
              {/* View Mode Toggle */}
              <div className="ml-4 flex space-x-2">
                <Button
                  variant={viewMode === "percentage" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("percentage")}
                >
                  %
                </Button>
                <Button
                  variant={viewMode === "USD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("USD")}
                >
                  USD
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {performanceData.length > 0 ? (
            <>
              <div className="h-96 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      tickFormatter={(value) => 
                        viewMode === "USD" 
                          ? `$${value.toLocaleString()}` 
                          : `${value.toFixed(1)}%`
                      }
                    />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => [
                        viewMode === "USD" 
                          ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : `${value.toFixed(2)}%`,
                        name === "portfolioValueUSD" || name === "portfolioPercentage" ? "Portfolio" : indexName
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={viewMode === "USD" ? "portfolioValueUSD" : "portfolioPercentage"}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Portfolio"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={viewMode === "USD" ? "indexValueUSD" : "indexPercentage"}
                      stroke="#ef4444"
                      strokeWidth={2}
                      name={indexName}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Performance Summary */}
              {latestData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Portfolio Total Return</p>
                    <p className={`text-lg font-semibold ${latestData.portfolioPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {latestData.portfolioPercentage >= 0 ? '+' : ''}{latestData.portfolioPercentage.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{indexName} Total Return</p>
                    <p className={`text-lg font-semibold ${latestData.indexPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {latestData.indexPercentage >= 0 ? '+' : ''}{latestData.indexPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="mb-2">No performance data available</p>
                <p className="text-sm">Add stocks to your portfolio to see performance comparisons</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
