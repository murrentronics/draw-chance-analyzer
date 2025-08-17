
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, BarChart3 } from "lucide-react";

interface Prediction {
  number: number;
  probability: number;
  daysSince: number;
  frequency: number;
  chineseScore: number;
  timePatternScore: number;
  element: string;
}

interface PredictionDisplayProps {
  predictions: Prediction[];
}

export const PredictionDisplay = ({ predictions }: PredictionDisplayProps) => {
  const topPredictions = predictions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Target className="w-6 md:w-8 h-6 md:h-8 text-primary" />
          Next Draw Predictions
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">Top 5 most likely numbers based on statistical analysis</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {topPredictions.map((prediction, index) => (
          <Card key={prediction.number} className="relative overflow-hidden bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
            <div className="p-4 md:p-6 text-center">
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
              
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2 animate-pulse-glow">
                {prediction.number}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-success font-medium">
                    {(prediction.probability * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="text-muted-foreground text-xs">
                  Last seen: {prediction.daysSince} draws ago
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs">
                    Drawn {prediction.frequency} times
                  </span>
                </div>

                <div className="text-xs text-center space-y-1">
                  <div className="text-primary/80">
                    {prediction.element} Element
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Chinese: {(prediction.chineseScore * 100).toFixed(0)}% | 
                    Time: {(prediction.timePatternScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-60"></div>
          </Card>
        ))}
      </div>
    </div>
  );
};
