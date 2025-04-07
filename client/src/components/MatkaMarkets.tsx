import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowLeftCircle, ArrowRightCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import market banner images
import galiMarketBanner from "../assets/gali-banner.svg";
import mumbaiMarketBanner from "../assets/mumbai-banner.svg";
import dishawarMarketBanner from "../assets/dishawar-banner.svg";

export type MarketType = "gali" | "dishawar" | "mumbai";

// Interface for market details
interface Market {
  id: MarketType;
  name: string;
  description: string;
  openTime: string;
  closeTime: string;
  status: "open" | "closed" | "results";
  remainingTime: string;
  color: string;
}

interface MatkaMarketsProps {
  onSelectMarket: (market: MarketType) => void;
  onGoBack: () => void;
}

const MatkaMarkets: React.FC<MatkaMarketsProps> = ({ onSelectMarket, onGoBack }) => {
  // Market banner mapping
  const marketBanners = {
    gali: galiMarketBanner,
    dishawar: dishawarMarketBanner,
    mumbai: mumbaiMarketBanner
  };

  // Mock markets data (in a real app, this would come from an API)
  const [markets] = useState<Market[]>([
    {
      id: "gali",
      name: "Gali Market",
      description: "Popular evening market with frequent payouts",
      openTime: "3:00 PM",
      closeTime: "5:00 PM",
      status: "open",
      remainingTime: "1h 22m",
      color: "from-emerald-700 to-green-500"
    },
    {
      id: "dishawar",
      name: "Dishawar Market",
      description: "Morning market with consistent results",
      openTime: "9:00 AM",
      closeTime: "11:00 AM",
      status: "results",
      remainingTime: "0h 0m",
      color: "from-blue-700 to-cyan-500"
    },
    {
      id: "mumbai",
      name: "Mumbai Market",
      description: "Main market with highest volume of bets",
      openTime: "12:00 PM",
      closeTime: "2:00 PM",
      status: "closed",
      remainingTime: "18h 45m",
      color: "from-rose-700 to-pink-500"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <div className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-medium flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Open for Betting
          </div>
        );
      case "closed":
        return (
          <div className="px-3 py-1 rounded-full bg-rose-600/20 text-rose-400 text-xs font-medium flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Closed
          </div>
        );
      case "results":
        return (
          <div className="px-3 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-medium flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Results Declared
          </div>
        );
      default:
        return null;
    }
  };

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
            Back to Games
          </Button>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
          Satta Matka Markets
        </h2>
        <p className="text-white/70 mt-1">Select a market to place your bet</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <Card 
            key={market.id}
            className="bg-surface border border-white/5 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
            style={{ boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}
            onClick={() => onSelectMarket(market.id)}
          >
            <div className="h-40 relative overflow-hidden">
              <img 
                src={marketBanners[market.id]} 
                alt={`${market.name} Banner`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{market.name}</h3>
              </div>
              <div className="absolute top-2 right-2">
                {getStatusBadge(market.status)}
              </div>
            </div>
            <CardContent className="p-5">
              <p className="text-white/70 text-sm mb-4">
                {market.description}
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 rounded p-2">
                  <div className="text-white/50 mb-1">Open Time</div>
                  <div className="font-medium">{market.openTime}</div>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <div className="text-white/50 mb-1">Close Time</div>
                  <div className="font-medium">{market.closeTime}</div>
                </div>
              </div>
              
              {market.status === "open" && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-white/70">
                    <Timer className="h-4 w-4 mr-1.5 text-primary" />
                    <span>Closes in: <span className="text-primary font-medium">{market.remainingTime}</span></span>
                  </div>
                  <div className="flex items-center text-primary">
                    Play Now
                    <ArrowRightCircle className="h-4 w-4 ml-1" />
                  </div>
                </div>
              )}
              
              {market.status === "closed" && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-white/70">
                    <Timer className="h-4 w-4 mr-1.5 text-amber-400" />
                    <span>Opens in: <span className="text-amber-400 font-medium">{market.remainingTime}</span></span>
                  </div>
                  <div className="text-white/50 text-sm">
                    Market Closed
                  </div>
                </div>
              )}
              
              {market.status === "results" && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-white/70">
                    <div className="text-emerald-400 text-sm font-semibold">
                      Results Available
                    </div>
                  </div>
                  <div className="flex items-center text-emerald-400">
                    View Results
                    <ArrowRightCircle className="h-4 w-4 ml-1" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MatkaMarkets;