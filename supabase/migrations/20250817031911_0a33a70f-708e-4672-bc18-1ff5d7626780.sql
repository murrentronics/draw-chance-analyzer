-- Create table for draw records
CREATE TABLE public.draws (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  number INTEGER NOT NULL CHECK (number >= 1 AND number <= 36),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_draws_number ON public.draws(number);
CREATE INDEX idx_draws_created_at ON public.draws(created_at DESC);

-- Create table for number frequency tracking
CREATE TABLE public.number_frequencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE CHECK (number >= 1 AND number <= 36),
  frequency INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial historical draw data
INSERT INTO public.draws (draw_id, date, time, number) VALUES
('25985', '16-Aug-25', 'Evening', 32),
('25984', '16-Aug-25', 'Afternoon', 20),
('25983', '16-Aug-25', 'Midday', 19),
('25982', '16-Aug-25', 'Morning', 22),
('25981', '15-Aug-25', 'Evening', 9),
('25980', '15-Aug-25', 'Afternoon', 16),
('25979', '15-Aug-25', 'Midday', 31),
('25978', '15-Aug-25', 'Morning', 35),
('25977', '14-Aug-25', 'Evening', 27),
('25976', '14-Aug-25', 'Afternoon', 14),
('25975', '14-Aug-25', 'Midday', 21),
('25974', '14-Aug-25', 'Morning', 33),
('25973', '13-Aug-25', 'Evening', 24),
('25972', '13-Aug-25', 'Afternoon', 23),
('25968', '12-Aug-25', 'Afternoon', 26),
('25965', '11-Aug-25', 'Evening', 8),
('25961', '09-Aug-25', 'Evening', 10),
('25958', '09-Aug-25', 'Morning', 28),
('25957', '08-Aug-25', 'Evening', 11),
('25956', '08-Aug-25', 'Afternoon', 7),
('25949', '06-Aug-25', 'Evening', 6),
('25945', '05-Aug-25', 'Evening', 36),
('25944', '05-Aug-25', 'Afternoon', 3),
('25942', '05-Aug-25', 'Morning', 18),
('25934', '02-Aug-25', 'Morning', 5),
('25930', '01-Aug-25', 'Morning', 17),
('25906', '25-Jul-25', 'Morning', 15),
('25905', '24-Jul-25', 'Evening', 34),
('25898', '23-Jul-25', 'Morning', 25),
('25897', '22-Jul-25', 'Evening', 30),
('25893', '21-Jul-25', 'Evening', 4),
('25892', '21-Jul-25', 'Afternoon', 13),
('25884', '18-Jul-25', 'Afternoon', 29),
('25881', '17-Jul-25', 'Evening', 12),
('25869', '14-Jul-25', 'Evening', 1),
('25861', '11-Jul-25', 'Evening', 2);

-- Insert number frequency data
INSERT INTO public.number_frequencies (number, frequency) VALUES
(1, 739), (2, 717), (3, 681), (4, 714), (5, 735), (6, 765),
(7, 707), (8, 712), (9, 712), (10, 663), (11, 724), (12, 702),
(13, 720), (14, 761), (15, 689), (16, 724), (17, 734), (18, 745),
(19, 692), (20, 712), (21, 729), (22, 697), (23, 715), (24, 747),
(25, 712), (26, 753), (27, 713), (28, 751), (29, 738), (30, 742),
(31, 761), (32, 737), (33, 658), (34, 737), (35, 681), (36, 718);

-- Create function to update frequency when new draw is added
CREATE OR REPLACE FUNCTION public.update_number_frequency()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment frequency for the drawn number
  INSERT INTO public.number_frequencies (number, frequency, updated_at)
  VALUES (NEW.number, 1, now())
  ON CONFLICT (number)
  DO UPDATE SET 
    frequency = number_frequencies.frequency + 1,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update frequencies
CREATE TRIGGER update_frequency_on_new_draw
  AFTER INSERT ON public.draws
  FOR EACH ROW
  EXECUTE FUNCTION public.update_number_frequency();

-- Enable RLS (Row Level Security) - since this is admin only, allow all operations
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.number_frequencies ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (since it's admin only)
CREATE POLICY "Allow all operations on draws" ON public.draws FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on frequencies" ON public.number_frequencies FOR ALL USING (true) WITH CHECK (true);