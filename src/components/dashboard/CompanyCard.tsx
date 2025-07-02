import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Company {
  id: string;
  name: string;
  sector: string;
  lastValuation: number;
  currentValuation: number;
  dateConsidered: string;
  reason: string;
  vcLead: string;
}

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const growthPercentage = ((company.currentValuation - company.lastValuation) / company.lastValuation) * 100;
  const isPositive = growthPercentage > 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{company.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{company.sector}</p>
          </div>
          <Badge variant={isPositive ? "default" : "destructive"} className="font-mono">
            {isPositive ? "+" : ""}{growthPercentage.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Last Known</p>
            <p className="font-mono text-sm font-medium">{formatCurrency(company.lastValuation)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Est.</p>
            <p className={`font-mono text-sm font-medium ${isPositive ? "text-chart-positive" : "text-chart-negative"}`}>
              {formatCurrency(company.currentValuation)}
            </p>
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Considered: {company.dateConsidered}</span>
            <span className="text-muted-foreground">Lead: {company.vcLead}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate" title={company.reason}>
            Reason: {company.reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}