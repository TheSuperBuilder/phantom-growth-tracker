-- Create Past Value table for companies not invested in
CREATE TABLE public.past_value_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  past_value DECIMAL(15,2),
  decision_date DATE,
  reason_not_investing TEXT,
  industry TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Current Value table for current company valuations
CREATE TABLE public.current_value_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  current_value DECIMAL(15,2),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  industry TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Anti-Portfolio view that dynamically combines data from both tables
CREATE VIEW public.anti_portfolio_view AS
SELECT 
  p.company_name,
  p.past_value,
  c.current_value,
  p.decision_date,
  p.reason_not_investing,
  COALESCE(p.industry, c.industry) as industry,
  COALESCE(p.notes, c.notes) as notes,
  p.created_at as past_entry_created,
  c.last_updated as current_value_updated,
  -- Calculate growth percentage
  CASE 
    WHEN p.past_value > 0 AND c.current_value > 0 
    THEN ((c.current_value - p.past_value) / p.past_value) * 100
    ELSE NULL
  END as growth_percentage
FROM public.past_value_companies p
INNER JOIN public.current_value_companies c ON p.company_name = c.company_name;

-- Enable Row Level Security
ALTER TABLE public.past_value_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.current_value_companies ENABLE ROW LEVEL SECURITY;

-- Create policies for past_value_companies
CREATE POLICY "Users can view all past value companies" 
ON public.past_value_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create past value entries" 
ON public.past_value_companies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update past value entries" 
ON public.past_value_companies 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete past value entries" 
ON public.past_value_companies 
FOR DELETE 
USING (true);

-- Create policies for current_value_companies
CREATE POLICY "Users can view all current value companies" 
ON public.current_value_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create current value entries" 
ON public.current_value_companies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update current value entries" 
ON public.current_value_companies 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete current value entries" 
ON public.current_value_companies 
FOR DELETE 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_past_value_companies_updated_at
  BEFORE UPDATE ON public.past_value_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_current_value_companies_updated_at
  BEFORE UPDATE ON public.current_value_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically update last_updated when current_value changes
CREATE OR REPLACE FUNCTION public.update_current_value_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_current_value_timestamp
  BEFORE UPDATE OF current_value ON public.current_value_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_current_value_timestamp();