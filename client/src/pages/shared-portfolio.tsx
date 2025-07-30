import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "wouter";
import { PortfolioAllocationChart } from "../components/portfolio/portfolio-allocation-chart";
import { SharedPortfolio } from "../types/stock";

export default function SharedPortfolioPage() {
  const [, params] = useRoute("/shared/:shareId");
  const shareId = params?.shareId;

  const { data: sharedPortfolio, isLoading, error } = useQuery<SharedPortfolio>({
    queryKey: ["/api/portfolio/share", shareId],
    enabled: !!shareId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !sharedPortfolio) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Portfolio Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This portfolio link may have expired or been removed.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const expiryDate = sharedPortfolio.expiresAt 
    ? new Date(sharedPortfolio.expiresAt).toLocaleDateString()
    : "Never";

  // Mock function to satisfy PortfolioAllocationChart requirements
  const getAllPortfolioStocks = () => sharedPortfolio.stocks;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {sharedPortfolio.name}
          </h1>
          {sharedPortfolio.description && (
            <p className="text-gray-600 mt-2">{sharedPortfolio.description}</p>
          )}
        </div>
        <div className="text-right">
          <Badge variant="secondary" className="mb-2">
            <Share2 className="mr-1 h-3 w-3" />
            Shared Portfolio
          </Badge>
          <div className="text-sm text-gray-500">
            <Calendar className="inline mr-1 h-3 w-3" />
            Expires: {expiryDate}
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${sharedPortfolio.totalValue.toLocaleString()}
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
            <div className={`text-2xl font-bold flex items-center ${
              sharedPortfolio.totalGain >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {sharedPortfolio.totalGain >= 0 ? (
                <TrendingUp className="mr-2 h-5 w-5" />
              ) : (
                <TrendingDown className="mr-2 h-5 w-5" />
              )}
              {sharedPortfolio.totalGain >= 0 ? '+' : ''}
              ${sharedPortfolio.totalGain.toLocaleString()}
            </div>
            <div className={`text-sm ${
              sharedPortfolio.totalGain >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ({sharedPortfolio.totalGainPercent >= 0 ? '+' : ''}
              {sharedPortfolio.totalGainPercent.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sub-Portfolios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {sharedPortfolio.subPortfolios.length}
            </div>
            <div className="text-sm text-gray-500">
              Portfolio segments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Allocation Chart */}
      {sharedPortfolio.subPortfolios.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioAllocationChart
              subPortfolios={sharedPortfolio.subPortfolios}
              getAllPortfolioStocks={getAllPortfolioStocks}
            />
          </CardContent>
        </Card>
      )}

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings ({sharedPortfolio.stocks.length} stocks)</CardTitle>
        </CardHeader>
        <CardContent>
          {sharedPortfolio.stocks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No stocks in this portfolio</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Symbol</th>
                    <th className="text-left py-2">Name</th>
                    <th className="text-right py-2">Shares</th>
                    <th className="text-right py-2">Cost Price</th>
                    <th className="text-right py-2">Current Price</th>
                    <th className="text-right py-2">Market Value</th>
                    <th className="text-right py-2">Gain/Loss</th>
                    <th className="text-right py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {sharedPortfolio.stocks.map((stock) => {
                    const marketValue = stock.currentPrice * stock.shares;
                    const costValue = stock.costPrice * stock.shares;
                    const gain = marketValue - costValue;
                    const gainPercent = costValue > 0 ? (gain / costValue) * 100 : 0;

                    return (
                      <tr key={stock.id} className="border-b">
                        <td className="py-2 font-medium">{stock.symbol}</td>
                        <td className="py-2 text-gray-600">{stock.name}</td>
                        <td className="py-2 text-right">{stock.shares}</td>
                        <td className="py-2 text-right">${stock.costPrice.toFixed(2)}</td>
                        <td className="py-2 text-right">${stock.currentPrice.toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">
                          ${marketValue.toLocaleString()}
                        </td>
                        <td className={`py-2 text-right ${
                          gain >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {gain >= 0 ? '+' : ''}${gain.toLocaleString()}
                        </td>
                        <td className={`py-2 text-right ${
                          gain >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Shared on {new Date(sharedPortfolio.createdAt).toLocaleDateString()}</p>
        <p className="mt-1">Real-time data may vary from snapshot</p>
      </div>
    </div>
  );
}