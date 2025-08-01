import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StockAPI } from "../../lib/stock-api";
import { MarketIndex } from "../../types/stock";

export function MarketIndices() {
  const { data: indices, isLoading, error } = useQuery({
    queryKey: ["market-indices"],
    queryFn: StockAPI.getMarketIndices,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  const getIcon = (symbol: string) => {
    switch (symbol) {
      case "BTC-USD":
        return <DollarSign className="h-4 w-4 text-gray-400" />;
      case "GC=F":
        return <Star className="h-4 w-4 text-gray-400" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm col-span-full">
          <CardContent className="p-6">
            <p className="text-red-600">Failed to load market indices. Please check your API configuration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {indices?.map((index: MarketIndex) => (
        <Card key={index.symbol} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{index.name}</h3>
              {getIcon(index.symbol)}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-gray-900">
                ${index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm font-medium ${
                    index.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {index.change >= 0 ? "+" : ""}${index.change.toFixed(2)}
                </span>
                <span
                  className={`text-sm ${
                    index.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ({index.change >= 0 ? "+" : ""}{index.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
