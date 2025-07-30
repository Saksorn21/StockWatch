import { useState } from "react";
import { usePortfolio } from "../contexts/portfolio-context";
import { RebalanceForm } from "../components/rebalance/rebalance-form";
import { RebalanceResults } from "../components/rebalance/rebalance-results";
import { RebalanceResult } from "../types/stock";
import { useToast } from "@/hooks/use-toast";

export default function Rebalance() {
  const { stocks, updateStock } = usePortfolio();
  const [rebalanceResults, setRebalanceResults] = useState<RebalanceResult[]>([]);
  const { toast } = useToast();

  const handleCalculate = (results: RebalanceResult[]) => {
    setRebalanceResults(results);
  };

  const handleConfirm = () => {
    // Update portfolio with rebalanced data
    rebalanceResults.forEach((result) => {
      const stock = stocks.find(s => s.symbol === result.symbol);
      if (stock) {
        updateStock(stock.id, {
          shares: result.newShares,
          costPrice: result.avgCost,
        });
      }
    });

    setRebalanceResults([]);
    toast({
      title: "Portfolio Rebalanced",
      description: "Your portfolio has been updated with the new allocations.",
    });
  };

  const handleCancel = () => {
    setRebalanceResults([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Rebalance Calculator</h2>
        <p className="text-gray-600 mt-1">
          Calculate buy/sell orders to rebalance your portfolio to target allocations
        </p>
      </div>

      {/* Rebalance Form */}
      <RebalanceForm stocks={stocks} onCalculate={handleCalculate} />

      {/* Rebalance Results */}
      {rebalanceResults.length > 0 && (
        <RebalanceResults
          results={rebalanceResults}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
