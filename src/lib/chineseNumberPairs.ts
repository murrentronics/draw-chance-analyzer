// Chinese Number Pairs Chart for PlayWhe
// Traditional lottery analysis based on Chinese numerology and pair relationships

export interface ChinesePair {
  primary: number;
  secondary: number[];
  element: string;
  strength: number;
}

export const chineseNumberPairs: ChinesePair[] = [
  // Fire Element - Hot numbers
  { primary: 1, secondary: [13, 25], element: 'Fire', strength: 0.9 },
  { primary: 7, secondary: [19, 31], element: 'Fire', strength: 0.8 },
  { primary: 13, secondary: [1, 25], element: 'Fire', strength: 0.7 },
  { primary: 19, secondary: [7, 31], element: 'Fire', strength: 0.8 },
  { primary: 25, secondary: [1, 13], element: 'Fire', strength: 0.7 },
  { primary: 31, secondary: [7, 19], element: 'Fire', strength: 0.8 },

  // Water Element - Flow numbers
  { primary: 2, secondary: [14, 26], element: 'Water', strength: 0.85 },
  { primary: 8, secondary: [20, 32], element: 'Water', strength: 0.9 },
  { primary: 14, secondary: [2, 26], element: 'Water', strength: 0.7 },
  { primary: 20, secondary: [8, 32], element: 'Water', strength: 0.8 },
  { primary: 26, secondary: [2, 14], element: 'Water', strength: 0.7 },
  { primary: 32, secondary: [8, 20], element: 'Water', strength: 0.8 },

  // Wood Element - Growth numbers
  { primary: 3, secondary: [15, 27], element: 'Wood', strength: 0.8 },
  { primary: 9, secondary: [21, 33], element: 'Wood', strength: 0.85 },
  { primary: 15, secondary: [3, 27], element: 'Wood', strength: 0.7 },
  { primary: 21, secondary: [9, 33], element: 'Wood', strength: 0.8 },
  { primary: 27, secondary: [3, 15], element: 'Wood', strength: 0.7 },
  { primary: 33, secondary: [9, 21], element: 'Wood', strength: 0.8 },

  // Metal Element - Strong numbers
  { primary: 4, secondary: [16, 28], element: 'Metal', strength: 0.9 },
  { primary: 10, secondary: [22, 34], element: 'Metal', strength: 0.8 },
  { primary: 16, secondary: [4, 28], element: 'Metal', strength: 0.7 },
  { primary: 22, secondary: [10, 34], element: 'Metal', strength: 0.8 },
  { primary: 28, secondary: [4, 16], element: 'Metal', strength: 0.7 },
  { primary: 34, secondary: [10, 22], element: 'Metal', strength: 0.8 },

  // Earth Element - Stable numbers
  { primary: 5, secondary: [17, 29], element: 'Earth', strength: 0.8 },
  { primary: 11, secondary: [23, 35], element: 'Earth', strength: 0.85 },
  { primary: 17, secondary: [5, 29], element: 'Earth', strength: 0.7 },
  { primary: 23, secondary: [11, 35], element: 'Earth', strength: 0.8 },
  { primary: 29, secondary: [5, 17], element: 'Earth', strength: 0.7 },
  { primary: 35, secondary: [11, 23], element: 'Earth', strength: 0.8 },

  // Special pairs
  { primary: 6, secondary: [18, 30, 36], element: 'Earth', strength: 0.9 },
  { primary: 12, secondary: [24, 36], element: 'Water', strength: 0.85 },
  { primary: 18, secondary: [6, 30], element: 'Metal', strength: 0.8 },
  { primary: 24, secondary: [12, 36], element: 'Fire', strength: 0.8 },
  { primary: 30, secondary: [6, 18], element: 'Wood', strength: 0.8 },
  { primary: 36, secondary: [6, 12, 24], element: 'Special', strength: 1.0 },
];

export const getChinesePairScore = (number: number, recentNumbers: number[]): number => {
  const pair = chineseNumberPairs.find(p => p.primary === number);
  if (!pair) return 0.5;

  let score = pair.strength;
  
  // Check if any secondary numbers appeared recently
  const recentSecondaryMatches = pair.secondary.filter(sec => 
    recentNumbers.includes(sec)
  ).length;
  
  // Boost score if related numbers appeared recently
  if (recentSecondaryMatches > 0) {
    score *= (1 + (recentSecondaryMatches * 0.3));
  }

  // Element cycle bonuses
  const elementBonus = getElementCycleBonus(pair.element, recentNumbers);
  score *= (1 + elementBonus);

  return Math.min(score, 1.0);
};

const getElementCycleBonus = (element: string, recentNumbers: number[]): number => {
  const elementCounts = {
    Fire: 0, Water: 0, Wood: 0, Metal: 0, Earth: 0, Special: 0
  };

  recentNumbers.forEach(num => {
    const pair = chineseNumberPairs.find(p => p.primary === num);
    if (pair) {
      elementCounts[pair.element as keyof typeof elementCounts]++;
    }
  });

  // Traditional Chinese five-element cycle
  const cycles = {
    Fire: elementCounts.Wood > 0 ? 0.2 : 0, // Wood feeds Fire
    Water: elementCounts.Metal > 0 ? 0.2 : 0, // Metal collects Water
    Wood: elementCounts.Water > 0 ? 0.2 : 0, // Water nourishes Wood
    Metal: elementCounts.Earth > 0 ? 0.2 : 0, // Earth contains Metal
    Earth: elementCounts.Fire > 0 ? 0.2 : 0, // Fire creates Earth
    Special: 0.1 // Always slightly favored
  };

  return cycles[element as keyof typeof cycles] || 0;
};