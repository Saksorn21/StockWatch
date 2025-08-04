import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubPortfolio, Stock } from "../../types/stock";

interface PortfolioAllocationChartProps {
  subPortfolios: SubPortfolio[];
  getAllPortfolioStocks: () => Stock[];
}

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Orange
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export function PortfolioAllocationChart({ subPortfolios, getAllPortfolioStocks }: PortfolioAllocationChartProps) {
  const allStocks = getAllPortfolioStocks();
  
  // Calculate actual values for each sub-portfolio
  const portfolioData = subPortfolios.map((portfolio, index) => {
    const portfolioStocks = allStocks.filter(stock => stock.portfolioId === portfolio.id);
    const actualValue = portfolioStocks.reduce((sum, stock) => sum + (stock.currentPrice * stock.shares), 0);
    const costValue = portfolioStocks.reduce((sum, stock) => sum + (stock.costPrice * stock.shares), 0);
    const gain = actualValue - costValue;
    const gainPercent = costValue > 0 ? (gain / costValue) * 100 : 0;
    
    return {
      name: portfolio.name,
      targetAllocation: portfolio.targetAllocation,
      actualValue,
      costValue,
      gain,
      gainPercent,
      color: COLORS[index % COLORS.length],
      id: portfolio.id,
    };
  });

  const totalValue = portfolioData.reduce((sum, p) => sum + p.actualValue, 0);
  const totalCost = portfolioData.reduce((sum, p) => sum + p.costValue, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const totalAllocated = subPortfolios.reduce((sum, p) => sum + p.targetAllocation, 0);
  const isBalanced = Math.abs(totalAllocated - 100) < 0.01;

  // Create chart data based on actual values, not target allocations
  const data = portfolioData.map(portfolio => ({
    name: portfolio.name,
    value: totalValue > 0 ? (portfolio.actualValue / totalValue) * 100 : portfolio.targetAllocation,
    actualValue: portfolio.actualValue,
    targetAllocation: portfolio.targetAllocation,
    gain: portfolio.gain,
    gainPercent: portfolio.gainPercent,
    color: portfolio.color,
    id: portfolio.id,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Current: {data.value.toFixed(1)}% (${data.actualValue.toLocaleString()})
          </p>
          <p className="text-sm text-gray-600">
            Target: {data.targetAllocation}%
          </p>
          {data.gain !== 0 && (
            <p className={`text-sm ${data.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.gain >= 0 ? '+' : ''}${data.gain.toLocaleString()} ({data.gainPercent.toFixed(1)}%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (subPortfolios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No sub-portfolios created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Portfolio Allocation
          <span className={`text-sm ${isBalanced ? 'text-green-600' : 'text-orange-600'}`}>
            {totalAllocated.toFixed(1)}% / 100%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="relative h-64 w-full ">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center value display */}
          <div className="absolute inset-0 flex items-center justify- pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString()}
              </div>
              <div className={`text-sm ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGain >= 0 ? '+' : ''}${totalGain.toLocaleString()}
              </div>
              <div className={`text-xs ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          {data.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-900">
                  {entry.value.toFixed(1)}% • ${entry.actualValue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Target: {entry.targetAllocation}%
                  {entry.gain !== 0 && (
                    <span className={`ml-2 ${entry.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.gain >= 0 ? '+' : ''}${entry.gain.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isBalanced && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              Portfolio allocation doesn't equal 100%. Consider adjusting your target allocations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}