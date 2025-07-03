import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AntiPortfolioCompany {
  company_name: string;
  current_value?: number;
  past_value?: number;
  decision_date?: string;
  reason_not_investing?: string;
  industry?: string;
  notes?: string;
  past_entry_created?: string;
  current_value_updated?: string;
  growth_percentage?: number;
}

export interface PortfolioCompany {
  id: string;
  company_name: string;
  investment_value?: number;
  current_value?: number;
  employee_id?: string;
  investment_date?: string;
  reason_for_investment?: string;
  industry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface PastValueCompany {
  id: string;
  company_name: string;
  past_value?: number;
  decision_date?: string;
  reason_not_investing?: string;
  industry?: string;
  notes?: string;
  person_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CurrentValueCompany {
  id: string;
  company_name: string;
  current_value?: number;
  last_updated: string;
  industry?: string;
  notes?: string;
  person_name?: string;
  created_at: string;
  updated_at: string;
}

export function useAntiPortfolioCompanies() {
  return useQuery({
    queryKey: ['anti-portfolio-view'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anti_portfolio_view')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) throw error;
      return data as AntiPortfolioCompany[];
    },
  });
}

export function usePortfolioCompanies() {
  return useQuery({
    queryKey: ['portfolio-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_companies')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PortfolioCompany[];
    },
  });
}

export function usePastValueCompanies() {
  return useQuery({
    queryKey: ['past-value-companies'],
    queryFn: async () => {
      console.log('Fetching past value companies...');
      
      // Try to get all records in batches if needed
      let allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      
      while (true) {
        const { data, error } = await supabase
          .from('past_value_companies')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + pageSize - 1);
        
        if (error) throw error;
        
        if (!data || data.length === 0) break;
        
        allData = [...allData, ...data];
        console.log(`Fetched ${allData.length} records so far...`);
        
        if (data.length < pageSize) break; // Last page
        
        from += pageSize;
      }
      
      console.log(`Total past value companies fetched: ${allData.length}`);
      return allData as PastValueCompany[];
    },
  });
}

export function useCurrentValueCompanies() {
  return useQuery({
    queryKey: ['current-value-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('current_value_companies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50000); // Ensure we get all records

      if (error) throw error;
      return data as CurrentValueCompany[];
    },
  });
}

export function useCreateAntiPortfolioCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company: {
      company_name: string;
      past_value?: number;
      current_value?: number;
      decision_date?: string;
      reason_not_investing?: string;
      industry?: string;
      notes?: string;
    }) => {
      // Create entries in both tables if values are provided
      const results = [];
      
      if (company.past_value !== undefined || company.decision_date || company.reason_not_investing) {
        const { data: pastData, error: pastError } = await supabase
          .from('past_value_companies')
          .insert([{
            company_name: company.company_name,
            past_value: company.past_value,
            decision_date: company.decision_date,
            reason_not_investing: company.reason_not_investing,
            industry: company.industry,
            notes: company.notes,
          }])
          .select()
          .single();

        if (pastError) throw pastError;
        results.push(pastData);
      }

      if (company.current_value !== undefined) {
        const { data: currentData, error: currentError } = await supabase
          .from('current_value_companies')
          .insert([{
            company_name: company.company_name,
            current_value: company.current_value,
            industry: company.industry,
            notes: company.notes,
          }])
          .select()
          .single();

        if (currentError) throw currentError;
        results.push(currentData);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anti-portfolio-view'] });
      queryClient.invalidateQueries({ queryKey: ['past-value-companies'] });
      queryClient.invalidateQueries({ queryKey: ['current-value-companies'] });
    },
  });
}

export function useCreatePortfolioCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company: Omit<PortfolioCompany, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
      const { data, error } = await supabase
        .from('portfolio_companies')
        .insert([company])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-companies'] });
    },
  });
}

export function useUpdatePastValueCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ company_name, updates }: { company_name: string; updates: Partial<PastValueCompany> }) => {
      const { data, error } = await supabase
        .from('past_value_companies')
        .update(updates)
        .eq('company_name', company_name)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anti-portfolio-view'] });
      queryClient.invalidateQueries({ queryKey: ['past-value-companies'] });
    },
  });
}

export function useUpdateCurrentValueCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ company_name, updates }: { company_name: string; updates: Partial<CurrentValueCompany> }) => {
      const { data, error } = await supabase
        .from('current_value_companies')
        .update(updates)
        .eq('company_name', company_name)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anti-portfolio-view'] });
      queryClient.invalidateQueries({ queryKey: ['current-value-companies'] });
    },
  });
}

// New optimized hook for paginated all rejected companies
export function useAllRejectedCompanies(searchTerm: string = '', page: number = 1, pageSize: number = 100) {
  return useQuery({
    queryKey: ['all-rejected-companies', searchTerm, page, pageSize],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_rejected_companies', {
        search_term: searchTerm,
        page_size: pageSize,
        page_offset: (page - 1) * pageSize
      });

      if (error) throw error;
      return {
        companies: data || [],
        totalCount: data?.[0]?.total_count || 0
      };
    },
    // Add debouncing for search
    staleTime: searchTerm ? 300 : 5 * 60 * 1000, // 300ms for search, 5min for regular data
  });
}

export function useDeleteAntiPortfolioCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company_name: string) => {
      // Delete from both tables
      const { error: pastError } = await supabase
        .from('past_value_companies')
        .delete()
        .eq('company_name', company_name);

      const { error: currentError } = await supabase
        .from('current_value_companies')
        .delete()
        .eq('company_name', company_name);

      if (pastError && currentError) throw pastError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anti-portfolio-view'] });
      queryClient.invalidateQueries({ queryKey: ['past-value-companies'] });
      queryClient.invalidateQueries({ queryKey: ['current-value-companies'] });
      queryClient.invalidateQueries({ queryKey: ['all-rejected-companies'] });
    },
  });
}