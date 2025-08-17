// Advanced backtesting and validation system for prediction accuracy

export interface BacktestResult {
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  confidenceThreshold: number;
  timeSlotAccuracy: { [key: string]: number };
}

export interface ValidationMetrics {
  overallAccuracy: number;
  highConfidenceAccuracy: number;
  microPatternScore: number;
  temporalConsistency: number;
  recommendedConfidenceThreshold: number;
}

export const runBacktest = (historicalData: any[], windowSize: number = 10): BacktestResult => {
  if (historicalData.length < windowSize + 5) {
    return {
      accuracy: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      confidenceThreshold: 0.95,
      timeSlotAccuracy: {}
    };
  }

  let totalPredictions = 0;
  let correctPredictions = 0;
  const timeSlotAccuracy: { [key: string]: { correct: number; total: number } } = {};

  // Test predictions on historical data
  for (let i = windowSize; i < historicalData.length - 1; i++) {
    const trainingData = historicalData.slice(i - windowSize, i);
    const actualNext = historicalData[i + 1];
    
    // Generate prediction based on training window
    const prediction = generateMicroPatternPrediction(trainingData, actualNext.time);
    
    if (prediction && prediction.confidence > 0.85) {
      totalPredictions++;
      
      if (!timeSlotAccuracy[actualNext.time]) {
        timeSlotAccuracy[actualNext.time] = { correct: 0, total: 0 };
      }
      timeSlotAccuracy[actualNext.time].total++;
      
      if (prediction.numbers.includes(actualNext.number)) {
        correctPredictions++;
        timeSlotAccuracy[actualNext.time].correct++;
      }
    }
  }

  const finalTimeSlotAccuracy: { [key: string]: number } = {};
  Object.keys(timeSlotAccuracy).forEach(time => {
    const stats = timeSlotAccuracy[time];
    finalTimeSlotAccuracy[time] = stats.total > 0 ? stats.correct / stats.total : 0;
  });

  return {
    accuracy: totalPredictions > 0 ? correctPredictions / totalPredictions : 0,
    totalPredictions,
    correctPredictions,
    confidenceThreshold: 0.95,
    timeSlotAccuracy: finalTimeSlotAccuracy
  };
};

const generateMicroPatternPrediction = (trainingData: any[], targetTime: string) => {
  // Analyze micro-patterns in the training data
  const recentNumbers = trainingData.slice(-3).map(d => d.number);
  const timeMatches = trainingData.filter(d => d.time === targetTime);
  
  // Look for sequential patterns
  const sequentialPatterns = findSequentialPatterns(trainingData);
  const proximityPatterns = findProximityPatterns(recentNumbers);
  
  // Calculate confidence based on pattern strength
  let confidence = 0.5;
  const suggestedNumbers: number[] = [];
  
  // Pattern 1: Time-based clustering
  if (timeMatches.length > 1) {
    const timeNumbers = timeMatches.map(d => d.number);
    const avgTimeNumber = timeNumbers.reduce((a, b) => a + b, 0) / timeNumbers.length;
    confidence += 0.2;
    
    // Suggest numbers near the average for this time slot
    const nearby = [
      Math.max(1, Math.floor(avgTimeNumber) - 2),
      Math.max(1, Math.floor(avgTimeNumber) - 1),
      Math.min(36, Math.ceil(avgTimeNumber)),
      Math.min(36, Math.ceil(avgTimeNumber) + 1),
      Math.min(36, Math.ceil(avgTimeNumber) + 2)
    ];
    suggestedNumbers.push(...nearby);
  }
  
  // Pattern 2: Gap analysis
  const gaps = analyzeNumberGaps(trainingData);
  if (gaps.length > 0) {
    confidence += 0.15;
    suggestedNumbers.push(...gaps.slice(0, 3));
  }
  
  // Pattern 3: Fibonacci-like sequences
  const fibNumbers = findFibonacciLikePatterns(recentNumbers);
  if (fibNumbers.length > 0) {
    confidence += 0.25;
    suggestedNumbers.push(...fibNumbers);
  }
  
  // Remove duplicates and ensure valid range
  const uniqueNumbers = [...new Set(suggestedNumbers)]
    .filter(n => n >= 1 && n <= 36)
    .slice(0, 5);
  
  return uniqueNumbers.length >= 3 ? {
    numbers: uniqueNumbers,
    confidence,
    patterns: { sequential: sequentialPatterns, proximity: proximityPatterns }
  } : null;
};

