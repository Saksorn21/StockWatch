import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Stock } from "../../types/stock";

interface AllocationChartProps {
  stocks: Stock[];
}

const COLORS = [
  "hsl(207, 90%, 54%)",
  "hsl(142, 71%, 45%)",
  "hsl(24, 100%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(271, 81%, 56%)",
  "hsl(32, 95%, 44%)",
  "hsl(221, 83%, 53%)",
  "hsl(119, 41%, 51%)",
];

export function AllocationChart({ stocks }: AllocationChartProps) {
  const chartData = stocks
    .filter(stock => stock.currentAllocation && stock.currentAllocation > 0)
    .map((stock, index) => ({
      name: stock.symbol,
      value: stock.currentAllocation || 0,
      color: COLORS[index % COLORS.length],
    }));

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500">No stocks in portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
