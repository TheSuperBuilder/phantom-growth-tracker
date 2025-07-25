import { useState } from "react";
import { CompanyCard } from "@/components/dashboard/CompanyCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyTable } from "@/components/companies/CompanyTable";
import { useAntiPortfolioCompanies, useDeleteAntiPortfolioCompany, useUniquePersonNames } from "@/hooks/useCompanies";
import { useProfiles } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";

export default function AntiPortfolio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("growth");
  const [viewMode, setViewMode] = useState<"overall" | "personal">("overall");
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: companies = [], isLoading } = useAntiPortfolioCompanies();
  const { data: profiles = [] } = useProfiles();
  const { data: personNames = [] } = useUniquePersonNames();
  const deleteCompany = useDeleteAntiPortfolioCompany();

  const handleDelete = async (companyName: string) => {
    try {
      await deleteCompany.mutateAsync(companyName);
      toast({
        title: 'Success',
        description: 'Company deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete company',
        variant: 'destructive',
      });
    }
  };

  // Filter companies based on view mode
  const filteredCompaniesByView = viewMode === "personal" && selectedPerson
    ? companies.filter(company => company.person_name === selectedPerson)
    : companies;

  // Transform data for legacy components
  const mockCompanies = filteredCompaniesByView.map((company, index) => ({
    id: `${company.company_name}-${index}`,
    name: company.company_name,
    sector: company.industry || "Unknown",
    lastValuation: company.past_value || 0,
    currentValuation: company.current_value || 0,
    dateConsidered: company.decision_date || "",
    reason: company.reason_not_investing || "",
    vcLead: company.person_name || "N/A"
  }));

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.vcLead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === "growth") {
      const aGrowth = a.lastValuation > 0 ? ((a.currentValuation - a.lastValuation) / a.lastValuation) * 100 : 0;
      const bGrowth = b.lastValuation > 0 ? ((b.currentValuation - b.lastValuation) / b.lastValuation) * 100 : 0;
      return bGrowth - aGrowth;
    }
    if (sortBy === "valuation") {
      return b.currentValuation - a.currentValuation;
    }
    return a.name.localeCompare(b.name);
  });

  // Calculate stats for the current view
  const currentCompanies = viewMode === "personal" && selectedPerson
    ? companies.filter(company => company.person_name === selectedPerson)
    : companies;
    
  const totalMissedValue = currentCompanies.reduce((sum, company) => {
    const missedValue = (company.current_value || 0) - (company.past_value || 0);
    return sum + Math.max(0, missedValue); // Only count positive differences as missed value
  }, 0);
  const totalCompanies = currentCompanies.length;
  const avgGrowth = currentCompanies.length > 0 ? currentCompanies.reduce((sum, company) => {
    if (!company.past_value || company.past_value === 0) return sum;
    return sum + (((company.current_value || 0) - company.past_value) / company.past_value) * 100;
  }, 0) / currentCompanies.length : 0;
  const biggestMiss = currentCompanies.reduce((biggest, company) => {
    const missedValue = (company.current_value || 0) - (company.past_value || 0);
    return missedValue > biggest.value 
      ? { name: company.company_name, value: missedValue }
      : biggest;
  }, { name: "", value: 0 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading anti-portfolio companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anti-Portfolio Tracker</h1>
          <p className="text-muted-foreground">
            Companies we considered but didn't invest in - track the ones that got away
          </p>
        </div>

        {/* View Mode Selection */}
        <Tabs defaultValue="overall" onValueChange={(value) => setViewMode(value as "overall" | "personal")}>
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-6">
            <StatsOverview
              totalMissedValue={totalMissedValue}
              totalCompanies={totalCompanies}
              avgGrowth={avgGrowth}
              biggestMiss={biggestMiss}
            />
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
              
              {selectedPerson && (
                <StatsOverview
                  totalMissedValue={totalMissedValue}
                  totalCompanies={totalCompanies}
                  avgGrowth={avgGrowth}
                  biggestMiss={biggestMiss}
                />
              )}
              
              {!selectedPerson && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Please select a person to view their personal anti-portfolio.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search companies, sectors, or VCs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2">
              <Button
                variant={sortBy === "growth" ? "default" : "outline"}
                onClick={() => setSortBy("growth")}
                size="sm"
              >
                Sort by Growth
              </Button>
              <Button
                variant={sortBy === "valuation" ? "default" : "outline"}
                onClick={() => setSortBy("valuation")}
                size="sm"
              >
                Sort by Valuation
              </Button>
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                onClick={() => setSortBy("name")}
                size="sm"
              >
                Sort by Name
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {viewMode === "personal" 
                  ? selectedPerson 
                    ? `No anti-portfolio companies found for ${selectedPerson}.`
                    : 'Please select a person to view their anti-portfolio.'
                  : currentCompanies.length === 0 
                    ? 'No anti-portfolio companies yet. Add some using the tabs above.'
                    : 'No companies found matching your search.'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="table">
          <CompanyTable 
            companies={currentCompanies} 
            type="anti-portfolio"
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}