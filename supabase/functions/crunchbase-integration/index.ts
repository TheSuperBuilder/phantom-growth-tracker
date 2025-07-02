import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CrunchbaseCompany {
  name: string;
  valuation?: number;
  industry?: string;
  funding_stage?: string;
  last_funding_date?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, updateType = 'current_value' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const crunchbaseApiKey = Deno.env.get('CRUNCHBASE_API_KEY');
    
    if (!crunchbaseApiKey) {
      return new Response(JSON.stringify({ 
        error: 'Crunchbase API key not configured',
        mock_data: {
          name: companyName,
          valuation: Math.floor(Math.random() * 1000000000) + 100000000,
          industry: 'Technology',
          funding_stage: 'Series B',
          last_funding_date: '2024-01-15'
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for company in Crunchbase
    const crunchbaseResponse = await fetch(
      `https://api.crunchbase.com/api/v4/entities/organizations?card_ids=raised_funding_rounds&field_ids=name,categories,funding_stage,funding_total&name=${encodeURIComponent(companyName)}`,
      {
        headers: {
          'X-cb-user-key': crunchbaseApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!crunchbaseResponse.ok) {
      throw new Error(`Crunchbase API error: ${crunchbaseResponse.status}`);
    }

    const crunchbaseData = await crunchbaseResponse.json();
    const company = crunchbaseData.entities?.[0];

    if (!company) {
      return new Response(JSON.stringify({ 
        error: 'Company not found in Crunchbase',
        searched_name: companyName 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const companyData: CrunchbaseCompany = {
      name: company.properties?.name || companyName,
      valuation: company.properties?.funding_total?.value || undefined,
      industry: company.properties?.categories?.[0]?.value || undefined,
      funding_stage: company.properties?.funding_stage?.value || undefined,
      last_funding_date: company.properties?.last_funding_date || undefined,
    };

    // Update companies in both portfolios if they exist
    const updates = [];
    
    // Update anti-portfolio companies
    const { data: antiPortfolioCompanies } = await supabase
      .from('anti_portfolio_companies')
      .select('id')
      .ilike('company_name', `%${companyName}%`);

    if (antiPortfolioCompanies?.length) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (updateType === 'current_value' && companyData.valuation) {
        updateData.current_value = companyData.valuation;
      }
      if (companyData.industry) {
        updateData.industry = companyData.industry;
      }

      for (const company of antiPortfolioCompanies) {
        updates.push(
          supabase
            .from('anti_portfolio_companies')
            .update(updateData)
            .eq('id', company.id)
        );
      }
    }

    // Update portfolio companies
    const { data: portfolioCompanies } = await supabase
      .from('portfolio_companies')
      .select('id')
      .ilike('company_name', `%${companyName}%`);

    if (portfolioCompanies?.length) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (updateType === 'current_value' && companyData.valuation) {
        updateData.current_value = companyData.valuation;
      }
      if (companyData.industry) {
        updateData.industry = companyData.industry;
      }

      for (const company of portfolioCompanies) {
        updates.push(
          supabase
            .from('portfolio_companies')
            .update(updateData)
            .eq('id', company.id)
        );
      }
    }

    // Execute all updates
    await Promise.all(updates);

    return new Response(JSON.stringify({
      success: true,
      company_data: companyData,
      updated_companies: {
        anti_portfolio: antiPortfolioCompanies?.length || 0,
        portfolio: portfolioCompanies?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crunchbase-integration function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      mock_data: {
        name: 'Demo Company',
        valuation: 500000000,
        industry: 'FinTech',
        funding_stage: 'Series A'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});