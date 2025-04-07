import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameSelection from "@/components/GameSelection";
import SattaMatkaGame from "@/components/SattaMatkaGame";
import CoinTossGame from "@/components/CoinTossGame";
import BetsHistory from "@/components/BetsHistory";
import MatkaMarkets, { MarketType } from "@/components/MatkaMarkets";
import BetTypeSelection, { BetType } from "@/components/BetTypeSelection";

type GameType = "matka" | "coin";

// Define navigation states
type NavState = "selection" | "game" | "markets" | "betType";

const Home: React.FC = () => {
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
    <div className="flex flex-col min-h-screen text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 overflow-auto">
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
        
        {/* Game Navigation */}
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

        {/* Bets History */}
        <div className="max-w-6xl mx-auto">
          <BetsHistory />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
