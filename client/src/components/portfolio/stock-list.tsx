import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stock } from "../../types/stock";

interface StockListProps {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (id: string) => void;
}

export function StockList({ stocks, onEdit, onDelete }: StockListProps) {
  if (stocks.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No stocks in your portfolio yet.</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Stock" to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {stocks.map((stock) => (
            <div
              key={stock.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{stock.symbol}</h4>
                    <span className="text-sm text-gray-600">{stock.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Shares:</span>
                      <span className="font-medium ml-1">{stock.shares}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium ml-1">${stock.currentPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost:</span>
                      <span className="font-medium ml-1">${stock.costPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">P&L:</span>
                      <span
                        className={`font-medium ml-1 ${
                          (stock.profitLoss || 0) >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {(stock.profitLoss || 0) >= 0 ? "+" : ""}${Math.abs(stock.profitLoss || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-600">
                      Target: <span className="font-medium">{stock.targetAllocation}%</span>
                    </span>
                    <span className="text-gray-600">
                      Current: <span className="font-medium">{(stock.currentAllocation || 0).toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(stock)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(stock.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
