import { useState } from "react";
import { CompanyCard } from "@/components/dashboard/CompanyCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for personal dashboard - filtered for current user
const personalCompanies = [
  {
    id: "1",
    name: "TechUnicorn",
    sector: "AI/ML",
    lastValuation: 50000000,
    currentValuation: 1200000000,
    dateConsidered: "2021-03-15",
    reason: "Too early stage, concerns about market size",
    vcLead: "Sarah Chen"
  },
  {
    id: "5",
    name: "CloudScale",
    sector: "Enterprise SaaS",
    lastValuation: 200000000,
    currentValuation: 1500000000,
    dateConsidered: "2020-09-05",
    reason: "Market too crowded, difficult differentiation",
    vcLead: "Sarah Chen"
  }
];

export default function PersonalDashboard() {
  const currentUser = "Sarah Chen"; // This would come from auth context

  // Calculate personal stats
  const totalPersonalMissedValue = personalCompanies.reduce((sum, company) => sum + company.currentValuation, 0);
  const totalPersonalCompanies = personalCompanies.length;
  const avgPersonalGrowth = personalCompanies.reduce((sum, company) => {
    return sum + ((company.currentValuation - company.lastValuation) / company.lastValuation) * 100;
  }, 0) / personalCompanies.length;
  const biggestPersonalMiss = personalCompanies.reduce((biggest, company) => {
    return company.currentValuation > biggest.value 
      ? { name: company.name, value: company.currentValuation }
      : biggest;
  }, { name: "", value: 0 });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Anti-Portfolio</h1>
          <p className="text-muted-foreground">
            Your personal track record - companies you evaluated but didn't invest in
          </p>
          <Badge variant="outline" className="mt-2">
            👤 {currentUser}
          </Badge>
        </div>

        <StatsOverview
          totalMissedValue={totalPersonalMissedValue}
          totalCompanies={totalPersonalCompanies}
          avgGrowth={avgPersonalGrowth}
          biggestMiss={biggestPersonalMiss}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Personal Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold font-mono text-chart-positive">
                  {avgPersonalGrowth > 0 ? "+" : ""}{avgPersonalGrowth.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Avg Growth Rate</p>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold font-mono">
                  {totalPersonalCompanies}
                </div>
                <p className="text-sm text-muted-foreground">Companies Evaluated</p>
              </div>
              <div className="text-center p-4 bg-accent/20 rounded-lg">
                <div className="text-2xl font-bold font-mono text-chart-negative">
                  {formatCurrency(totalPersonalMissedValue)}
                </div>
                <p className="text-sm text-muted-foreground">Total Missed Value</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-4">
              <h4 className="font-semibold mb-2">Key Insights</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Your biggest miss was {biggestPersonalMiss.name} at {formatCurrency(biggestPersonalMiss.value)}</li>
                <li>• Average time between consideration and current valuation: 2.8 years</li>
                <li>• Most common rejection reason: Market timing concerns</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Evaluated Companies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personalCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>

      {personalCompanies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No companies found in your personal anti-portfolio.</p>
        </div>
      )}
    </div>
  );
}