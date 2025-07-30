import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioOverviewProps {
  metrics: {
    totalValue: number;
    totalInvested: number;
    totalGain: number;
    totalGainPercent: number;
    stockCount: number;
  };
  isLoading?: boolean;
}

export function PortfolioOverview({ metrics, isLoading }: PortfolioOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Portfolio Value</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center mt-2">
            <span
              className={`text-sm font-medium ${
                metrics.totalGain >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {metrics.totalGain >= 0 ? "+" : ""}${Math.abs(metrics.totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-sm ml-2 ${
                metrics.totalGain >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ({metrics.totalGain >= 0 ? "+" : ""}{metrics.totalGainPercent.toFixed(2)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Invested</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${metrics.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-600">
              {metrics.stockCount} {metrics.stockCount === 1 ? "stock" : "stocks"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Day's Gain/Loss</h3>
          <p className="text-3xl font-bold text-green-600">+$0.00</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-green-600">(+0.00%)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
