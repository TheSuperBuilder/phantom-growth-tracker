import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/useProfiles';
import { useCreateAntiPortfolioCompany, useCreatePortfolioCompany } from '@/hooks/useCompanies';

interface CompanyFormProps {
  type: 'anti-portfolio' | 'portfolio';
  onSuccess?: () => void;
}

interface FormData {
  company_name: string;
  current_value?: number;
  past_value?: number;
  investment_value?: number;
  employee_id?: string;
  decision_date?: string;
  investment_date?: string;
  reason_not_investing?: string;
  reason_for_investment?: string;
  industry?: string;
  notes?: string;
}

export function CompanyForm({ type, onSuccess }: CompanyFormProps) {
  const { toast } = useToast();
  const { data: profiles } = useProfiles();
  const createAntiPortfolio = useCreateAntiPortfolioCompany();
  const createPortfolio = useCreatePortfolioCompany();
  
  const form = useForm<FormData>({
    defaultValues: {
      company_name: '',
      current_value: undefined,
      past_value: undefined,
      investment_value: undefined,
      employee_id: '',
      decision_date: '',
      investment_date: '',
      reason_not_investing: '',
      reason_for_investment: '',
      industry: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (type === 'anti-portfolio') {
        await createAntiPortfolio.mutateAsync({
          company_name: data.company_name,
          current_value: data.current_value,
          past_value: data.past_value,
          employee_id: data.employee_id || undefined,
          decision_date: data.decision_date || undefined,
          reason_not_investing: data.reason_not_investing || undefined,
          industry: data.industry || undefined,
          notes: data.notes || undefined,
        });
      } else {
        await createPortfolio.mutateAsync({
          company_name: data.company_name,
          investment_value: data.investment_value,
          current_value: data.current_value,
          employee_id: data.employee_id || undefined,
          investment_date: data.investment_date || undefined,
          reason_for_investment: data.reason_for_investment || undefined,
          industry: data.industry || undefined,
          notes: data.notes || undefined,
        });
      }
      
      toast({
        title: 'Success',
        description: `${type === 'anti-portfolio' ? 'Anti-portfolio' : 'Portfolio'} company added successfully`,
      });
      
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add company',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createAntiPortfolio.isPending || createPortfolio.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Add {type === 'anti-portfolio' ? 'Anti-Portfolio' : 'Portfolio'} Company
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              rules={{ required: 'Company name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === 'anti-portfolio' ? (
                <>
                  <FormField
                    control={form.control}
                    name="past_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Past Value (at decision)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 50000000" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="current_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Value</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 1200000000" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="investment_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Value</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 5000000" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="current_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Value</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 50000000" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {profiles?.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name || profile.email || 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={type === 'anti-portfolio' ? 'decision_date' : 'investment_date'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {type === 'anti-portfolio' ? 'Decision Date' : 'Investment Date'}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AI/ML, FinTech, SaaS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={type === 'anti-portfolio' ? 'reason_not_investing' : 'reason_for_investment'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {type === 'anti-portfolio' ? 'Reason for Not Investing' : 'Reason for Investment'}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={
                        type === 'anti-portfolio' 
                          ? 'Why did you decide not to invest?' 
                          : 'Why did you decide to invest?'
                      } 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes or observations" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Adding...' : `Add ${type === 'anti-portfolio' ? 'Anti-Portfolio' : 'Portfolio'} Company`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}