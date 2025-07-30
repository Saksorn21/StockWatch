import { useState } from "react";
import { StockSearch } from "../components/dashboard/stock-search";
import { MarketIndices } from "../components/dashboard/market-indices";
import { StockChart } from "../components/dashboard/stock-chart";

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleStockSearch = async (symbol: string) => {
    setIsSearching(true);
    setSelectedStock(symbol);
    setIsSearching(false);
  };

  return (
    <div className="space-y-8">
      <StockSearch onSearch={handleStockSearch} isLoading={isSearching} />
      <MarketIndices />
      <StockChart symbol={selectedStock} />
    </div>
  );
}
