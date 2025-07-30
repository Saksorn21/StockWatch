import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stock, RebalanceResult } from "../../types/stock";

interface RebalanceFormProps {
  stocks: Stock[];
  onCalculate: (results: RebalanceResult[]) => void;
}

export function RebalanceForm({ stocks, onCalculate }: RebalanceFormProps) {
  const [buyPrices, setBuyPrices] = useState<Record<string, number>>({});

  const handlePriceChange = (stockId: string, price: number) => {
    setBuyPrices(prev => ({ ...prev, [stockId]: price }));
  };

  const calculateRebalance = () => {
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.currentPrice * stock.shares), 0);
    
    const results: RebalanceResult[] = stocks.map(stock => {
      const buyPrice = buyPrices[stock.id] || stock.currentPrice;
      const targetValue = (stock.targetAllocation / 100) * totalValue;
      const currentValue = stock.currentPrice * stock.shares;
      const valueDifference = targetValue - currentValue;
      const shareChange = valueDifference / buyPrice;
      const newShares = stock.shares + shareChange;
      
      // Calculate blended average cost
      let avgCost = stock.costPrice;
      if (shareChange > 0) {
        // Buying shares
        const totalCost = (stock.costPrice * stock.shares) + (buyPrice * shareChange);
        avgCost = totalCost / newShares;
      }
      
      return {
        symbol: stock.symbol,
        name: stock.name,
        shareChange: parseFloat(shareChange.toFixed(2)),
        newShares: parseFloat(newShares.toFixed(2)),
        avgCost: parseFloat(avgCost.toFixed(2)),
        newAllocation: stock.targetAllocation,
      };
    });

    onCalculate(results);
  };

  if (stocks.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Holdings</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No stocks in your portfolio to rebalance.</p>
            <p className="text-gray-400 text-sm mt-1">Add stocks to your portfolio first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Holdings</h3>
        
        <div className="space-y-4">
          {stocks.map((stock) => (
            <div key={stock.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Stock</Label>
                  <div className="text-sm">
                    <span className="font-medium">{stock.symbol}</span>
                    <span className="text-gray-600 block">{stock.name}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Current Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={stock.currentPrice.toFixed(2)}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Current Shares</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={stock.shares}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Current %</Label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                    {(stock.currentAllocation || 0).toFixed(1)}%
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Target %</Label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                    {stock.targetAllocation}%
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">Buy Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={stock.currentPrice.toFixed(2)}
                    onChange={(e) => handlePriceChange(stock.id, parseFloat(e.target.value) || stock.currentPrice)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={calculateRebalance}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3"
          >
            Calculate Rebalance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
