import { useState } from "react";
import { Plus, Share2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { usePortfolio } from "../contexts/portfolio-context";
import { PortfolioOverview } from "../components/portfolio/portfolio-overview";
import { AllocationChart } from "../components/portfolio/allocation-chart";
import { StockList } from "../components/portfolio/stock-list";
import { AllHoldingsList } from "../components/portfolio/all-holdings-list";
import { AddStockModal } from "../components/portfolio/add-stock-modal";
import { PortfolioSelector } from "../components/portfolio/portfolio-selector";
import { PortfolioAllocationChart } from "../components/portfolio/portfolio-allocation-chart";
import { SharePortfolioModal } from "../components/portfolio/share-portfolio-modal";
import { useToast } from "@/hooks/use-toast";

export default function Portfolio() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { 
    stocks, 
    subPortfolios, 
    currentPortfolioId, 
    portfolioMetrics, 
    isLoading, 
    addStock, 
    deleteStock,
    addSubPortfolio,
    deleteSubPortfolio,
    setCurrentPortfolio,
    getAllPortfolioStocks
  } = usePortfolio();
  const { toast } = useToast();

  const handleAddStock = async (stockData: any) => {
    try {
      if (!currentPortfolioId) {
        toast({
          title: "No Portfolio Selected",
          description: "Please select a sub-portfolio before adding stocks.",
          variant: "destructive",
        });
        return;
      }
      await addStock(stockData);
      toast({
        title: "Stock Added",
        description: `${stockData.symbol} has been added to your portfolio.`,
      });
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleCreatePortfolio = (portfolioData: any) => {
    const newPortfolio = addSubPortfolio(portfolioData);
    setCurrentPortfolio(newPortfolio.id);
    toast({
      title: "Portfolio Created",
      description: `"${portfolioData.name}" portfolio has been created.`,
    });
  };

  const handleDeletePortfolio = (id: string) => {
    deleteSubPortfolio(id);
    toast({
      title: "Portfolio Deleted",
      description: "Portfolio and all its stocks have been removed.",
    });
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
        <div className="flex space-x-2">
          <Link href="/compare">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare
            </Button>
          </Link>
          <Button
            onClick={() => setIsShareModalOpen(true)}
            variant="outline"
            disabled={subPortfolios.length === 0 || getAllPortfolioStocks().length === 0}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!currentPortfolioId}
            className="bg-primary hover:bg-primary-dark text-white disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Portfolio Selector */}
      <PortfolioSelector
        subPortfolios={subPortfolios}
        currentPortfolioId={currentPortfolioId}
        onSelectPortfolio={setCurrentPortfolio}
        onCreatePortfolio={handleCreatePortfolio}
        onDeletePortfolio={handleDeletePortfolio}
      />

      {/* Portfolio Allocation Overview */}
      {subPortfolios.length > 0 && (
        <PortfolioAllocationChart 
          subPortfolios={subPortfolios} 
          getAllPortfolioStocks={getAllPortfolioStocks}
        />
      )}

      {/* Show content only if portfolio is selected */}
      {currentPortfolioId ? (
        <>
          {/* Portfolio Overview */}
          <PortfolioOverview metrics={portfolioMetrics} isLoading={isLoading} />

          {/* Portfolio Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AllocationChart stocks={stocks} />
            <StockList stocks={stocks} onEdit={handleEditStock} onDelete={handleDeleteStock} />
          </div>

          {/* All Holdings View */}
          {subPortfolios.length > 1 && getAllPortfolioStocks().length > 0 && (
            <AllHoldingsList allStocks={getAllPortfolioStocks()} />
          )}
        </>
      ) : subPortfolios.length > 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Portfolio</h3>
          <p className="text-gray-600">Choose a sub-portfolio above to view your stocks and portfolio metrics.</p>
        </div>
      ) : null}

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddStock}
      />

      {/* Share Portfolio Modal */}
      <SharePortfolioModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        portfolioData={{
          subPortfolios,
          stocks: getAllPortfolioStocks(),
          totalValue: portfolioMetrics.totalValue,
          totalGain: portfolioMetrics.totalGain,
          totalGainPercent: portfolioMetrics.totalGainPercent,
        }}
      />
    </div>
  );
}
