import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PortfolioComparison() {
  // Mock data for comparison
  const actualPortfolioValue = 2800000000; // $2.8B
  const antiPortfolioValue = 3950000000;   // $3.95B
  const actualPortfolioCompanies = 12;
  const antiPortfolioCompanies = 5;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const missedValuePercentage = ((antiPortfolioValue - actualPortfolioValue) / actualPortfolioValue) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Comparison</h1>
          <p className="text-muted-foreground">
            Compare the performance of your actual portfolio vs anti-portfolio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actual Portfolio */}
          <Card className="border-chart-positive/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  💼 Actual Portfolio
                </span>
                <Badge variant="outline" className="text-chart-positive border-chart-positive">
                  INVESTED
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold font-mono text-chart-positive">
                  {formatCurrency(actualPortfolioValue)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Portfolio Value
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono">{actualPortfolioCompanies}</div>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-chart-positive">
                    {formatCurrency(actualPortfolioValue / actualPortfolioCompanies)}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Value</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Top Performers</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>DataFlow AI</span>
                    <span className="font-mono text-chart-positive">$850M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SecureNet</span>
                    <span className="font-mono text-chart-positive">$620M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>QuantumSoft</span>
                    <span className="font-mono text-chart-positive">$480M</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anti-Portfolio */}
          <Card className="border-chart-negative/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  👻 Anti-Portfolio
                </span>
                <Badge variant="outline" className="text-chart-negative border-chart-negative">
                  MISSED
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold font-mono text-chart-negative">
                  {formatCurrency(antiPortfolioValue)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Missed Value
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono">{antiPortfolioCompanies}</div>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-chart-negative">
                    {formatCurrency(antiPortfolioValue / antiPortfolioCompanies)}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Value</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Biggest Misses</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>CloudScale</span>
                    <span className="font-mono text-chart-negative">$1.5B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TechUnicorn</span>
                    <span className="font-mono text-chart-negative">$1.2B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CryptoFlow</span>
                    <span className="font-mono text-chart-negative">$800M</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Summary */}
        <Card>
          <CardHeader>
            <CardTitle>⚖️ Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-chart-negative/10 rounded-lg border border-chart-negative/20">
                <div className="text-3xl font-bold font-mono text-chart-negative">
                  +{missedValuePercentage.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Anti-Portfolio Outperformance
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Your missed opportunities are worth {missedValuePercentage.toFixed(1)}% more than your actual portfolio
                </p>
              </div>

              <div className="text-center p-4 bg-accent/10 rounded-lg border border-border">
                <div className="text-3xl font-bold font-mono">
                  {(antiPortfolioValue / antiPortfolioCompanies / (actualPortfolioValue / actualPortfolioCompanies)).toFixed(1)}x
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average Value Multiple
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Anti-portfolio companies are on average {(antiPortfolioValue / antiPortfolioCompanies / (actualPortfolioValue / actualPortfolioCompanies)).toFixed(1)}x more valuable
                </p>
              </div>

              <div className="text-center p-4 bg-chart-accent/10 rounded-lg border border-chart-accent/20">
                <div className="text-3xl font-bold font-mono text-chart-accent">
                  {formatCurrency(antiPortfolioValue - actualPortfolioValue)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Opportunity Cost
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Total value difference between portfolios
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Key Insights</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Your anti-portfolio has outperformed your actual portfolio by {missedValuePercentage.toFixed(1)}%</li>
                <li>• The missed opportunities represent {formatCurrency(antiPortfolioValue - actualPortfolioValue)} in lost potential value</li>
                <li>• Consider analyzing rejection patterns to improve future investment decisions</li>
                <li>• Most missed opportunities were in AI/ML and Enterprise SaaS sectors</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}