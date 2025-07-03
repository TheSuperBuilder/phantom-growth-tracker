-- Add user approval fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN approved BOOLEAN DEFAULT FALSE,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES public.profiles(id);

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT approved FROM public.profiles WHERE user_id = _user_id),
    FALSE
  )
$$;

-- Update RLS policies to require authentication and approval
DROP POLICY IF EXISTS "Users can view all current value companies" ON public.current_value_companies;
DROP POLICY IF EXISTS "Users can create current value entries" ON public.current_value_companies;
DROP POLICY IF EXISTS "Users can update current value entries" ON public.current_value_companies;
DROP POLICY IF EXISTS "Users can delete current value entries" ON public.current_value_companies;

CREATE POLICY "Approved users can view current value companies" 
ON public.current_value_companies 
FOR SELECT 
TO authenticated
USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can create current value entries" 
ON public.current_value_companies 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update current value entries" 
ON public.current_value_companies 
FOR UPDATE 
TO authenticated
USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can delete current value entries" 
ON public.current_value_companies 
FOR DELETE 
TO authenticated
USING (public.is_user_approved(auth.uid()));

-- Update past_value_companies policies
DROP POLICY IF EXISTS "Users can view all past value companies" ON public.past_value_companies;
DROP POLICY IF EXISTS "Users can create past value entries" ON public.past_value_companies;
DROP POLICY IF EXISTS "Users can update past value entries" ON public.past_value_companies;
DROP POLICY IF EXISTS "Users can delete past value entries" ON public.past_value_companies;

CREATE POLICY "Approved users can view past value companies" 
ON public.past_value_companies 
FOR SELECT 
TO authenticated
USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can create past value entries" 
ON public.past_value_companies 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update past value entries" 
ON public.past_value_companies 
FOR UPDATE 
TO authenticated
USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can delete past value entries" 
ON public.past_value_companies 
FOR DELETE 
TO authenticated
USING (public.is_user_approved(auth.uid()));

-- Update portfolio_companies policies
DROP POLICY IF EXISTS "Users can view all portfolio companies" ON public.portfolio_companies;
DROP POLICY IF EXISTS "Users can create portfolio entries" ON public.portfolio_companies;
DROP POLICY IF EXISTS "Users can update portfolio entries" ON public.portfolio_companies;
DROP POLICY IF EXISTS "Users can delete portfolio entries" ON public.portfolio_companies;

CREATE POLICY "Approved users can view portfolio companies" 
ON public.portfolio_companies 
FOR SELECT 
TO authenticated
USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can create portfolio entries" 
ON public.portfolio_companies 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update portfolio entries" 
ON public.portfolio_companies 
FOR UPDATE 
TO authenticated
USING (public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can delete portfolio entries" 
ON public.portfolio_companies 
FOR DELETE 
TO authenticated
USING (public.is_user_approved(auth.uid()));

-- Add RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles policies to require approval for viewing data
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Approved users can view approved profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  public.is_user_approved(auth.uid()) AND approved = TRUE
  OR public.has_role(auth.uid(), 'admin')
  OR auth.uid() = user_id
);

-- Create trigger to assign default user role on profile creation
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();