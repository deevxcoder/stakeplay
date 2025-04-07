import React, { useState } from "react";
import GameSelection from "@/components/GameSelection";
import SattaMatkaGame from "@/components/SattaMatkaGame";
import CoinTossGame from "@/components/CoinTossGame";
import BetsHistory from "@/components/BetsHistory";
import MatkaMarkets, { MarketType } from "@/components/MatkaMarkets";
import BetTypeSelection, { BetType } from "@/components/BetTypeSelection";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle } from "lucide-react";

type GameType = "matka" | "coin";

// Define navigation states
type NavState = "selection" | "game" | "markets" | "betType";

const Home: React.FC = () => {
  // Authentication context
  const { user, loginAsDemo } = useAuth();
  
  // Game selection state
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  
  // Navigation state
  const [navState, setNavState] = useState<NavState>("selection");
  
  // Market and bet type states for Satta Matka
  const [selectedMarket, setSelectedMarket] = useState<MarketType>("gali");
  const [selectedBetType, setSelectedBetType] = useState<BetType>("jodi");

  // Handle game selection
  const handleSelectGame = (game: GameType) => {
    setActiveGame(game);
    
    if (game === "matka") {
      setNavState("markets");
    } else {
      setNavState("game");
    }
  };

  // Handle market selection
  const handleSelectMarket = (market: MarketType) => {
    setSelectedMarket(market);
    setNavState("betType");
  };

  // Handle bet type selection
  const handleSelectBetType = (betType: BetType) => {
    setSelectedBetType(betType);
    setNavState("game");
  };

  // Navigation back handlers
  const handleBackToGames = () => {
    setNavState("selection");
    setActiveGame(null);
  };

  const handleBackToMarkets = () => {
    setNavState("markets");
  };

  return (
    <div>
      <main className="container mx-auto px-4 py-8 overflow-auto">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-amber-400 via-primary to-emerald-400 bg-clip-text text-transparent">
            Welcome to StakePlay
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Experience the thrill of virtual betting with our Satta Matka and Coin Toss games. 
            Choose your game, place your bets, and test your luck!
          </p>
        </div>
        
        {/* Game Navigation - Show different content based on authentication */}
        {user ? (
          /* AUTHENTICATED USER VIEW */
          <>
            <div className="game-navigation mb-12">
              {navState === "selection" && (
                <GameSelection onSelectGame={handleSelectGame} />
              )}
              
              {navState === "markets" && activeGame === "matka" && (
                <MatkaMarkets 
                  onSelectMarket={handleSelectMarket} 
                  onGoBack={handleBackToGames} 
                />
              )}
              
              {navState === "betType" && activeGame === "matka" && (
                <BetTypeSelection 
                  market={selectedMarket}
                  onSelectBetType={handleSelectBetType}
                  onGoBack={handleBackToMarkets}
                />
              )}
              
              {navState === "game" && (
                <div>
                  {activeGame === "matka" ? (
                    <div>
                      <div className="mb-4 flex items-center">
                        <button 
                          onClick={handleBackToGames}
                          className="text-white/70 hover:text-white text-sm flex items-center mr-4"
                        >
                          ← Back to Games
                        </button>
                        <span className="text-primary text-sm">
                          Playing Satta Matka / {selectedMarket} Market / {selectedBetType} Bet
                        </span>
                      </div>
                      <SattaMatkaGame
                        initialMarket={selectedMarket}
                        initialBetType={selectedBetType} 
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <button 
                          onClick={handleBackToGames}
                          className="text-white/70 hover:text-white text-sm flex items-center"
                        >
                          ← Back to Games
                        </button>
                      </div>
                      <CoinTossGame />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bets History - Only show for authenticated users */}
            <div className="max-w-6xl mx-auto">
              <BetsHistory />
            </div>
          </>
        ) : (
          /* NON-AUTHENTICATED USER VIEW - Showcase Features */
          <div className="mb-12">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-surface-light rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Sparkles className="text-amber-400 h-5 w-5 mr-2" />
                  <span className="bg-gradient-to-r from-amber-400 to-primary bg-clip-text text-transparent">
                    Exciting Virtual Betting
                  </span>
                </h3>
                <p className="mb-4 text-white/70">
                  Try your luck with our virtual betting games completely risk-free. 
                  With a generous starting balance of 10,000 virtual coins, you can explore 
                  all aspects of the StakePlay experience.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface/60 rounded-lg p-4 border border-white/5">
                    <h4 className="font-medium mb-2">Satta Matka</h4>
                    <p className="text-sm text-white/60">Play the classic Indian luck game with multiple betting options</p>
                  </div>
                  <div className="bg-surface/60 rounded-lg p-4 border border-white/5">
                    <h4 className="font-medium mb-2">Coin Toss</h4>
                    <p className="text-sm text-white/60">Simple heads or tails betting with instant results</p>
                  </div>
                </div>
                <Button 
                  onClick={loginAsDemo} 
                  className="w-full bg-gradient-to-r from-amber-500 to-primary hover:opacity-90"
                >
                  Try Demo Now
                </Button>
              </div>
              
              <div className="bg-surface-light rounded-xl p-6 border border-white/10">
                <div className="flex items-start mb-4">
                  <AlertCircle className="h-5 w-5 text-primary mt-1 mr-2" />
                  <h3 className="text-xl font-bold">Features Showcase</h3>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Multiple betting types for Satta Matka</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Real-time betting history tracking</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Virtual balance management</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Different markets with unique timing</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                    <span>Attractive payout multipliers</span>
                  </li>
                </ul>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                  <p className="font-medium mb-2">Looking to explore without creating an account?</p>
                  <p className="text-white/70">Click the <strong className="text-amber-400">DEMO</strong> badge in the header to instantly start with 10,000 virtual coins!</p>
                </div>
              </div>
            </div>
            
            {/* Game Preview Cards - For non-authenticated users */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GameSelection onSelectGame={() => loginAsDemo()} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
