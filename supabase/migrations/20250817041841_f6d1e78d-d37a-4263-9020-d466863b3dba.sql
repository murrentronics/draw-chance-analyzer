-- Drop all existing policies with CASCADE
DROP POLICY IF EXISTS "Allow all operations on draws" ON public.draws CASCADE;
DROP POLICY IF EXISTS "Allow all operations on frequencies" ON public.number_frequencies CASCADE;
DROP POLICY IF EXISTS "Public can view draws" ON public.draws CASCADE;
DROP POLICY IF EXISTS "Public can view frequencies" ON public.number_frequencies CASCADE;
DROP POLICY IF EXISTS "Authenticated users can insert draws" ON public.draws CASCADE;
DROP POLICY IF EXISTS "Authenticated users can insert frequencies" ON public.number_frequencies CASCADE;
DROP POLICY IF EXISTS "Authenticated users can update draws" ON public.draws CASCADE;
DROP POLICY IF EXISTS "Authenticated users can update frequencies" ON public.number_frequencies CASCADE;
DROP POLICY IF EXISTS "Authenticated users can delete draws" ON public.draws CASCADE;
DROP POLICY IF EXISTS "Authenticated users can delete frequencies" ON public.number_frequencies CASCADE;

-- Create secure policies for draws table
CREATE POLICY "Public read access for draws" 
ON public.draws 
FOR SELECT 
USING (true);

CREATE POLICY "Auth users can insert draws" 
ON public.draws 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Auth users can update draws" 
ON public.draws 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Auth users can delete draws" 
ON public.draws 
FOR DELETE 
TO authenticated
USING (true);

-- Create secure policies for number_frequencies table
CREATE POLICY "Public read access for frequencies" 
ON public.number_frequencies 
FOR SELECT 
USING (true);

CREATE POLICY "Auth users can insert frequencies" 
ON public.number_frequencies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Auth users can update frequencies" 
ON public.number_frequencies 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Auth users can delete frequencies" 
ON public.number_frequencies 
FOR DELETE 
TO authenticated
USING (true);