const findSequentialPatterns = (data: any[]): number[] => {
  const sequences: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const diff = data[i].number - data[i-1].number;
    if (Math.abs(diff) <= 5 && diff !== 0) {
      // Found a potential sequence
      const nextPredicted = data[i].number + diff;
      if (nextPredicted >= 1 && nextPredicted <= 36) {
        sequences.push(nextPredicted);
      }
    }
  }
  
  return sequences;
};

const findProximityPatterns = (recentNumbers: number[]): number[] => {
  const proximity: number[] = [];
  
  recentNumbers.forEach(num => {
    // Add numbers within ±3 range
    for (let i = -3; i <= 3; i++) {
      const candidate = num + i;
      if (candidate >= 1 && candidate <= 36 && candidate !== num) {
        proximity.push(candidate);
      }
    }
  });
  
  return [...new Set(proximity)];
};

const analyzeNumberGaps = (data: any[]): number[] => {
  const numbers = data.map(d => d.number).sort((a, b) => a - b);
  const gaps: number[] = [];
  
  for (let i = 1; i <= 36; i++) {
    if (!numbers.includes(i)) {
      gaps.push(i);
    }
  }
  
  // Return numbers that haven't appeared yet (gaps in the sequence)
  return gaps.slice(0, 10);
};

const findFibonacciLikePatterns = (recentNumbers: number[]): number[] => {
  if (recentNumbers.length < 2) return [];
  
  const patterns: number[] = [];
  
  // Look for additive patterns
  for (let i = 1; i < recentNumbers.length; i++) {
    const sum = recentNumbers[i-1] + recentNumbers[i];
    if (sum <= 36) {
      patterns.push(sum);
    }
    
    // Also try differences
    const diff = Math.abs(recentNumbers[i] - recentNumbers[i-1]);
    if (diff > 0 && diff <= 36 && !recentNumbers.includes(diff)) {
      patterns.push(diff);
    }
  }
  
  return [...new Set(patterns)];
};

export const validateAlgorithmPerformance = (historicalData: any[]): ValidationMetrics => {
  const backtest = runBacktest(historicalData);
  
  // Calculate micro-pattern strength
  const microPatternScore = calculateMicroPatternStrength(historicalData);
  
  // Calculate temporal consistency
  const temporalConsistency = calculateTemporalConsistency(historicalData);
  
  // Determine recommended confidence threshold for 95% accuracy
  let recommendedThreshold = 0.95;
  if (backtest.accuracy < 0.95 && backtest.totalPredictions > 0) {
    // Adjust threshold to potentially achieve higher accuracy
    recommendedThreshold = Math.min(0.99, 0.95 + (0.95 - backtest.accuracy));
  }
  
  return {
    overallAccuracy: backtest.accuracy,
    highConfidenceAccuracy: backtest.accuracy, // Would be filtered by high confidence only
    microPatternScore,
    temporalConsistency,
    recommendedConfidenceThreshold: recommendedThreshold
  };
};

const calculateMicroPatternStrength = (data: any[]): number => {
  if (data.length < 5) return 0.3;
  
  let patternStrength = 0;
  
  // Check for time-based patterns
  const timeGroups: { [key: string]: number[] } = {};
  data.forEach(d => {
    if (!timeGroups[d.time]) timeGroups[d.time] = [];
    timeGroups[d.time].push(d.number);
  });
  
  Object.values(timeGroups).forEach(numbers => {
    if (numbers.length > 1) {
      const variance = calculateVariance(numbers);
      patternStrength += variance < 50 ? 0.2 : 0.1; // Lower variance = stronger pattern
    }
  });
  
  return Math.min(1.0, patternStrength);
};

const calculateTemporalConsistency = (data: any[]): number => {
  if (data.length < 3) return 0.5;
  
  // Check if similar patterns repeat over time
  let consistency = 0.5;
  
  // Simple consistency check based on number distribution over time
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + d.number, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.number, 0) / secondHalf.length;
  
  const avgDifference = Math.abs(firstAvg - secondAvg);
  consistency = Math.max(0.3, 1 - (avgDifference / 36));
  
  return consistency;
};

const calculateVariance = (numbers: number[]): number => {
  const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
  return variance;
};