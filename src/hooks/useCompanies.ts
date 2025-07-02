import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AntiPortfolioCompany {
  id: string;
  company_name: string;
  current_value?: number;
  past_value?: number;
  employee_id?: string;
  decision_date?: string;
  reason_not_investing?: string;
  industry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
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

export function useAntiPortfolioCompanies() {
  return useQuery({
    queryKey: ['anti-portfolio-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anti_portfolio_companies')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });

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

export function useCreateAntiPortfolioCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (company: Omit<AntiPortfolioCompany, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
      const { data, error } = await supabase
        .from('anti_portfolio_companies')
        .insert([company])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anti-portfolio-companies'] });
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

export function useUpdateAntiPortfolioCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AntiPortfolioCompany> }) => {
      const { data, error } = await supabase
        .from('anti_portfolio_companies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anti-portfolio-companies'] });
    },
  });
}

export function useDeleteAntiPortfolioCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('anti_portfolio_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anti-portfolio-companies'] });
    },
  });
}