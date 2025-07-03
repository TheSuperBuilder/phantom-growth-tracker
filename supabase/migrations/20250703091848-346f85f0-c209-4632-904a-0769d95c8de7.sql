-- Create a more efficient function for paginated search of all rejected companies
CREATE OR REPLACE FUNCTION get_all_rejected_companies(
  search_term TEXT DEFAULT '',
  page_size INTEGER DEFAULT 100,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  company_name TEXT,
  industry TEXT,
  decision_date DATE,
  reason_not_investing TEXT,
  notes TEXT,
  past_value NUMERIC,
  current_value NUMERIC,
  growth_percentage NUMERIC,
  past_entry_created TIMESTAMP WITH TIME ZONE,
  current_value_updated TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_companies AS (
    SELECT 
      p.company_name,
      p.industry,
      p.decision_date,
      p.reason_not_investing,
      p.notes,
      p.past_value,
      c.current_value,
      CASE 
        WHEN p.past_value IS NOT NULL AND c.current_value IS NOT NULL AND p.past_value > 0
        THEN ((c.current_value - p.past_value) / p.past_value) * 100
        ELSE NULL
      END as growth_percentage,
      p.created_at as past_entry_created,
      c.last_updated as current_value_updated
    FROM past_value_companies p
    LEFT JOIN current_value_companies c ON p.company_name = c.company_name
    WHERE 
      CASE 
        WHEN search_term = '' THEN TRUE
        ELSE (
          LOWER(p.company_name) LIKE LOWER('%' || search_term || '%') OR
          LOWER(COALESCE(p.industry, '')) LIKE LOWER('%' || search_term || '%') OR
          LOWER(COALESCE(p.reason_not_investing, '')) LIKE LOWER('%' || search_term || '%')
        )
      END
  ),
  total_count AS (
    SELECT COUNT(*) as count FROM filtered_companies
  )
  SELECT 
    fc.company_name,
    fc.industry,
    fc.decision_date,
    fc.reason_not_investing,
    fc.notes,
    fc.past_value,
    fc.current_value,
    fc.growth_percentage,
    fc.past_entry_created,
    fc.current_value_updated,
    tc.count as total_count
  FROM filtered_companies fc
  CROSS JOIN total_count tc
  ORDER BY fc.company_name
  LIMIT page_size
  OFFSET page_offset;
END;
$$;