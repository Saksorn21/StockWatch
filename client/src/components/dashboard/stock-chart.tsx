import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StockAPI } from "../../lib/stock-api";
import { useState } from "react";

interface StockChartProps {
  symbol: string;
}

export function StockChart({ symbol }: StockChartProps) {
  const [timeframe, setTimeframe] = useState("1M");

  const { data: stockData, isLoading: quoteLoading } = useQuery({
    queryKey: ["stock-quote", symbol],
    queryFn: () => StockAPI.getStockQuote(symbol),
    enabled: !!symbol,
  });

  const { data: companyData } = useQuery({
    queryKey: ["company-profile", symbol],
    queryFn: () => StockAPI.getCompanyProfile(symbol),
    enabled: !!symbol,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["stock-candles", symbol, timeframe],
    queryFn: () => {
      const now = Math.floor(Date.now() / 1000);
      let from = now;
      let resolution = "D";

      let range = "1d";
      let interval = "1m";

      switch (timeframe) {
        case "1D":
          range = "1d";
          interval = "1m";
          break;
        case "1W":
          range = "5d";
          interval = "15m";
          break;
        case "1M":
          range = "1mo";
          interval = "1d";
          break;
        case "1Y":
          range = "1y";
          interval = "1wk";
          break;
      }

      return StockAPI.getStockCandles(symbol, range, interval);
    },
    enabled: !!symbol,
  });

  const timeframes = ["1D", "1W", "1M", "1Y"];

  if (!symbol) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Search for a stock to view its chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLoading = quoteLoading || chartLoading;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            {isLoading ? (
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-8 w-32" />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {companyData?.name || symbol} ({symbol})
                </h2>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${stockData?.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-lg font-medium ${
                      stockData && stockData.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stockData && stockData.change >= 0 ? "+" : ""}${stockData?.change.toFixed(2)} (
                    {stockData && stockData.change >= 0 ? "+" : ""}{stockData?.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf ? "bg-primary text-white" : ""}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-96">
          {isLoading ? (
            <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ) : chartData && chartData.length > 0 ? (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="hsl(207, 90%, 54%)"
                    strokeWidth={2}
                    dot={chartData.length <= 2}
                    strokeDasharray={chartData.length <= 2 ? "5,5" : undefined}
                  />
                </LineChart>
              </ResponsiveContainer>
              {chartData.length <= 2 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Limited chart data - showing current price trend
                </p>
              )}
            </div>
          ) : (
            <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Historical chart data unavailable</p>
                <p className="text-xs text-gray-400">Requires premium API access</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
