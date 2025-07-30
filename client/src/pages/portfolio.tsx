import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "../contexts/portfolio-context";
import { PortfolioOverview } from "../components/portfolio/portfolio-overview";
import { AllocationChart } from "../components/portfolio/allocation-chart";
import { StockList } from "../components/portfolio/stock-list";
import { AddStockModal } from "../components/portfolio/add-stock-modal";
import { useToast } from "@/hooks/use-toast";

export default function Portfolio() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { stocks, portfolioMetrics, isLoading, addStock, deleteStock } = usePortfolio();
  const { toast } = useToast();

  const handleAddStock = async (stockData: any) => {
    try {
      await addStock(stockData);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleDeleteStock = (id: string) => {
    deleteStock(id);
    toast({
      title: "Stock Removed",
      description: "Stock has been removed from your portfolio.",
    });
  };

  const handleEditStock = (stock: any) => {
    // TODO: Implement edit functionality
    console.log("Edit stock:", stock);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal Portfolio</h2>
          <p className="text-gray-600 mt-1">Track your investments and monitor performance</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </div>

      {/* Portfolio Overview */}
      <PortfolioOverview metrics={portfolioMetrics} isLoading={isLoading} />

      {/* Portfolio Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AllocationChart stocks={stocks} />
        <StockList stocks={stocks} onEdit={handleEditStock} onDelete={handleDeleteStock} />
      </div>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStock}
      />
    </div>
  );
}
