import { supabase } from "@/integrations/supabase/client";
import { getChinesePairScore } from "./chineseNumberPairs";
import { analyzeTimePatterns, getCurrentTimeSlot } from "./timePatternAnalysis";

export interface PredictionResult {
  number: number;
  probability: number;
  daysSince: number;
  frequency: number;
  chineseScore: number;
  timePatternScore: number;
  element: string;
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

  if (!historicalData || historicalData.length === 0) {
    console.warn('No historical data available');
    return [];
  }

  // Convert frequency data to lookup object
  const numberFrequencies: Record<number, number> = {};
  frequencyData?.forEach(item => {
    numberFrequencies[item.number] = item.frequency;
  });

  // Get recent numbers for pattern analysis
  const recentNumbers = historicalData.slice(0, 10).map(record => record.number);
  const veryRecentNumbers = historicalData.slice(0, 5).map(record => record.number);

  // Analyze time patterns
  const currentDayOfWeek = new Date().getDay();
  const currentTimeSlot = getCurrentTimeSlot();
  const timePatterns = analyzeTimePatterns(historicalData, currentDayOfWeek, currentTimeSlot);

  // Find the position of each number's last appearance
  const numberLastSeen: Record<number, number> = {};
  
  historicalData.forEach((record, index) => {
    if (numberLastSeen[record.number] === undefined) {
      numberLastSeen[record.number] = index;
    }
  });

  // Calculate probabilities for each number
  allNumbers.forEach(number => {
    const daysSince = numberLastSeen[number] ?? historicalData.length;
    const frequency = numberFrequencies[number] || 0;
    
    // Enhanced probability calculation with multiple factors
    
    // 1. Recency Analysis (40% weight)
    const recencyScore = calculateRecencyScore(daysSince, historicalData.length);
    
    // 2. Frequency Analysis (20% weight) - inverse frequency for "due" numbers
    const frequencyScore = calculateFrequencyScore(frequency, historicalData.length);
    
    // 3. Chinese Pair Analysis (25% weight)
    const chineseScore = getChinesePairScore(number, recentNumbers);
    
    // 4. Time Pattern Analysis (15% weight)
    const timePattern = timePatterns.find(tp => tp.number === number);
    const timePatternScore = timePattern ? 
      (timePattern.dayTimeScore * 0.5 + timePattern.weekPatternScore * 0.3 + timePattern.seasonalScore * 0.2) : 0.5;
    
    // 5. Hot/Cold streak analysis
    const streakScore = calculateStreakScore(number, veryRecentNumbers, recentNumbers);
    
    // Combine all scores with weights
    const combinedScore = (
      recencyScore * 0.35 +
      frequencyScore * 0.15 +
      chineseScore * 0.25 +
      timePatternScore * 0.15 +
      streakScore * 0.10
    );
    
    // Apply volatility factor for more realistic predictions
    const volatilityFactor = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15
    const finalProbability = Math.max(0.01, Math.min(0.99, combinedScore * volatilityFactor));
    
    results.push({
      number,
      probability: finalProbability,
      daysSince,
      frequency,
      chineseScore,
      timePatternScore,
      element: getNumberElement(number)
    });
  });

  // Sort by probability (highest first) and add some randomization to prevent same results
  return results
    .sort((a, b) => b.probability - a.probability)
    .map((result, index) => ({
      ...result,
      probability: result.probability * (1 - (index * 0.02)) // Slight decay for ranking variety
    }));
};

const calculateRecencyScore = (daysSince: number, totalDraws: number): number => {
  if (daysSince === 0) return 0.1; // Recently drawn = lower chance
  
  // Numbers not seen recently get higher scores
  const recencyRatio = daysSince / totalDraws;
  return Math.min(0.95, 0.3 + (recencyRatio * 0.7));
};

const calculateFrequencyScore = (frequency: number, totalDraws: number): number => {
  if (totalDraws === 0) return 0.5;
  
  const expectedFrequency = totalDraws / 36;
  const frequencyRatio = frequency / expectedFrequency;
  
  // Numbers drawn less than expected get higher scores (they're "due")
  if (frequencyRatio < 0.8) return 0.8; // Under-drawn numbers
  if (frequencyRatio > 1.2) return 0.3; // Over-drawn numbers
  return 0.5; // Average frequency
};

const calculateStreakScore = (number: number, veryRecentNumbers: number[], recentNumbers: number[]): number => {
  const inVeryRecent = veryRecentNumbers.includes(number);
  const inRecent = recentNumbers.includes(number);
  
  if (inVeryRecent) return 0.2; // Very recently drawn = very low chance
  if (inRecent) return 0.4; // Recently drawn = low chance
  
  // Check for "cold" streaks (numbers that haven't appeared in recent draws)
  const coldStreak = !recentNumbers.includes(number);
  return coldStreak ? 0.8 : 0.6;
};

const getNumberElement = (number: number): string => {
  const elementMap = {
    Fire: [1, 7, 13, 19, 25, 31],
    Water: [2, 8, 14, 20, 26, 32],
    Wood: [3, 9, 15, 21, 27, 33],
    Metal: [4, 10, 16, 22, 28, 34],
    Earth: [5, 11, 17, 23, 29, 35],
    Special: [6, 12, 18, 24, 30, 36]
  };
  
  for (const [element, numbers] of Object.entries(elementMap)) {
    if (numbers.includes(number)) {
      return element;
    }
  }
  
  return 'Unknown';
};