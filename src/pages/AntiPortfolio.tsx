import { useState } from "react";
import { CompanyCard } from "@/components/dashboard/CompanyCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyForm } from "@/components/companies/CompanyForm";
import { CompanyTable } from "@/components/companies/CompanyTable";
import { CSVImport } from "@/components/companies/CSVImport";
import { DataSyncControls } from "@/components/companies/DataSyncControls";
import { useAntiPortfolioCompanies, useDeleteAntiPortfolioCompany, useCreateAntiPortfolioCompany } from "@/hooks/useCompanies";
import { useProfiles } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";

export default function AntiPortfolio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("growth");
  const { toast } = useToast();
  
  const { data: companies = [], isLoading } = useAntiPortfolioCompanies();
  const { data: profiles = [] } = useProfiles();
  const deleteCompany = useDeleteAntiPortfolioCompany();
  const createCompany = useCreateAntiPortfolioCompany();

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

  const handleCSVImport = async (csvData: any[]) => {
    for (const row of csvData) {
      await createCompany.mutateAsync({
        company_name: row.company_name,
        current_value: row.current_value ? Number(row.current_value) : undefined,
        past_value: row.past_value ? Number(row.past_value) : undefined,
        decision_date: row.decision_date || undefined,
        reason_not_investing: row.reason_not_investing || undefined,
        industry: row.industry || undefined,
        notes: row.notes || undefined,
      });
    }
  };

  // Transform data for legacy components
  const mockCompanies = companies.map((company, index) => ({
    id: `${company.company_name}-${index}`,
    name: company.company_name,
    sector: company.industry || "Unknown",
    lastValuation: company.past_value || 0,
    currentValuation: company.current_value || 0,
    dateConsidered: company.decision_date || "",
    reason: company.reason_not_investing || "",
    vcLead: "N/A"
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

  // Calculate stats
  const totalMissedValue = companies.reduce((sum, company) => sum + (company.current_value || 0), 0);
  const totalCompanies = companies.length;
  const avgGrowth = companies.length > 0 ? companies.reduce((sum, company) => {
    if (!company.past_value || company.past_value === 0) return sum;
    return sum + (((company.current_value || 0) - company.past_value) / company.past_value) * 100;
  }, 0) / companies.length : 0;
  const biggestMiss = companies.reduce((biggest, company) => {
    return (company.current_value || 0) > biggest.value 
      ? { name: company.company_name, value: company.current_value || 0 }
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

        <StatsOverview
          totalMissedValue={totalMissedValue}
          totalCompanies={totalCompanies}
          avgGrowth={avgGrowth}
          biggestMiss={biggestMiss}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="add">Add Company</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
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
                {companies.length === 0 
                  ? 'No anti-portfolio companies yet. Add some using the tabs above.'
                  : 'No companies found matching your search.'
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="table">
          <CompanyTable 
            companies={companies} 
            type="anti-portfolio"
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="add">
          <CompanyForm type="anti-portfolio" />
        </TabsContent>

        <TabsContent value="import">
          <CSVImport type="anti-portfolio" onImport={handleCSVImport} />
        </TabsContent>

        <TabsContent value="sync">
          <DataSyncControls 
            type="anti-portfolio" 
            companies={companies.map((company, index) => ({
              id: `${company.company_name}-${index}`,
              company_name: company.company_name,
              current_value: company.current_value
            }))} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}