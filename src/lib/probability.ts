import { supabase } from "@/integrations/supabase/client";

export interface PredictionResult {
  number: number;
  probability: number;
  daysSince: number;
  frequency: number;
}

export const calculateProbabilities = async (): Promise<PredictionResult[]> => {
  const allNumbers = Array.from({ length: 36 }, (_, i) => i + 1);
  const results: PredictionResult[] = [];

  // Fetch historical data from Supabase
  const { data: historicalData, error: drawsError } = await supabase
    .from('draws')
    .select('*')
    .order('created_at', { ascending: false });

  if (drawsError) {
    console.error('Error fetching draws:', drawsError);
    return [];
  }

  // Fetch frequency data from Supabase
  const { data: frequencyData, error: freqError } = await supabase
    .from('number_frequencies')
    .select('*');

  if (freqError) {
    console.error('Error fetching frequencies:', freqError);
    return [];
  }

  // Convert frequency data to lookup object
  const numberFrequencies: Record<number, number> = {};
  frequencyData?.forEach(item => {
    numberFrequencies[item.number] = item.frequency;
  });

  // Find the position of each number's last appearance
  const numberLastSeen: Record<number, number> = {};
  
  historicalData?.forEach((record, index) => {
    if (numberLastSeen[record.number] === undefined) {
      numberLastSeen[record.number] = index;
    }
  });

  // Calculate probabilities for each number
  allNumbers.forEach(number => {
    const daysSince = numberLastSeen[number] ?? (historicalData?.length || 0);
    const frequency = numberFrequencies[number] || 0;
    
    // Advanced probability calculation
    // Factors: recency weight, frequency normalization, and time-based decay
    const recencyWeight = Math.min(daysSince / 10, 5); // More weight for numbers not seen recently
    const frequencyScore = (800 - frequency) / 800; // Lower frequency = higher score
    const timeDecay = Math.exp(-daysSince / 20); // Exponential decay for very old numbers
    
    const combinedScore = (recencyWeight * 0.4) + (frequencyScore * 0.4) + (timeDecay * 0.2);
    
    // Normalize to probability (0-1)
    const probability = Math.max(0.01, Math.min(0.99, combinedScore));
    
    results.push({
      number,
      probability,
      daysSince,
      frequency
    });
  });

  // Sort by probability (highest first)
  return results.sort((a, b) => b.probability - a.probability);
};