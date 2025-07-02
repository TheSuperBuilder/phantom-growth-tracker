import { useState } from "react";
import { CompanyCard } from "@/components/dashboard/CompanyCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock data for demonstration
const mockCompanies = [
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
    id: "2", 
    name: "CryptoFlow",
    sector: "FinTech",
    lastValuation: 25000000,
    currentValuation: 800000000,
    dateConsidered: "2020-11-08",
    reason: "Regulatory concerns, unproven team",
    vcLead: "Mike Rodriguez"
  },
  {
    id: "3",
    name: "GreenTech Solutions",
    sector: "CleanTech",
    lastValuation: 75000000,
    currentValuation: 450000000,
    dateConsidered: "2021-07-22",
    reason: "Long development cycle, competitive market",
    vcLead: "Emily Watson"
  },
  {
    id: "4",
    name: "HealthAI",
    sector: "HealthTech",
    lastValuation: 100000000,
    currentValuation: 85000000,
    dateConsidered: "2022-01-10",
    reason: "FDA approval timeline too uncertain",
    vcLead: "David Kim"
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

export default function AntiPortfolio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("growth");

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.vcLead.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === "growth") {
      const aGrowth = ((a.currentValuation - a.lastValuation) / a.lastValuation) * 100;
      const bGrowth = ((b.currentValuation - b.lastValuation) / b.lastValuation) * 100;
      return bGrowth - aGrowth;
    }
    if (sortBy === "valuation") {
      return b.currentValuation - a.currentValuation;
    }
    return a.name.localeCompare(b.name);
  });

  // Calculate stats
  const totalMissedValue = mockCompanies.reduce((sum, company) => sum + company.currentValuation, 0);
  const totalCompanies = mockCompanies.length;
  const avgGrowth = mockCompanies.reduce((sum, company) => {
    return sum + ((company.currentValuation - company.lastValuation) / company.lastValuation) * 100;
  }, 0) / mockCompanies.length;
  const biggestMiss = mockCompanies.reduce((biggest, company) => {
    return company.currentValuation > biggest.value 
      ? { name: company.name, value: company.currentValuation }
      : biggest;
  }, { name: "", value: 0 });

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCompanies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No companies found matching your search.</p>
        </div>
      )}
    </div>
  );
}