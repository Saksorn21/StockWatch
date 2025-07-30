import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RebalanceResult } from "../../types/stock";

interface RebalanceResultsProps {
  results: RebalanceResult[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function RebalanceResults({ results, onConfirm, onCancel }: RebalanceResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rebalance Results</h3>
        
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.symbol} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div>
                  <span className="font-medium">{result.symbol}</span>
                  <span className="text-gray-600 block text-sm">{result.name}</span>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-gray-600 block">Shares to Buy/Sell</span>
                  <span
                    className={`font-medium ${
                      result.shareChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {result.shareChange >= 0 ? "+" : ""}{result.shareChange} shares
                  </span>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-gray-600 block">New Total Shares</span>
                  <span className="font-medium">{result.newShares}</span>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-gray-600 block">Blended Avg Cost</span>
                  <span className="font-medium">${result.avgCost}</span>
                </div>
                
                <div className="text-center">
                  <span className="text-sm text-gray-600 block">New Allocation</span>
                  <span className="font-medium">{result.newAllocation.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6 py-3"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3"
          >
            Confirm Rebalance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
