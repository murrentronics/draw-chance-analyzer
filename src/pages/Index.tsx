import { useState } from "react";
import { PredictionDisplay } from "@/components/PredictionDisplay";
import { DrawInput } from "@/components/DrawInput";
import { HistoryTable } from "@/components/HistoryTable";
import { calculateProbabilities } from "@/lib/probability";
import { initialHistoricalData, DrawRecord } from "@/lib/data";

const Index = () => {
  const [historicalData, setHistoricalData] = useState<DrawRecord[]>(initialHistoricalData);
  const predictions = calculateProbabilities(historicalData);

  const handleNewDraw = (drawNumber: number) => {
    const newDraw: DrawRecord = {
      drawId: `${Math.max(...historicalData.map(d => parseInt(d.drawId))) + 1}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
      time: getCurrentTimeSlot(),
      number: drawNumber
    };
    
    setHistoricalData(prev => [newDraw, ...prev]);
  };

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 12) return 'Morning';
    if (hour < 15) return 'Midday';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Draw Probability Analyzer
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced statistical prediction for lottery numbers
          </p>
        </header>

        <div className="grid gap-8 max-w-6xl mx-auto">
          <PredictionDisplay predictions={predictions} />
          
          <DrawInput onSubmit={handleNewDraw} />
          
          <HistoryTable data={historicalData} />
        </div>
      </div>
    </div>
  );
};

export default Index;