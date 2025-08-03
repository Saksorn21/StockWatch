
import { Card, CardContent } from "@/components/ui/card";
import { Stock } from "../../types/stock";

interface AllHoldingsListProps {
  allStocks: Stock[];
}

export function AllHoldingsList({ allStocks }: AllHoldingsListProps) {
  if (allStocks.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Holdings</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No stocks in any portfolio yet.</p>
            <p className="text-gray-400 text-sm mt-1">Create a portfolio and add stocks to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total portfolio value across all stocks
  const totalValue = allStocks.reduce((sum, stock) => sum + (stock.currentPrice * stock.shares), 0);

  // Calculate current allocations and sort by percentage (descending)
  const stocksWithAllocations = allStocks
    .map(stock => {
      const currentValue = stock.currentPrice * stock.shares;
      const currentAllocation = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
      const costValue = stock.costPrice * stock.shares;
      const profitLoss = currentValue - costValue;
      
      return {
        ...stock,
        currentAllocation,
        currentValue,
        profitLoss,
      };
    })
    .sort((a, b) => b.currentAllocation - a.currentAllocation);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Holdings ({allStocks.length} stocks)
        </h3>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {stocksWithAllocations.map((stock) => (
            <div
              key={stock.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{stock.symbol}</h4>
                    <span className="text-sm text-gray-600">{stock.name}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {stock.currentAllocation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Shares:</span>
                      <span className="font-medium ml-1">{stock.shares}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium ml-1">${stock.currentPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium ml-1">${stock.currentValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">P&L:</span>
                      <span
                        className={`font-medium ml-1 ${
                          stock.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stock.profitLoss >= 0 ? "+" : ""}${Math.abs(stock.profitLoss).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Total Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-900">Total Portfolio Value:</span>
            <span className="font-bold text-lg">${totalValue.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
