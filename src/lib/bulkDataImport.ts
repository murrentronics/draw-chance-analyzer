import { supabase } from "@/integrations/supabase/client";

interface ParsedDraw {
  draw_id: string;
  date: string;
  time: string;
  number: number;
}

export const parseBulkDrawData = (rawData: string): ParsedDraw[] => {
  const lines = rawData.trim().split('\n').map(line => line.trim()).filter(line => line);
  const draws: ParsedDraw[] = [];
  let currentDate = '';
  let drawCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is a date (contains day name and date)
    if (line.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/)) {
      currentDate = line;
      continue;
    }
    
    // Check if this line is a time slot
    if (line.match(/^(Morning|Midday|Afternoon|Evening)$/)) {
      const timeSlot = line;
      const numberLine = lines[i + 1];
      
      if (numberLine && !isNaN(parseInt(numberLine))) {
        const number = parseInt(numberLine);
        
        draws.push({
          draw_id: `D${drawCounter.toString().padStart(4, '0')}`,
          date: currentDate,
          time: timeSlot,
          number: number
        });
        
        drawCounter++;
        i++; // Skip the number line since we've processed it
      }
    }
  }
  
  return draws;
};

export const bulkInsertDraws = async (draws: ParsedDraw[]) => {
  console.log(`Attempting to insert ${draws.length} draws...`);
  
  // Insert draws in batches to avoid overwhelming the database
  const batchSize = 100;
  const results = [];
  
  for (let i = 0; i < draws.length; i += batchSize) {
    const batch = draws.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('draws')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }
    
    results.push(...(data || []));
    console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(draws.length / batchSize)}`);
  }
  
  // Update number frequencies
  await updateNumberFrequencies(draws);
  
  return results;
};

const updateNumberFrequencies = async (draws: ParsedDraw[]) => {
  // Count frequencies for each number
  const frequencies: { [key: number]: number } = {};
  
  draws.forEach(draw => {
    frequencies[draw.number] = (frequencies[draw.number] || 0) + 1;
  });
  
  // Update or insert frequencies
  for (const [number, frequency] of Object.entries(frequencies)) {
    const { error: upsertError } = await supabase
      .from('number_frequencies')
      .upsert(
        { 
          number: parseInt(number), 
          frequency: frequency,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'number',
          ignoreDuplicates: false 
        }
      );
      
    if (upsertError) {
      console.error(`Error updating frequency for number ${number}:`, upsertError);
    }
  }
};