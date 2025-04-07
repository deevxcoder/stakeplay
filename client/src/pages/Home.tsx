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
    <div className="flex flex-col min-h-screen bg-background text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 overflow-auto">
        {/* Game Tabs */}
        <GameTabs activeGame={activeGame} onChangeGame={handleChangeGame} />

        {/* Game Containers */}
        <div className="game-containers">
          {activeGame === "matka" ? (
            <SattaMatkaGame />
          ) : (
            <CoinTossGame />
          )}
        </div>

        {/* Bets History */}
        <BetsHistory />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
