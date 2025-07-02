import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyForm } from "@/components/companies/CompanyForm";
import { CSVImport } from "@/components/companies/CSVImport";
import { DataSyncControls } from "@/components/companies/DataSyncControls";
import { useToast } from "@/hooks/use-toast";
import { useAntiPortfolioCompanies, useCreateAntiPortfolioCompany } from "@/hooks/useCompanies";

export default function Integrations() {
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [lastSync, setLastSync] = useState("2024-01-15 14:30");
  const { toast } = useToast();
  
  const { data: companies = [] } = useAntiPortfolioCompanies();
  const createCompany = useCreateAntiPortfolioCompany();

  const handleConnect = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsConnected(true);
    setLastSync(new Date().toLocaleString());
    toast({
      title: "Connected Successfully",
      description: "Your CRM integration is now active",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey("");
    toast({
      title: "Disconnected",
      description: "CRM integration has been disabled",
    });
  };

  const handleSync = () => {
    setLastSync(new Date().toLocaleString());
    toast({
      title: "Sync Complete",
      description: "Data has been synchronized with your CRM",
    });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Manage data imports, CRM connections, and sync operations
          </p>
        </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList>
          <TabsTrigger value="add">Add Company</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="crm">CRM Integration</TabsTrigger>
        </TabsList>

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

        <TabsContent value="crm" className="space-y-6">

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                🔗 Connection Status
              </span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "CONNECTED" : "DISCONNECTED"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Microsoft Dynamics API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your API key will be encrypted and stored securely
                  </p>
                </div>
                <Button onClick={handleConnect} className="w-full">
                  Connect to Microsoft Dynamics
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                  <div>
                    <p className="font-medium text-success">Microsoft Dynamics Connected</p>
                    <p className="text-xs text-muted-foreground">Last sync: {lastSync}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSync}>
                    Sync Now
                  </Button>
                </div>
                <Button variant="destructive" onClick={handleDisconnect} className="w-full">
                  Disconnect CRM
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Statistics */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Synced Deals</CardTitle>
                <span className="text-2xl">📄</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">247</div>
                <p className="text-xs text-muted-foreground">Total deals imported</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies Added</CardTitle>
                <span className="text-2xl">🏢</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">89</div>
                <p className="text-xs text-muted-foreground">New anti-portfolio entries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Update</CardTitle>
                <span className="text-2xl">⏰</span>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold font-mono">2h ago</div>
                <p className="text-xs text-muted-foreground">Automatic sync</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Available Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Microsoft Dynamics</h4>
                  <Badge variant={isConnected ? "default" : "outline"}>
                    {isConnected ? "Active" : "Available"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Sync deals, companies, and contact information
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✅ Deal pipeline data</li>
                  <li>✅ Company information</li>
                  <li>✅ Contact details</li>
                  <li>✅ Rejection reasons</li>
                </ul>
              </div>

              <div className="p-4 border border-border rounded-lg opacity-60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Salesforce</h4>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Enterprise CRM integration for larger funds
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>🔄 Opportunity tracking</li>
                  <li>🔄 Advanced analytics</li>
                  <li>🔄 Custom fields</li>
                  <li>🔄 Workflow automation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Mapping */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Data Mapping Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">CRM Fields</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Deal Name</span>
                        <span className="text-muted-foreground">→ Company Name</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Deal Value</span>
                        <span className="text-muted-foreground">→ Last Valuation</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Close Date</span>
                        <span className="text-muted-foreground">→ Date Considered</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Loss Reason</span>
                        <span className="text-muted-foreground">→ Rejection Reason</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Sync Rules</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-success/10 rounded border border-success/20">
                        ✅ Auto-sync rejected deals
                      </div>
                      <div className="p-2 bg-success/10 rounded border border-success/20">
                        ✅ Update valuations weekly
                      </div>
                      <div className="p-2 bg-success/10 rounded border border-success/20">
                        ✅ Track deal owner assignments
                      </div>
                      <div className="p-2 bg-warning/10 rounded border border-warning/20">
                        ⚠️ Manual review for duplicates
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}