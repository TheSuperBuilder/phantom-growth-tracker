import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsOverviewProps {
  totalMissedValue: number;
  totalCompanies: number;
  avgGrowth: number;
  biggestMiss: { name: string; value: number };
}

export function StatsOverview({ totalMissedValue, totalCompanies, avgGrowth, biggestMiss }: StatsOverviewProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Missed Value</CardTitle>
          <span className="text-2xl">💸</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-chart-negative">
            {formatCurrency(totalMissedValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Anti-portfolio valuation
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Companies Tracked</CardTitle>
          <span className="text-2xl">🏢</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">
            {totalCompanies}
          </div>
          <p className="text-xs text-muted-foreground">
            Total missed opportunities
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Growth</CardTitle>
          <span className="text-2xl">📈</span>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold font-mono ${avgGrowth > 0 ? "text-chart-positive" : "text-chart-negative"}`}>
            {avgGrowth > 0 ? "+" : ""}{avgGrowth.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Since consideration
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Biggest Miss</CardTitle>
          <span className="text-2xl">🎯</span>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold font-mono text-chart-negative">
            {formatCurrency(biggestMiss.value)}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {biggestMiss.name}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}