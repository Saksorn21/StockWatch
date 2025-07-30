import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  isLoading?: boolean;
}

export function StockSearch({ onSearch, isLoading }: StockSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim().toUpperCase());
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="stock-search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Stocks
            </Label>
            <div className="relative">
              <Input
                id="stock-search"
                type="text"
                placeholder="Enter ticker symbol or company name (e.g., AAPL, Apple)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
