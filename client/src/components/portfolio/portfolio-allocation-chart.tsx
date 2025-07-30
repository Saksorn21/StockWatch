import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubPortfolio } from "../../types/stock";

interface PortfolioAllocationChartProps {
  subPortfolios: SubPortfolio[];
  totalValue?: number;
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

export function PortfolioAllocationChart({ subPortfolios, totalValue = 0 }: PortfolioAllocationChartProps) {
  const data = subPortfolios.map((portfolio, index) => ({
    name: portfolio.name,
    value: portfolio.targetAllocation,
    color: COLORS[index % COLORS.length],
    id: portfolio.id,
  }));

  const totalAllocated = subPortfolios.reduce((sum, p) => sum + p.targetAllocation, 0);
  const isBalanced = Math.abs(totalAllocated - 100) < 0.01;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            Target: {data.value}%
          </p>
          {totalValue > 0 && (
            <p className="text-sm text-gray-600">
              Value: ${((data.value / 100) * totalValue).toLocaleString()}
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
        <div className="relative h-64 w-full">
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              {totalValue > 0 ? (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    ${totalValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalAllocated.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Allocated</div>
                </>
              )}
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
              <div className="text-sm text-gray-600">
                {entry.value}%
                {totalValue > 0 && (
                  <span className="ml-2 text-gray-500">
                    (${((entry.value / 100) * totalValue).toLocaleString()})
                  </span>
                )}
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