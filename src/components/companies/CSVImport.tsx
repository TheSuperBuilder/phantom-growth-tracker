import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Trash2, Check } from 'lucide-react';

interface CSVRow {
  [key: string]: any;
  id?: string;
  company_name: string;
  current_value?: string;
  past_value?: string;
  investment_value?: string;
  employee_name?: string;
  decision_date?: string;
  investment_date?: string;
  reason_not_investing?: string;
  reason_for_investment?: string;
  industry?: string;
  notes?: string;
  _errors?: string[];
  _valid?: boolean;
}

interface CSVImportProps {
  type: 'anti-portfolio' | 'portfolio';
  onImport: (data: CSVRow[]) => Promise<void>;
}

export function CSVImport({ type, onImport }: CSVImportProps) {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const requiredFields = ['company_name'];
  const optionalFields = type === 'anti-portfolio' 
    ? ['current_value', 'past_value', 'employee_name', 'decision_date', 'reason_not_investing', 'industry', 'notes']
    : ['investment_value', 'current_value', 'employee_name', 'investment_date', 'reason_for_investment', 'industry', 'notes'];

  const downloadTemplate = () => {
    const headers = ['company_name', ...optionalFields];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateRow = (row: CSVRow): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!row.company_name?.trim()) {
      errors.push('Company name is required');
    }

    // Validate numeric fields
    const numericFields = type === 'anti-portfolio' 
      ? ['current_value', 'past_value']
      : ['investment_value', 'current_value'];
    
    numericFields.forEach(field => {
      if (row[field] && isNaN(Number(row[field]))) {
        errors.push(`${field} must be a valid number`);
      }
    });

    // Validate date fields
    const dateField = type === 'anti-portfolio' ? 'decision_date' : 'investment_date';
    if (row[dateField] && !Date.parse(row[dateField])) {
      errors.push(`${dateField} must be a valid date`);
    }

    return { valid: errors.length === 0, errors };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[];
        
        // Validate each row
        const validatedData = data.map((row, index) => {
          const { valid, errors } = validateRow(row);
          return {
            ...row,
            id: `temp-${index}`,
            _valid: valid,
            _errors: errors,
          };
        });

        setCsvData(validatedData);
        
        const validRows = validatedData.filter(row => row._valid);
        const invalidRows = validatedData.filter(row => !row._valid);
        
        toast({
          title: 'File uploaded',
          description: `${validRows.length} valid rows, ${invalidRows.length} invalid rows`,
        });
      },
      error: (error) => {
        toast({
          title: 'Error',
          description: `Failed to parse CSV: ${error.message}`,
          variant: 'destructive',
        });
      }
    });
  };

  const updateRow = (index: number, field: string, value: string) => {
    const newData = [...csvData];
    newData[index] = { ...newData[index], [field]: value };
    
    // Re-validate the row
    const { valid, errors } = validateRow(newData[index]);
    newData[index]._valid = valid;
    newData[index]._errors = errors;
    
    setCsvData(newData);
  };

  const removeRow = (index: number) => {
    setCsvData(csvData.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    const validRows = csvData.filter(row => row._valid);
    
    if (validRows.length === 0) {
      toast({
        title: 'Error',
        description: 'No valid rows to import',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onImport(validRows);
      toast({
        title: 'Success',
        description: `${validRows.length} companies imported successfully`,
      });
      setCsvData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import companies',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validRowsCount = csvData.filter(row => row._valid).length;
  const invalidRowsCount = csvData.filter(row => !row._valid).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>CSV Import - {type === 'anti-portfolio' ? 'Anti-Portfolio' : 'Portfolio'}</span>
          <Button variant="outline" onClick={downloadTemplate} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload CSV File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {csvData.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-600">
                {validRowsCount} valid
              </Badge>
              {invalidRowsCount > 0 && (
                <Badge variant="outline" className="text-red-600">
                  {invalidRowsCount} invalid
                </Badge>
              )}
            </div>
          )}
        </div>

        {csvData.length > 0 && (
          <>
            <div className="max-h-96 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Company Name</TableHead>
                    {type === 'anti-portfolio' ? (
                      <>
                        <TableHead>Past Value</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Decision Date</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Investment Value</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Investment Date</TableHead>
                      </>
                    )}
                    <TableHead>Employee</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, index) => (
                    <TableRow key={row.id} className={!row._valid ? 'bg-destructive/10' : ''}>
                      <TableCell>
                        {row._valid ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-red-600 text-xs">!</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.company_name || ''}
                          onChange={(e) => updateRow(index, 'company_name', e.target.value)}
                          className={!row.company_name ? 'border-red-500' : ''}
                        />
                      </TableCell>
                      {type === 'anti-portfolio' ? (
                        <>
                          <TableCell>
                            <Input
                              value={row.past_value || ''}
                              onChange={(e) => updateRow(index, 'past_value', e.target.value)}
                              placeholder="e.g., 50000000"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.current_value || ''}
                              onChange={(e) => updateRow(index, 'current_value', e.target.value)}
                              placeholder="e.g., 1200000000"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={row.decision_date || ''}
                              onChange={(e) => updateRow(index, 'decision_date', e.target.value)}
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>
                            <Input
                              value={row.investment_value || ''}
                              onChange={(e) => updateRow(index, 'investment_value', e.target.value)}
                              placeholder="e.g., 5000000"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.current_value || ''}
                              onChange={(e) => updateRow(index, 'current_value', e.target.value)}
                              placeholder="e.g., 50000000"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={row.investment_date || ''}
                              onChange={(e) => updateRow(index, 'investment_date', e.target.value)}
                            />
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        <Input
                          value={row.employee_name || ''}
                          onChange={(e) => updateRow(index, 'employee_name', e.target.value)}
                          placeholder="Employee name"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.industry || ''}
                          onChange={(e) => updateRow(index, 'industry', e.target.value)}
                          placeholder="e.g., AI/ML"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {invalidRowsCount > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm font-medium text-destructive">
                  Please fix the errors in the highlighted rows before importing.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCsvData([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Clear
              </Button>
              <Button
                onClick={handleImport}
                disabled={isLoading || validRowsCount === 0}
              >
                {isLoading ? 'Importing...' : `Import ${validRowsCount} Companies`}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}