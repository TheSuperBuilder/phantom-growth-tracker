import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AntiPortfolioCompany, PortfolioCompany } from '@/hooks/useCompanies';
import { Trash2, Edit } from 'lucide-react';

interface CompanyTableProps {
  companies: (AntiPortfolioCompany | PortfolioCompany)[];
  type: 'anti-portfolio' | 'portfolio';
  onEdit?: (company: AntiPortfolioCompany | PortfolioCompany) => void;
  onDelete?: (id: string) => void;
}

export function CompanyTable({ companies, type, onEdit, onDelete }: CompanyTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'date'>('name');

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === 'name') {
      return a.company_name.localeCompare(b.company_name);
    }
    if (sortBy === 'value') {
      const aValue = a.current_value || 0;
      const bValue = b.current_value || 0;
      return bValue - aValue;
    }
    if (sortBy === 'date') {
      const aDate = type === 'anti-portfolio' 
        ? (a as AntiPortfolioCompany).decision_date 
        : (a as PortfolioCompany).investment_date;
      const bDate = type === 'anti-portfolio' 
        ? (b as AntiPortfolioCompany).decision_date 
        : (b as PortfolioCompany).investment_date;
      
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    }
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {type === 'anti-portfolio' ? 'Anti-Portfolio' : 'Portfolio'} Companies
          </span>
          <Badge variant="outline">
            {companies.length} companies
          </Badge>
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search companies, industries, or employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              onClick={() => setSortBy('name')}
              size="sm"
            >
              Sort by Name
            </Button>
            <Button
              variant={sortBy === 'value' ? 'default' : 'outline'}
              onClick={() => setSortBy('value')}
              size="sm"
            >
              Sort by Value
            </Button>
            <Button
              variant={sortBy === 'date' ? 'default' : 'outline'}
              onClick={() => setSortBy('date')}
              size="sm"
            >
              Sort by Date
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              {type === 'anti-portfolio' ? (
                <>
                  <TableHead>Past Value</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Decision Date</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Investment</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Investment Date</TableHead>
                </>
              )}
              <TableHead>Employee</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">
                  {company.company_name}
                </TableCell>
                <TableCell>
                  {company.industry ? (
                    <Badge variant="secondary">{company.industry}</Badge>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                {type === 'anti-portfolio' ? (
                  <>
                    <TableCell>
                      {formatCurrency((company as AntiPortfolioCompany).past_value)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(company.current_value)}
                    </TableCell>
                    <TableCell>
                      {formatDate((company as AntiPortfolioCompany).decision_date)}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      {formatCurrency((company as PortfolioCompany).investment_value)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(company.current_value)}
                    </TableCell>
                    <TableCell>
                      {formatDate((company as PortfolioCompany).investment_date)}
                    </TableCell>
                  </>
                )}
                <TableCell>
                  {company.profiles?.full_name || 'Unassigned'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {sortedCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'No companies found matching your search.' 
                : `No ${type === 'anti-portfolio' ? 'anti-portfolio' : 'portfolio'} companies yet.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}