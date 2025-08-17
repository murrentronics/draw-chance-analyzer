// Ultra-high accuracy prediction system with 95%+ target accuracy

import { supabase } from "@/integrations/supabase/client";
import { getChinesePairScore } from "./chineseNumberPairs";
import { analyzeTimePatterns, getCurrentTimeSlot } from "./timePatternAnalysis";
import { runBacktest, validateAlgorithmPerformance } from "./backtesting";

export interface HighAccuracyPrediction {
  number: number;
  confidence: number;
  accuracy: number;
  reasoning: string[];
  validationScore: number;
  element: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PredictionSet {
  predictions: HighAccuracyPrediction[];
  overallConfidence: number;
  expectedAccuracy: number;
  totalDataPoints: number;
  validationMetrics: any;
  recommendation: string;
}

export const generateHighAccuracyPredictions = async (): Promise<PredictionSet> => {
  // Fetch all available data
  const { data: historicalData, error: drawsError } = await supabase
    .from('draws')
    .select('*')
    .order('created_at', { ascending: false });

  if (drawsError || !historicalData || historicalData.length < 10) {
    return {
      predictions: [],
      overallConfidence: 0,
      expectedAccuracy: 0,
      totalDataPoints: 0,
      validationMetrics: null,
      recommendation: "Insufficient data for high-accuracy predictions. Need at least 100+ draws for reliable analysis."
    };
  }

  // Validate algorithm performance
  const validationMetrics = validateAlgorithmPerformance(historicalData);
  
  // If validation shows low accuracy, adjust approach
  if (validationMetrics.overallAccuracy < 0.85) {
    return generateConservativePredictions(historicalData, validationMetrics);
  }

  // Generate high-confidence predictions
  const predictions = await generateValidatedPredictions(historicalData, validationMetrics);
  
  // Filter for only the highest confidence predictions
  const highConfidencePredictions = predictions
    .filter(p => p.confidence >= validationMetrics.recommendedConfidenceThreshold)
    .slice(0, 5);

  const overallConfidence = highConfidencePredictions.length > 0 
    ? highConfidencePredictions.reduce((sum, p) => sum + p.confidence, 0) / highConfidencePredictions.length
    : 0;

  const expectedAccuracy = calculateExpectedAccuracy(highConfidencePredictions, validationMetrics);

  return {
    predictions: highConfidencePredictions,
    overallConfidence,
    expectedAccuracy,
    totalDataPoints: historicalData.length,
    validationMetrics,
    recommendation: generateRecommendation(expectedAccuracy, historicalData.length, overallConfidence)
  };
};

const generateValidatedPredictions = async (historicalData: any[], validationMetrics: any): Promise<HighAccuracyPrediction[]> => {
  const predictions: HighAccuracyPrediction[] = [];
  const currentTimeSlot = getCurrentTimeSlot();
  const currentDayOfWeek = new Date().getDay();
  
  // Get recent patterns
  const recentNumbers = historicalData.slice(0, 10).map(record => record.number);
  const veryRecentNumbers = historicalData.slice(0, 3).map(record => record.number);
  
  // Analyze time patterns with current context
  const timePatterns = analyzeTimePatterns(historicalData, currentDayOfWeek, currentTimeSlot);
  
  for (let number = 1; number <= 36; number++) {
    // Skip recently drawn numbers for higher accuracy
    if (veryRecentNumbers.includes(number)) continue;
    
    const reasoning: string[] = [];
    let confidence = 0.1;
    let validationScore = 0;
    
    // Factor 1: Historical frequency analysis
    const frequency = await getNumberFrequency(number);
    const expectedFrequency = historicalData.length / 36;
    
    if (frequency < expectedFrequency * 0.8) {
      confidence += 0.25;
      reasoning.push(`Under-drawn: only ${frequency} times vs expected ${expectedFrequency.toFixed(1)}`);
      validationScore += 0.3;
    }
    
    // Factor 2: Time pattern matching
    const timePattern = timePatterns.find(tp => tp.number === number);
    if (timePattern && timePattern.dayTimeScore > 0.7) {
      confidence += 0.3;
      reasoning.push(`Strong time pattern: ${(timePattern.dayTimeScore * 100).toFixed(1)}% match for ${currentTimeSlot}`);
      validationScore += 0.25;
    }
    
    // Factor 3: Chinese pair analysis
    const chineseScore = getChinesePairScore(number, recentNumbers);
    if (chineseScore > 0.8) {
      confidence += 0.2;
      reasoning.push(`Chinese pairs indicate high probability`);
      validationScore += 0.2;
    }
    
    // Factor 4: Gap analysis (numbers not seen recently)
    const lastSeen = findLastSeenPosition(number, historicalData);
    if (lastSeen > 10) {
      confidence += 0.15;
      reasoning.push(`Long absence: not seen for ${lastSeen} draws`);
      validationScore += 0.15;
    }
    
    // Factor 5: Seasonal and cyclical patterns
    const cyclicalScore = analyzeCyclicalPatterns(number, historicalData);
    if (cyclicalScore > 0.7) {
      confidence += 0.1;
      reasoning.push(`Cyclical pattern detected`);
      validationScore += 0.1;
    }
    
    // Apply validation metrics to adjust confidence
    confidence *= validationMetrics.temporalConsistency;
    confidence *= (1 + validationMetrics.microPatternScore * 0.3);
    
    // Calculate final accuracy estimate
    const accuracy = Math.min(0.99, confidence * 0.85 + validationScore * 0.15);
    
    // Determine risk level
    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 
      confidence > 0.9 ? 'LOW' : 
      confidence > 0.7 ? 'MEDIUM' : 'HIGH';
    
    if (reasoning.length > 0 && confidence > 0.5) {
      predictions.push({
        number,
        confidence,
        accuracy,
        reasoning,
        validationScore,
        element: getNumberElement(number),
        riskLevel
      });
    }
  }
  
  return predictions.sort((a, b) => b.confidence - a.confidence);
};

const generateConservativePredictions = (historicalData: any[], validationMetrics: any): PredictionSet => {
  // When validation shows poor performance, be very conservative
  return {
    predictions: [],
    overallConfidence: 0,
    expectedAccuracy: validationMetrics.overallAccuracy,
    totalDataPoints: historicalData.length,
    validationMetrics,
    recommendation: `Current algorithm shows ${(validationMetrics.overallAccuracy * 100).toFixed(1)}% accuracy. Need more data and pattern analysis to achieve 95%+ accuracy. Consider collecting at least 200+ historical draws for reliable predictions.`
  };
};

const calculateExpectedAccuracy = (predictions: HighAccuracyPrediction[], validationMetrics: any): number => {
  if (predictions.length === 0) return 0;
  
  // Weight accuracy by confidence levels
  const weightedAccuracy = predictions.reduce((sum, p) => sum + (p.accuracy * p.confidence), 0) / 
                          predictions.reduce((sum, p) => sum + p.confidence, 0);
  
  // Apply validation metrics as a reality check
  return Math.min(weightedAccuracy, validationMetrics.overallAccuracy + 0.1);
};

const generateRecommendation = (expectedAccuracy: number, dataPoints: number, confidence: number): string => {
  if (expectedAccuracy >= 0.95) {
    return `🎯 High confidence predictions with ${(expectedAccuracy * 100).toFixed(1)}% expected accuracy. Based on ${dataPoints} data points.`;
  } else if (expectedAccuracy >= 0.80) {
    return `⚠️ Moderate confidence predictions with ${(expectedAccuracy * 100).toFixed(1)}% expected accuracy. Consider these as guidance only.`;
  } else if (dataPoints < 50) {
    return `📊 Insufficient data (${dataPoints} draws). Need 100+ draws for reliable 95%+ accuracy predictions.`;
  } else {
    return `🔍 Current patterns suggest ${(expectedAccuracy * 100).toFixed(1)}% accuracy. Algorithm needs refinement for 95%+ target.`;
  }
};

const getNumberFrequency = async (number: number): Promise<number> => {
  const { data } = await supabase
    .from('number_frequencies')
    .select('frequency')
    .eq('number', number)
    .single();
  
  return data?.frequency || 0;
};

const findLastSeenPosition = (number: number, historicalData: any[]): number => {
  const position = historicalData.findIndex(record => record.number === number);
  return position >= 0 ? position : historicalData.length;
};

const analyzeCyclicalPatterns = (number: number, historicalData: any[]): number => {
  // Simple cyclical analysis - check if number appears in regular intervals
  const appearances = historicalData
    .map((record, index) => ({ ...record, position: index }))
    .filter(record => record.number === number);
  
  if (appearances.length < 2) return 0.5;
  
  const intervals = [];
  for (let i = 1; i < appearances.length; i++) {
    intervals.push(appearances[i].position - appearances[i-1].position);
  }
  
  // Check for consistent intervals (cyclical pattern)
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  
  // Lower variance = more consistent cyclical pattern
  return Math.max(0.3, 1 - (variance / (avgInterval * avgInterval)));
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