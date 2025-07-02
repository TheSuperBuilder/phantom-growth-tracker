import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DataSyncControlsProps {
  type: 'anti-portfolio' | 'portfolio';
  companies?: Array<{ id: string; company_name: string; current_value?: number }>;
}

export function DataSyncControls({ type, companies = [] }: DataSyncControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const syncCompanyData = async (companyName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('crunchbase-integration', {
        body: { 
          companyName,
          updateType: 'current_value'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error syncing ${companyName}:`, error);
      throw error;
    }
  };

  const handleBulkSync = async () => {
    if (companies.length === 0) {
      toast({
        title: 'No companies to sync',
        description: 'Add some companies first before syncing data.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const company of companies) {
        try {
          await syncCompanyData(company.company_name);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to sync ${company.company_name}:`, error);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setLastSync(new Date());
      
      toast({
        title: 'Sync completed',
        description: `Updated ${successCount} companies successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'Failed to sync company data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSingleSync = async (companyName: string) => {
    setIsUpdating(true);
    try {
      await syncCompanyData(companyName);
      toast({
        title: 'Company updated',
        description: `Successfully updated data for ${companyName}`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: `Failed to update ${companyName}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToCSV = () => {
    if (companies.length === 0) {
      toast({
        title: 'No data to export',
        description: 'Add some companies first before exporting.',
        variant: 'destructive',
      });
      return;
    }

    const headers = type === 'anti-portfolio' 
      ? ['company_name', 'current_value', 'past_value', 'decision_date', 'reason_not_investing', 'industry', 'notes']
      : ['company_name', 'investment_value', 'current_value', 'investment_date', 'reason_for_investment', 'industry', 'notes'];
    
    const csvContent = [
      headers.join(','),
      ...companies.map(company => headers.map(header => company[header as keyof typeof company] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export completed',
      description: `Exported ${companies.length} companies to CSV`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Management</span>
          {lastSync && (
            <Badge variant="outline" className="text-xs">
              Last sync: {lastSync.toLocaleTimeString()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleBulkSync}
            disabled={isUpdating || companies.length === 0}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Syncing...' : 'Sync All Companies'}
          </Button>
          
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={companies.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Automatically updates current valuations from Crunchbase</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span>Sync process may take time for large datasets</span>
          </div>
        </div>

        {companies.length > 0 && (
          <div className="border rounded-lg p-3 bg-muted/50">
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {companies.slice(0, 6).map((company) => (
                <Button
                  key={company.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSingleSync(company.company_name)}
                  disabled={isUpdating}
                  className="justify-start text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                  {company.company_name}
                </Button>
              ))}
              {companies.length > 6 && (
                <div className="text-xs text-muted-foreground p-2">
                  +{companies.length - 6} more companies
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}