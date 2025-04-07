import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GameTabs from "@/components/GameTabs";
import SattaMatkaGame from "@/components/SattaMatkaGame";
import CoinTossGame from "@/components/CoinTossGame";
import BetsHistory from "@/components/BetsHistory";

type GameType = "matka" | "coin";

const Home: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType>("matka");

  const handleChangeGame = (game: GameType) => {
    setActiveGame(game);
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
        
        {/* Game Tabs */}
        <GameTabs activeGame={activeGame} onChangeGame={handleChangeGame} />

        {/* Game Containers */}
        <div className="game-containers mb-12">
          {activeGame === "matka" ? (
            <SattaMatkaGame />
          ) : (
            <CoinTossGame />
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
