import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  BarChart3 as Compare
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PortfolioComparison } from "../types/stock";

export default function ComparePortfoliosPage() {
  const [shareIds, setShareIds] = useState<string[]>([]);
  const [newShareId, setNewShareId] = useState("");
  const [comparison, setComparison] = useState<PortfolioComparison | null>(null);
  const { toast } = useToast();

  const { data: sharedPortfolios, isLoading: isLoadingShared } = useQuery({
    queryKey: ["/api/portfolio/shared"],
  });

  const compareMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/portfolio/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shareIds: ids }),
      });

      if (!response.ok) {
        throw new Error("Failed to compare portfolios");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      setComparison(data);
      toast({
        title: "Comparison Complete",
        description: "Portfolio comparison has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to compare portfolios. Please check the share IDs.",
        variant: "destructive",
      });
    },
  });

  const addShareId = () => {
    if (newShareId.trim() && !shareIds.includes(newShareId.trim())) {
      setShareIds([...shareIds, newShareId.trim()]);
      setNewShareId("");
    }
  };

  const removeShareId = (id: string) => {
    setShareIds(shareIds.filter(shareId => shareId !== id));
  };

  const handleCompare = () => {
    if (shareIds.length < 2) {
      toast({
        title: "Insufficient Portfolios",
        description: "Please add at least 2 portfolio share IDs to compare.",
        variant: "destructive",
      });
      return;
    }
    compareMutation.mutate(shareIds);
  };

  const addExistingPortfolio = (shareId: string) => {
    if (!shareIds.includes(shareId)) {
      setShareIds([...shareIds, shareId]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Compare Portfolios</h1>
        <p className="text-gray-600 mt-2">
          Compare performance and allocation across multiple shared portfolios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Compare className="mr-2 h-5 w-5" />
                Setup Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Share ID */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Add Portfolio Share ID
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter share ID (e.g., AbC123Xy)"
                    value={newShareId}
                    onChange={(e) => setNewShareId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addShareId()}
                  />
                  <Button onClick={addShareId} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Existing Shared Portfolios */}
              {sharedPortfolios && sharedPortfolios.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Available Shared Portfolios
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {sharedPortfolios.map((portfolio: any) => (
                      <div key={portfolio.shareId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{portfolio.name}</p>
                          <p className="text-xs text-gray-500">{portfolio.shareId}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addExistingPortfolio(portfolio.shareId)}
                          disabled={shareIds.includes(portfolio.shareId)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Portfolios */}
              {shareIds.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Selected Portfolios ({shareIds.length})
                  </label>
                  <div className="space-y-2">
                    {shareIds.map((id) => (
                      <div key={id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-mono">{id}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeShareId(id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compare Button */}
              <Button 
                onClick={handleCompare}
                disabled={shareIds.length < 2 || compareMutation.isPending}
                className="w-full"
              >
                {compareMutation.isPending ? "Comparing..." : "Compare Portfolios"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {comparison ? (
            <div className="space-y-6">
              {/* Total Value Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comparison.comparisonMetrics.totalValueComparison.map((portfolio) => (
                      <div key={portfolio.portfolioId} className="p-4 border rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {portfolio.portfolioName}
                        </h3>
                        <div className="text-2xl font-bold text-gray-900">
                          ${portfolio.totalValue.toLocaleString()}
                        </div>
                        <div className={`text-sm flex items-center ${
                          portfolio.totalGain >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {portfolio.totalGain >= 0 ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {portfolio.totalGain >= 0 ? '+' : ''}
                          ${portfolio.totalGain.toLocaleString()} 
                          ({portfolio.totalGainPercent >= 0 ? '+' : ''}
                          {portfolio.totalGainPercent.toFixed(2)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Allocation Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Stock Allocation Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Stock</th>
                          {comparison.portfolios.map((portfolio) => (
                            <th key={portfolio.id} className="text-right py-2">
                              {portfolio.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.comparisonMetrics.allocationComparison.map((stock) => (
                          <tr key={stock.symbol} className="border-b">
                            <td className="py-2">
                              <div>
                                <div className="font-medium">{stock.symbol}</div>
                                <div className="text-gray-500 text-xs">{stock.name}</div>
                              </div>
                            </td>
                            {comparison.portfolios.map((portfolio) => {
                              const allocation = stock.portfolios.find(
                                p => p.portfolioId === portfolio.id
                              );
                              return (
                                <td key={portfolio.id} className="py-2 text-right">
                                  {allocation ? (
                                    <div>
                                      <div className="font-medium">
                                        {allocation.allocation.toFixed(1)}%
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ${allocation.value.toLocaleString()}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Top & Bottom Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {comparison.comparisonMetrics.performanceComparison.map((portfolio) => (
                      <div key={portfolio.portfolioId} className="space-y-4">
                        <h3 className="font-medium text-gray-900">{portfolio.portfolioName}</h3>
                        
                        {/* Top Performers */}
                        <div>
                          <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Top Performers
                          </h4>
                          <div className="space-y-1">
                            {portfolio.topPerformers.slice(0, 3).map((stock) => (
                              <div key={stock.symbol} className="flex justify-between items-center text-sm">
                                <span>{stock.symbol}</span>
                                <Badge variant="secondary" className="text-green-600">
                                  +{stock.gainPercent.toFixed(1)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Performers */}
                        <div>
                          <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                            <TrendingDown className="mr-1 h-3 w-3" />
                            Bottom Performers
                          </h4>
                          <div className="space-y-1">
                            {portfolio.bottomPerformers.slice(0, 3).map((stock) => (
                              <div key={stock.symbol} className="flex justify-between items-center text-sm">
                                <span>{stock.symbol}</span>
                                <Badge variant="secondary" className="text-red-600">
                                  {stock.gainPercent.toFixed(1)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-gray-500">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                  <p>Select at least 2 portfolios to compare their performance and allocation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}