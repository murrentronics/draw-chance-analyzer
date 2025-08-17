import { useState, useEffect } from "react";
import { PredictionDisplay } from "@/components/PredictionDisplay";
import { DrawInput } from "@/components/DrawInput";
import { HistoryTable } from "@/components/HistoryTable";
import { generateHighAccuracyPredictions, PredictionSet } from "@/lib/highAccuracyPredictor";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LogOut, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
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
  const [predictionSet, setPredictionSet] = useState<PredictionSet | null>(null);
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

    // Generate high-accuracy predictions
    const newPredictionSet = await generateHighAccuracyPredictions();
    setPredictionSet(newPredictionSet);
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

  const getAccuracyBadgeVariant = (accuracy: number) => {
    if (accuracy >= 0.95) return 'default';
    if (accuracy >= 0.80) return 'secondary';
    return 'outline';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 0.95) return <CheckCircle className="w-4 h-4" />;
    if (accuracy >= 0.80) return <TrendingUp className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing patterns for 95%+ accuracy...</p>
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
            PlayWhe ProbMaster Pro
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Ultra-High Accuracy Prediction System (95%+ Target)
          </p>
          
          {predictionSet && (
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant={getAccuracyBadgeVariant(predictionSet.expectedAccuracy)} className="text-sm">
                {getAccuracyIcon(predictionSet.expectedAccuracy)}
                Expected: {(predictionSet.expectedAccuracy * 100).toFixed(1)}% Accuracy
              </Badge>
              <Badge variant="outline" className="text-sm">
                Data Points: {predictionSet.totalDataPoints}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Confidence: {(predictionSet.overallConfidence * 100).toFixed(1)}%
              </Badge>
            </div>
          )}
        </header>

        <div className="grid gap-8 max-w-6xl mx-auto">
          {predictionSet && predictionSet.predictions.length > 0 ? (
            <>
              <PredictionDisplay predictions={predictionSet.predictions.map(p => ({
                number: p.number,
                probability: p.confidence,
                daysSince: 0, // Will be calculated in component
                frequency: 0, // Will be calculated in component
                chineseScore: 0, // Will be calculated in component
                timePatternScore: 0, // Will be calculated in component
                element: p.element
              }))} />
              
              <Card className="p-6 bg-gradient-card border-border/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  High-Accuracy Analysis
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{predictionSet.recommendation}</p>
                  
                  {predictionSet.predictions.slice(0, 3).map((prediction, index) => (
                    <div key={prediction.number} className="border-l-4 border-primary/30 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-primary">#{prediction.number}</span>
                        <Badge variant={getAccuracyBadgeVariant(prediction.accuracy)}>
                          {(prediction.accuracy * 100).toFixed(1)}% Accuracy
                        </Badge>
                        <Badge variant={prediction.riskLevel === 'LOW' ? 'default' : prediction.riskLevel === 'MEDIUM' ? 'secondary' : 'destructive'}>
                          {prediction.riskLevel} Risk
                        </Badge>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {prediction.reasoning.map((reason, idx) => (
                          <li key={idx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-8 text-center bg-gradient-card border-border/50">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Insufficient Data for 95%+ Accuracy</h3>
              <p className="text-muted-foreground mb-4">
                {predictionSet?.recommendation || "Need more historical data to generate high-accuracy predictions."}
              </p>
              <Badge variant="outline">
                Current Data: {predictionSet?.totalDataPoints || 0} draws
              </Badge>
            </Card>
          )}
          
          <DrawInput onSubmit={handleNewDraw} />
          
          <HistoryTable data={historicalData} />
        </div>
      </div>
    </div>
  );
};

export default Index;