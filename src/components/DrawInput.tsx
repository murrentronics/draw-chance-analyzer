import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DrawInputProps {
  onSubmit: (drawNumber: number) => void;
}

export const DrawInput = ({ onSubmit }: DrawInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const number = parseInt(inputValue);
    
    if (isNaN(number) || number < 1 || number > 36) {
      toast({
        title: "Invalid Number",
        description: "Please enter a number between 1 and 36",
        variant: "destructive",
      });
      return;
    }

    onSubmit(number);
    setInputValue("");
    
    toast({
      title: "Draw Added Successfully",
      description: `Number ${number} has been added to the database`,
      variant: "default",
    });
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-warning" />
            Update Database
          </h3>
          <p className="text-muted-foreground">
            Enter the actual draw number to improve prediction accuracy
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
          <Input
            type="number"
            min="1"
            max="36"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter draw number (1-36)"
            className="flex-1 bg-background/50 border-border"
          />
          <Button 
            type="submit" 
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            disabled={!inputValue}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Draw
          </Button>
        </form>
      </div>
    </Card>
  );
};