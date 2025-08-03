
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { StockAPI } from "../lib/stock-api";

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

  // Generate realistic mock portfolio data
  const portfolioData = useMemo(() => {
    const startDate = new Date("2024-01-01");
    const data: PerformanceData[] = [];
    let portfolioValue = 50000; // Starting portfolio value
    let indexValue = 0; // Will be set based on selected index
    
    const baseIndexValues = {
      "^GSPC": 4700, // S&P 500 approximate start value
      "^IXIC": 14500  // Nasdaq 100 approximate start value
    };

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate portfolio performance with some volatility
      const portfolioChange = (Math.random() - 0.48) * 0.02; // Slightly positive bias
      portfolioValue *= (1 + portfolioChange);
      
      // Simulate index performance
      if (i === 0) {
        indexValue = baseIndexValues[selectedIndex];
      }
      const indexChange = selectedIndex === "^GSPC" 
        ? (Math.random() - 0.5) * 0.015 // S&P 500 less volatile
        : (Math.random() - 0.5) * 0.025; // Nasdaq more volatile
      indexValue *= (1 + indexChange);
      
      // Calculate percentages from start
      const portfolioPercentage = ((portfolioValue - 50000) / 50000) * 100;
      const indexPercentage = ((indexValue - baseIndexValues[selectedIndex]) / baseIndexValues[selectedIndex]) * 100;
      
      data.push({
        date: date.toISOString().split('T')[0],
        portfolioValueUSD: portfolioValue - 50000, // Show profit/loss from initial
        portfolioPercentage,
        indexValueUSD: (indexValue - baseIndexValues[selectedIndex]) / baseIndexValues[selectedIndex] * 50000, // Normalize to portfolio scale
        indexPercentage,
        timestamp: date.getTime(),
      });
    }
    
    return data;
  }, [selectedIndex]);

  const { data: currentIndexData } = useQuery({
    queryKey: ["current-index", selectedIndex],
    queryFn: () => StockAPI.getStockQuote(selectedIndex),
    refetchInterval: 60000,
  });

  const latestData = portfolioData[portfolioData.length - 1];
  const indexName = selectedIndex === "^GSPC" ? "S&P 500" : "Nasdaq 100";

  const formatTooltipValue = (value: number, name: string) => {
    if (viewMode === "USD") {
      return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name];
    } else {
      return [`${value.toFixed(2)}%`, name];
    }
  };

  const formatYAxisTick = (value: number) => {
    if (viewMode === "USD") {
      return `$${(value / 1000).toFixed(0)}k`;
    } else {
      return `${value.toFixed(0)}%`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Performance</h1>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Portfolio Performance</h3>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {viewMode === "USD" 
                  ? `$${latestData.portfolioValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${latestData.portfolioPercentage.toFixed(2)}%`
                }
              </p>
              <p className="text-sm text-gray-500">
                {viewMode === "USD" ? "Total Profit/Loss" : "Percentage Return"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{indexName} Performance</h3>
              {latestData.indexPercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {viewMode === "USD" 
                  ? `$${latestData.indexValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${latestData.indexPercentage.toFixed(2)}%`
                }
              </p>
              <p className="text-sm text-gray-500">
                {viewMode === "USD" ? "Equivalent Return" : "Percentage Return"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Portfolio Performance vs. Market Index</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-600">
                Portfolio {latestData.portfolioPercentage >= latestData.indexPercentage ? "Outperforming" : "Underperforming"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Index Selection */}
            <div className="flex space-x-2">
              <Button
                variant={selectedIndex === "^GSPC" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIndex("^GSPC")}
                className={selectedIndex === "^GSPC" ? "bg-primary text-white" : ""}
              >
                S&P 500
              </Button>
              <Button
                variant={selectedIndex === "^IXIC" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIndex("^IXIC")}
                className={selectedIndex === "^IXIC" ? "bg-primary text-white" : ""}
              >
                Nasdaq 100
              </Button>
            </div>

            {/* View Mode Selection */}
            <div className="flex space-x-2">
              <Button
                variant={viewMode === "USD" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("USD")}
                className={viewMode === "USD" ? "bg-primary text-white" : ""}
              >
                USD
              </Button>
              <Button
                variant={viewMode === "percentage" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("percentage")}
                className={viewMode === "percentage" ? "bg-primary text-white" : ""}
              >
                Percentage (%)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  interval="preserveStartEnd"
                />
                <YAxis tickFormatter={formatYAxisTick} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={formatTooltipValue}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={viewMode === "USD" ? "portfolioValueUSD" : "portfolioPercentage"}
                  stroke="hsl(207, 90%, 54%)"
                  strokeWidth={3}
                  name="Your Portfolio"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={viewMode === "USD" ? "indexValueUSD" : "indexPercentage"}
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  name={indexName}
                  dot={false}
                  strokeDasharray="5,5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Performance Comparison Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Performance Difference</p>
                <p className={`text-lg font-semibold ${
                  (latestData.portfolioPercentage - latestData.indexPercentage) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(latestData.portfolioPercentage - latestData.indexPercentage) >= 0 ? '+' : ''}
                  {(latestData.portfolioPercentage - latestData.indexPercentage).toFixed(2)}%
                </p>
              </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
