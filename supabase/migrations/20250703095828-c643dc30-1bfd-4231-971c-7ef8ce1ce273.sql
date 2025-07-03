-- Update the anti_portfolio_view to include person_name
CREATE OR REPLACE VIEW public.anti_portfolio_view AS
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
  COALESCE(p.person_name, c.person_name) as person_name,
  -- Calculate growth percentage
  CASE 
    WHEN p.past_value > 0 AND c.current_value > 0 
    THEN ((c.current_value - p.past_value) / p.past_value) * 100
    ELSE NULL
  END as growth_percentage
FROM public.past_value_companies p
INNER JOIN public.current_value_companies c ON p.company_name = c.company_name;