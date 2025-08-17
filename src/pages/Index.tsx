import { useState, useEffect } from "react";
import { PredictionDisplay } from "@/components/PredictionDisplay";
import { DrawInput } from "@/components/DrawInput";
import { HistoryTable } from "@/components/HistoryTable";
import { calculateProbabilities, PredictionResult } from "@/lib/probability";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DrawRecord {
  id: string;
  draw_id: string;
  date: string;
  time: string;
  number: number;
  created_at: string;
}

const Index = () => {
  const [historicalData, setHistoricalData] = useState<DrawRecord[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load historical data
    const { data: draws } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (draws) {
      setHistoricalData(draws);
    }

    // Calculate predictions
    const newPredictions = await calculateProbabilities();
    setPredictions(newPredictions);
    setIsLoading(false);
  };

  const handleNewDraw = async (drawNumber: number) => {
    const maxDrawId = historicalData.length > 0 
      ? Math.max(...historicalData.map(d => parseInt(d.draw_id))) + 1 
      : 25986;

    const newDraw = {
      draw_id: `${maxDrawId}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
      time: getCurrentTimeSlot(),
      number: drawNumber
    };
    
    // Insert into Supabase
    const { error } = await supabase
      .from('draws')
      .insert([newDraw]);

    if (!error) {
      // Update frequency in Supabase
      const { error: freqError } = await supabase
        .from('number_frequencies')
        .upsert({
          number: drawNumber,
          frequency: 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'number',
          ignoreDuplicates: false
        });

      if (!freqError) {
        // Reload data to refresh predictions and history
        await loadData();
      }
    }
  };

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 12) return 'Morning';
    if (hour < 15) return 'Midday';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading probability data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 relative">
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="absolute top-0 right-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            PlayWhe ProbMaster
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