// Time and Day Pattern Analysis for PlayWhe predictions

export interface TimePattern {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  timeSlot: string;
  number: number;
  frequency: number;
  lastSeen: number;
}

export interface DayTimeAnalysis {
  number: number;
  dayTimeScore: number;
  weekPatternScore: number;
  seasonalScore: number;
}

export const analyzeTimePatterns = (
  historicalData: any[],
  currentDayOfWeek: number,
  currentTimeSlot: string
): DayTimeAnalysis[] => {
  const results: DayTimeAnalysis[] = [];
  
  // Group data by day and time patterns
  const patterns = new Map<string, TimePattern[]>();
  
  historicalData.forEach(record => {
    const recordDate = new Date(record.created_at);
    const dayOfWeek = recordDate.getDay();
    const key = `${dayOfWeek}-${record.time}`;
    
    if (!patterns.has(key)) {
      patterns.set(key, []);
    }
    
    const existing = patterns.get(key)!.find(p => p.number === record.number);
    if (existing) {
      existing.frequency++;
    } else {
      patterns.get(key)!.push({
        dayOfWeek,
        timeSlot: record.time,
        number: record.number,
        frequency: 1,
        lastSeen: 0 // Will be calculated later
      });
    }
  });

  // Calculate scores for each number
  for (let number = 1; number <= 36; number++) {
    const dayTimeScore = calculateDayTimeScore(number, currentDayOfWeek, currentTimeSlot, patterns);
    const weekPatternScore = calculateWeekPatternScore(number, historicalData);
    const seasonalScore = calculateSeasonalScore(number, historicalData);
    
    results.push({
      number,
      dayTimeScore,
      weekPatternScore,
      seasonalScore
    });
  }
  
  return results;
};

const calculateDayTimeScore = (
  number: number,
  currentDayOfWeek: number,
  currentTimeSlot: string,
  patterns: Map<string, TimePattern[]>
): number => {
  const currentKey = `${currentDayOfWeek}-${currentTimeSlot}`;
  const currentPattern = patterns.get(currentKey);
  
  if (!currentPattern) return 0.5;
  
  const numberPattern = currentPattern.find(p => p.number === number);
  if (!numberPattern) return 0.3;
  
  // Higher frequency for this day/time = higher score
  const maxFrequency = Math.max(...currentPattern.map(p => p.frequency));
  return numberPattern.frequency / maxFrequency;
};

const calculateWeekPatternScore = (number: number, historicalData: any[]): number => {
  const weeklyData: { [key: number]: number[] } = {};
  
  historicalData.forEach(record => {
    const recordDate = new Date(record.created_at);
    const weekNumber = getWeekNumber(recordDate);
    
    if (!weeklyData[weekNumber]) {
      weeklyData[weekNumber] = [];
    }
    weeklyData[weekNumber].push(record.number);
  });
  
  const currentWeek = getWeekNumber(new Date());
  let score = 0.5;
  
  // Check if number appeared in same week of previous cycles
  Object.keys(weeklyData).forEach(weekStr => {
    const week = parseInt(weekStr);
    if (week !== currentWeek && weeklyData[week].includes(number)) {
      // Check if this was around the same time in previous weeks
      score += 0.1;
    }
  });
  
  return Math.min(score, 1.0);
};

const calculateSeasonalScore = (number: number, historicalData: any[]): number => {
  const currentMonth = new Date().getMonth();
  const monthlyFrequency: { [key: number]: number } = {};
  
  historicalData.forEach(record => {
    const recordDate = new Date(record.created_at);
    const month = recordDate.getMonth();
    
    if (!monthlyFrequency[month]) {
      monthlyFrequency[month] = 0;
    }
    
    if (record.number === number) {
      monthlyFrequency[month]++;
    }
  });
  
  // Higher frequency in current month/season = higher score
  const currentMonthFreq = monthlyFrequency[currentMonth] || 0;
  const maxMonthlyFreq = Math.max(...Object.values(monthlyFrequency));
  
  return maxMonthlyFreq > 0 ? currentMonthFreq / maxMonthlyFreq : 0.5;
};

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const getCurrentTimeSlot = (): string => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 12) return 'Morning';
  if (hour < 15) return 'Midday';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
};