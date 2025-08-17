-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on draws" ON public.draws;
DROP POLICY IF EXISTS "Allow all operations on frequencies" ON public.number_frequencies;

-- Create secure policies for draws table
-- Allow public read access for predictions
CREATE POLICY "Public can view draws" 
ON public.draws 
FOR SELECT 
USING (true);

-- Only authenticated users can insert new draws
CREATE POLICY "Authenticated users can insert draws" 
ON public.draws 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update draws
CREATE POLICY "Authenticated users can update draws" 
ON public.draws 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Only authenticated users can delete draws
CREATE POLICY "Authenticated users can delete draws" 
ON public.draws 
FOR DELETE 
TO authenticated
USING (true);

-- Create secure policies for number_frequencies table
-- Allow public read access for frequency analysis
CREATE POLICY "Public can view frequencies" 
ON public.number_frequencies 
FOR SELECT 
USING (true);

-- Only authenticated users can insert frequencies
CREATE POLICY "Authenticated users can insert frequencies" 
ON public.number_frequencies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update frequencies
CREATE POLICY "Authenticated users can update frequencies" 
ON public.number_frequencies 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Only authenticated users can delete frequencies
CREATE POLICY "Authenticated users can delete frequencies" 
ON public.number_frequencies 
FOR DELETE 
TO authenticated
USING (true);