import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CompanyCard } from "@/components/dashboard/CompanyCard";
import { useAntiPortfolioCompanies, usePortfolioCompanies, useUniquePersonNames } from "@/hooks/useCompanies";
import { useProfiles } from "@/hooks/useProfiles";

export default function PortfolioComparison() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"overall" | "personal">("overall");
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [open, setOpen] = useState(false);
  
  // Real data from database
  const { data: antiPortfolioCompanies = [] } = useAntiPortfolioCompanies();
  const { data: portfolioCompanies = [] } = usePortfolioCompanies();
  const { data: profiles = [] } = useProfiles();
  const { data: personNames = [] } = useUniquePersonNames();
  
  // Filter companies based on view mode
  const filteredAntiPortfolioCompanies = viewMode === "personal" && selectedPerson
    ? antiPortfolioCompanies.filter(company => company.person_name === selectedPerson)
    : antiPortfolioCompanies;
    
  // Note: Portfolio companies don't have person_name, so we can't filter them by person yet
  // This would require adding person_name to portfolio_companies table
  const filteredPortfolioCompanies = portfolioCompanies;
  
  // Calculate real statistics from database
  const calculateOverallStats = () => {
    const totalMissedValue = filteredAntiPortfolioCompanies.reduce((sum, company) => {
      const missedValue = (company.current_value || 0) - (company.past_value || 0);
      return sum + Math.max(0, missedValue);
    }, 0);
    
    const totalPortfolioValue = filteredPortfolioCompanies.reduce((sum, company) => 
      sum + (company.current_value || 0), 0);
    
    const antiPortfolioCount = filteredAntiPortfolioCompanies.length;
    const portfolioCount = filteredPortfolioCompanies.length;
    
    return {
      actualPortfolioValue: totalPortfolioValue,
      antiPortfolioValue: totalMissedValue,
      actualPortfolioCompanies: portfolioCount,
      antiPortfolioCompanies: antiPortfolioCount,
    };
  };

  const overallStats = calculateOverallStats();

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const missedValuePercentage = overallStats.actualPortfolioValue > 0 
    ? ((overallStats.antiPortfolioValue - overallStats.actualPortfolioValue) / overallStats.actualPortfolioValue) * 100
    : 0;

  // Transform anti-portfolio data for legacy components
  const transformedAntiPortfolio = filteredAntiPortfolioCompanies.map((company, index) => ({
    id: `${company.company_name}-${index}`,
    name: company.company_name,
    sector: company.industry || "Unknown", 
    lastValuation: company.past_value || 0,
    currentValuation: company.current_value || 0,
    dateConsidered: company.decision_date || "",
    reason: company.reason_not_investing || "",
    vcLead: company.person_name || "N/A"
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Comparison</h1>
          <p className="text-muted-foreground">
            Compare the performance of your actual portfolio vs anti-portfolio
          </p>
        </div>

      <Tabs defaultValue="overall" onValueChange={(value) => setViewMode(value as "overall" | "personal")}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-6">

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
                  {formatCurrency(overallStats.actualPortfolioValue)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Portfolio Value
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono">{overallStats.actualPortfolioCompanies}</div>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-chart-positive">
                    {overallStats.actualPortfolioCompanies > 0 
                      ? formatCurrency(overallStats.actualPortfolioValue / overallStats.actualPortfolioCompanies)
                      : "$0"}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Value</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Top Performers</h4>
                <div className="space-y-1 text-sm">
                  {portfolioCompanies
                    .sort((a, b) => (b.current_value || 0) - (a.current_value || 0))
                    .slice(0, 3)
                    .map((company) => (
                      <div key={company.id} className="flex justify-between">
                        <span>{company.company_name}</span>
                        <span className="font-mono text-chart-positive">
                          {formatCurrency(company.current_value || 0)}
                        </span>
                      </div>
                    ))}
                  {portfolioCompanies.length === 0 && (
                    <p className="text-xs text-muted-foreground">No portfolio companies yet</p>
                  )}
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
                  {formatCurrency(overallStats.antiPortfolioValue)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Missed Value
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono">{overallStats.antiPortfolioCompanies}</div>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-chart-negative">
                    {overallStats.antiPortfolioCompanies > 0 
                      ? formatCurrency(overallStats.antiPortfolioValue / overallStats.antiPortfolioCompanies)
                      : "$0"}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Value</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Biggest Misses</h4>
                <div className="space-y-1 text-sm">
                  {filteredAntiPortfolioCompanies
                    .map(company => ({
                      ...company,
                      missedValue: Math.max(0, (company.current_value || 0) - (company.past_value || 0))
                    }))
                    .sort((a, b) => b.missedValue - a.missedValue)
                    .slice(0, 3)
                    .map((company) => (
                      <div key={company.company_name} className="flex justify-between">
                        <span>{company.company_name}</span>
                        <span className="font-mono text-chart-negative">
                          {formatCurrency(company.missedValue)}
                        </span>
                      </div>
                    ))}
                  {filteredAntiPortfolioCompanies.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {viewMode === "personal" && selectedPerson 
                        ? `No anti-portfolio companies for ${selectedPerson}`
                        : "No anti-portfolio companies yet"}
                    </p>
                  )}
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
                  {overallStats.actualPortfolioValue > 0 ? `+${missedValuePercentage.toFixed(1)}%` : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Anti-Portfolio Outperformance
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {overallStats.actualPortfolioValue > 0 
                    ? `Your missed opportunities are worth ${missedValuePercentage.toFixed(1)}% more than your actual portfolio`
                    : "Add portfolio companies to see comparison"}
                </p>
              </div>

              <div className="text-center p-4 bg-accent/10 rounded-lg border border-border">
                <div className="text-3xl font-bold font-mono">
                  {(overallStats.actualPortfolioCompanies > 0 && overallStats.antiPortfolioCompanies > 0)
                    ? (overallStats.antiPortfolioValue / overallStats.antiPortfolioCompanies / (overallStats.actualPortfolioValue / overallStats.actualPortfolioCompanies)).toFixed(1) + "x"
                    : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average Value Multiple
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {(overallStats.actualPortfolioCompanies > 0 && overallStats.antiPortfolioCompanies > 0)
                    ? `Anti-portfolio companies are on average ${(overallStats.antiPortfolioValue / overallStats.antiPortfolioCompanies / (overallStats.actualPortfolioValue / overallStats.actualPortfolioCompanies)).toFixed(1)}x more valuable`
                    : "Need both portfolio types for comparison"}
                </p>
              </div>

              <div className="text-center p-4 bg-chart-accent/10 rounded-lg border border-chart-accent/20">
                <div className="text-3xl font-bold font-mono text-chart-accent">
                  {formatCurrency(Math.abs(overallStats.antiPortfolioValue - overallStats.actualPortfolioValue))}
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
                <li>• {overallStats.actualPortfolioValue > 0 
                  ? `Your anti-portfolio has ${missedValuePercentage > 0 ? 'outperformed' : 'underperformed'} your actual portfolio by ${Math.abs(missedValuePercentage).toFixed(1)}%`
                  : 'Add portfolio companies to see performance comparison'}</li>
                <li>• The missed opportunities represent {formatCurrency(Math.abs(overallStats.antiPortfolioValue - overallStats.actualPortfolioValue))} in {overallStats.antiPortfolioValue > overallStats.actualPortfolioValue ? 'lost potential' : 'avoided loss'} value</li>
                <li>• Consider analyzing rejection patterns to improve future investment decisions</li>
                <li>• {filteredAntiPortfolioCompanies.length > 0 
                  ? `Most common industries in anti-portfolio: ${[...new Set(filteredAntiPortfolioCompanies.map(c => c.industry).filter(Boolean))].slice(0, 2).join(', ')}`
                  : 'Add anti-portfolio companies to see industry insights'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[280px] justify-between bg-background"
                  >
                    {selectedPerson || "Select a person..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0 bg-background border border-border shadow-md">
                  <Command>
                    <CommandInput placeholder="Search people..." />
                    <CommandList>
                      <CommandEmpty>No person found.</CommandEmpty>
                      <CommandGroup>
                        {personNames.map((person) => (
                          <CommandItem
                            key={person}
                            value={person}
                            onSelect={(currentValue) => {
                              setSelectedPerson(currentValue === selectedPerson ? "" : currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPerson === person ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {person}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedPerson && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPerson("")}
                  size="sm"
                >
                  Clear Selection
                </Button>
              )}
            </div>
            
            {selectedPerson ? (
              <>
                {/* Show same comparison layout but with filtered data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Portfolio - would need portfolio filtering by person */}
                  <Card className="border-chart-positive/20">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          💼 {selectedPerson}'s Portfolio
                        </span>
                        <Badge variant="outline" className="text-chart-positive border-chart-positive">
                          INVESTED
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold font-mono text-chart-positive">
                          {formatCurrency(overallStats.actualPortfolioValue)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Total Portfolio Value
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Note: Portfolio filtering by person not yet implemented
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personal Anti-Portfolio */}
                  <Card className="border-chart-negative/20">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          👻 {selectedPerson}'s Anti-Portfolio
                        </span>
                        <Badge variant="outline" className="text-chart-negative border-chart-negative">
                          MISSED
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold font-mono text-chart-negative">
                          {formatCurrency(overallStats.antiPortfolioValue)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Personal Missed Value
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div className="text-center">
                          <div className="text-2xl font-bold font-mono">{overallStats.antiPortfolioCompanies}</div>
                          <p className="text-xs text-muted-foreground">Companies</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold font-mono text-chart-negative">
                            {overallStats.antiPortfolioCompanies > 0 
                              ? formatCurrency(overallStats.antiPortfolioValue / overallStats.antiPortfolioCompanies)
                              : "$0"}
                          </div>
                          <p className="text-xs text-muted-foreground">Avg Value</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Please select a person to view their personal portfolio comparison.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}