import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftCircle, Calculator, Hash, DivideCircle, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketType } from "./MatkaMarkets";

export type BetType = "jodi" | "oddEven" | "cross" | "hurf";

// Interface for bet type details
interface BetTypeInfo {
  id: BetType;
  name: string;
  description: string;
  multiplier: string;
  icon: React.ReactNode;
  color: string;
}

interface BetTypeSelectionProps {
  market: MarketType;
  onSelectBetType: (betType: BetType) => void;
  onGoBack: () => void;
}

const BetTypeSelection: React.FC<BetTypeSelectionProps> = ({ market, onSelectBetType, onGoBack }) => {
  const formatMarketName = (marketType: MarketType): string => {
    switch (marketType) {
      case "gali": return "Gali Market";
      case "dishawar": return "Dishawar Market";
      case "mumbai": return "Mumbai Market";
      default: return marketType;
    }
  };

  // Bet types information
  const betTypes: BetTypeInfo[] = [
    {
      id: "jodi",
      name: "Jodi",
      description: "Bet on the exact two-digit number from 00-99",
      multiplier: "90x",
      icon: <Calculator className="h-10 w-10" />,
      color: "from-violet-700 to-purple-500"
    },
    {
      id: "oddEven",
      name: "Odd/Even",
      description: "Bet on whether the result will be an odd or even number",
      multiplier: "1.9x",
      icon: <DivideCircle className="h-10 w-10" />,
      color: "from-blue-700 to-cyan-500"
    },
    {
      id: "cross",
      name: "Cross",
      description: "Select multiple digits for combined bets",
      multiplier: "9x",
      icon: <LayoutGrid className="h-10 w-10" />,
      color: "from-amber-700 to-yellow-500"
    },
    {
      id: "hurf",
      name: "Hurf",
      description: "Bet on specific positions (left/right) of the result",
      multiplier: "9x",
      icon: <Hash className="h-10 w-10" />,
      color: "from-rose-700 to-pink-500"
    }
  ];

  return (
    <div className="mt-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/70 hover:text-white"
            onClick={onGoBack}
          >
            <ArrowLeftCircle className="h-4 w-4 mr-1" />
            Back to Markets
          </Button>
        </div>
        <h2 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent">{formatMarketName(market)} Market</span>
        </h2>
        <p className="text-white/70 mt-1">Select your betting type from the options below</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {betTypes.map((betType) => (
          <Card 
            key={betType.id}
            className="bg-surface border border-white/5 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
            style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}
            onClick={() => onSelectBetType(betType.id)}
          >
            <div className={`h-28 bg-gradient-to-br ${betType.color} flex flex-col items-center justify-center`}>
              {betType.icon}
              <h3 className="text-xl font-bold text-white mt-2">{betType.name}</h3>
            </div>
            <CardContent className="p-5">
              <p className="text-white/70 text-sm mb-4">
                {betType.description}
              </p>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-white/50">Multiplier:</span>
                  <span className="text-sm font-bold text-primary">
                    {betType.multiplier}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  Select
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BetTypeSelection;