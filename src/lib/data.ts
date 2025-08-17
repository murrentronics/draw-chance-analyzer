export interface DrawRecord {
  drawId: string;
  date: string;
  time: string;
  number: number;
}

export interface NumberStats {
  number: number;
  timesPlayed: number;
  lastSeen?: DrawRecord;
}

// Historical data from user input
export const initialHistoricalData: DrawRecord[] = [
  { drawId: "25985", date: "16-Aug-25", time: "Evening", number: 32 },
  { drawId: "25984", date: "16-Aug-25", time: "Afternoon", number: 20 },
  { drawId: "25983", date: "16-Aug-25", time: "Midday", number: 19 },
  { drawId: "25982", date: "16-Aug-25", time: "Morning", number: 22 },
  { drawId: "25981", date: "15-Aug-25", time: "Evening", number: 9 },
  { drawId: "25980", date: "15-Aug-25", time: "Afternoon", number: 16 },
  { drawId: "25979", date: "15-Aug-25", time: "Midday", number: 31 },
  { drawId: "25978", date: "15-Aug-25", time: "Morning", number: 35 },
  { drawId: "25977", date: "14-Aug-25", time: "Evening", number: 27 },
  { drawId: "25976", date: "14-Aug-25", time: "Afternoon", number: 14 },
  { drawId: "25975", date: "14-Aug-25", time: "Midday", number: 21 },
  { drawId: "25974", date: "14-Aug-25", time: "Morning", number: 33 },
  { drawId: "25973", date: "13-Aug-25", time: "Evening", number: 24 },
  { drawId: "25972", date: "13-Aug-25", time: "Afternoon", number: 23 },
  { drawId: "25968", date: "12-Aug-25", time: "Afternoon", number: 26 },
  { drawId: "25965", date: "11-Aug-25", time: "Evening", number: 8 },
  { drawId: "25961", date: "09-Aug-25", time: "Evening", number: 10 },
  { drawId: "25958", date: "09-Aug-25", time: "Morning", number: 28 },
  { drawId: "25957", date: "08-Aug-25", time: "Evening", number: 11 },
  { drawId: "25956", date: "08-Aug-25", time: "Afternoon", number: 7 },
  { drawId: "25949", date: "06-Aug-25", time: "Evening", number: 6 },
  { drawId: "25945", date: "05-Aug-25", time: "Evening", number: 36 },
  { drawId: "25944", date: "05-Aug-25", time: "Afternoon", number: 3 },
  { drawId: "25942", date: "05-Aug-25", time: "Morning", number: 18 },
  { drawId: "25934", date: "02-Aug-25", time: "Morning", number: 5 },
  { drawId: "25930", date: "01-Aug-25", time: "Morning", number: 17 },
  { drawId: "25906", date: "25-Jul-25", time: "Morning", number: 15 },
  { drawId: "25905", date: "24-Jul-25", time: "Evening", number: 34 },
  { drawId: "25898", date: "23-Jul-25", time: "Morning", number: 25 },
  { drawId: "25897", date: "22-Jul-25", time: "Evening", number: 30 },
  { drawId: "25893", date: "21-Jul-25", time: "Evening", number: 4 },
  { drawId: "25892", date: "21-Jul-25", time: "Afternoon", number: 13 },
  { drawId: "25884", date: "18-Jul-25", time: "Afternoon", number: 29 },
  { drawId: "25881", date: "17-Jul-25", time: "Evening", number: 12 },
  { drawId: "25869", date: "14-Jul-25", time: "Evening", number: 1 },
  { drawId: "25861", date: "11-Jul-25", time: "Evening", number: 2 }
];

// Total frequency data from user input
export const numberFrequencies: Record<number, number> = {
  33: 658, 10: 663, 35: 681, 3: 681, 15: 689, 19: 692, 22: 697, 12: 702,
  7: 707, 20: 712, 8: 712, 25: 712, 9: 712, 27: 713, 4: 714, 23: 715,
  2: 717, 36: 718, 13: 720, 16: 724, 11: 724, 21: 729, 17: 734, 5: 735,
  34: 737, 32: 737, 29: 738, 1: 739, 30: 742, 18: 745, 24: 747, 28: 751,
  26: 753, 14: 761, 31: 761, 6: 765
};