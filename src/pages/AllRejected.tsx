import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAntiPortfolioCompanies, useUpdatePastValueCompany, useUpdateCurrentValueCompany, usePastValueCompanies, useCurrentValueCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";
import { Search, Save, X } from "lucide-react";

interface EditableCell {
  companyName: string;
  field: 'past_value' | 'current_value';
  value: number | null;
}

export default function AllRejected() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<EditableCell | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: pastValueCompanies = [], isLoading: isLoadingPast } = usePastValueCompanies();
  const { data: currentValueCompanies = [], isLoading: isLoadingCurrent } = useCurrentValueCompanies();
  const isLoading = isLoadingPast || isLoadingCurrent;
  const updatePastValue = useUpdatePastValueCompany();
  const updateCurrentValue = useUpdateCurrentValueCompany();
  const { toast } = useToast();

  // Merge past value companies with current value data where available
  const allEnrichedDeals = useMemo(() => {
    return pastValueCompanies.map(pastCompany => {
      const currentCompany = currentValueCompanies.find(
        current => current.company_name === pastCompany.company_name
      );
      
      return {
        company_name: pastCompany.company_name,
        industry: pastCompany.industry,
        decision_date: pastCompany.decision_date,
        reason_not_investing: pastCompany.reason_not_investing,
        notes: pastCompany.notes,
        past_value: pastCompany.past_value,
        current_value: currentCompany?.current_value || null,
        current_value_updated: currentCompany?.last_updated || null,
        growth_percentage: pastCompany.past_value && currentCompany?.current_value 
          ? ((currentCompany.current_value - pastCompany.past_value) / pastCompany.past_value) * 100
          : null,
        past_entry_created: pastCompany.created_at
      };
    });
  }, [pastValueCompanies, currentValueCompanies]);

  // Apply search filter
  const filteredDeals = useMemo(() => {
    if (!searchTerm) return allEnrichedDeals;
    
    return allEnrichedDeals.filter(company =>
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (company.reason_not_investing && company.reason_not_investing.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allEnrichedDeals, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredDeals.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDeals = filteredDeals.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "-";
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const startEdit = (companyName: string, field: 'past_value' | 'current_value', currentValue: number | null) => {
    setEditingCell({ companyName, field, value: currentValue });
    setEditValue(currentValue?.toString() || "");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const numValue = editValue ? parseFloat(editValue) : null;
    
    try {
      if (editingCell.field === 'past_value') {
        await updatePastValue.mutateAsync({
          company_name: editingCell.companyName,
          updates: { past_value: numValue }
        });
      } else {
        await updateCurrentValue.mutateAsync({
          company_name: editingCell.companyName,
          updates: { current_value: numValue }
        });
      }
      
      toast({
        title: "Success",
        description: "Value updated successfully",
      });
      
      setEditingCell(null);
      setEditValue("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update value",
        variant: "destructive",
      });
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">All Rejected Deals</h1>
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Past Value Companies</h1>
          <p className="text-muted-foreground">
            Manage all companies from past value assessments
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies, industries, reasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredDeals.length)} of {filteredDeals.length} companies
          {searchTerm && ` (filtered from ${allEnrichedDeals.length} total)`}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Past Value Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Decision Date</TableHead>
                <TableHead>Past Value</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Growth</TableHead>
                <TableHead>Reason for Rejection</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No companies found matching your search" : "No companies found"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDeals.map((deal) => (
                  <TableRow key={deal.company_name}>
                    <TableCell className="font-medium">{deal.company_name}</TableCell>
                    <TableCell>{deal.industry || "-"}</TableCell>
                    <TableCell>{formatDate(deal.decision_date)}</TableCell>
                    
                    {/* Editable Past Value */}
                    <TableCell>
                      {editingCell?.companyName === deal.company_name && editingCell.field === 'past_value' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24"
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={saveEdit}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(deal.company_name, 'past_value', deal.past_value)}
                          className="text-left hover:bg-muted/50 p-1 rounded transition-colors"
                        >
                          {formatCurrency(deal.past_value)}
                        </button>
                      )}
                    </TableCell>
                    
                    {/* Editable Current Value */}
                    <TableCell>
                      {editingCell?.companyName === deal.company_name && editingCell.field === 'current_value' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24"
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={saveEdit}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(deal.company_name, 'current_value', deal.current_value)}
                          className="text-left hover:bg-muted/50 p-1 rounded transition-colors"
                        >
                          {formatCurrency(deal.current_value)}
                        </button>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {deal.growth_percentage !== null && deal.growth_percentage !== undefined ? (
                        <span className={`font-mono ${deal.growth_percentage > 0 ? 'text-chart-positive' : 'text-chart-negative'}`}>
                          {deal.growth_percentage > 0 ? '+' : ''}{deal.growth_percentage.toFixed(1)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    
                    <TableCell className="max-w-xs truncate" title={deal.reason_not_investing}>
                      {deal.reason_not_investing}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => goToPage(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* Show first page */}
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => goToPage(1)} className="cursor-pointer">
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Show ellipsis */}
              {currentPage > 3 && (
                <PaginationItem>
                  <span className="px-3">...</span>
                </PaginationItem>
              )}
              
              {/* Show current and adjacent pages */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                if (page > totalPages) return null;
                
                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      onClick={() => goToPage(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {/* Show ellipsis */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <span className="px-3">...</span>
                </PaginationItem>
              )}
              
              {/* Show last page */}
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => goToPage(totalPages)} className="cursor-pointer">
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}