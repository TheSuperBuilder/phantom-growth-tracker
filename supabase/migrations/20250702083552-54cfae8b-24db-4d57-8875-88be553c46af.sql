-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anti_portfolio_companies table
CREATE TABLE public.anti_portfolio_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  current_value DECIMAL(15,2),
  past_value DECIMAL(15,2),
  employee_id UUID REFERENCES public.profiles(id),
  decision_date DATE,
  reason_not_investing TEXT,
  industry TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_companies table
CREATE TABLE public.portfolio_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  investment_value DECIMAL(15,2),
  current_value DECIMAL(15,2),
  employee_id UUID REFERENCES public.profiles(id),
  investment_date DATE,
  reason_for_investment TEXT,
  industry TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anti_portfolio_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_companies ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for anti_portfolio_companies
CREATE POLICY "Users can view all anti-portfolio companies" 
ON public.anti_portfolio_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create anti-portfolio entries" 
ON public.anti_portfolio_companies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update anti-portfolio entries" 
ON public.anti_portfolio_companies 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete anti-portfolio entries" 
ON public.anti_portfolio_companies 
FOR DELETE 
USING (true);

-- Create policies for portfolio_companies
CREATE POLICY "Users can view all portfolio companies" 
ON public.portfolio_companies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create portfolio entries" 
ON public.portfolio_companies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update portfolio entries" 
ON public.portfolio_companies 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete portfolio entries" 
ON public.portfolio_companies 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anti_portfolio_companies_updated_at
  BEFORE UPDATE ON public.anti_portfolio_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_companies_updated_at
  BEFORE UPDATE ON public.portfolio_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();