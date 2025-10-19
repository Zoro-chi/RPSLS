"use client";

import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import GameCreator from "@/components/GameCreator";
import GameJoiner from "@/components/GameJoiner";
import GameRevealer from "@/components/GameRevealer";

export default function Home() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fafafa" }}>
      <header className="bg-white" style={{ borderBottom: "1px solid #ddd" }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold" style={{ color: "#333" }}>
            Rock Paper Scissors Lizard Spock
          </h1>
          <WalletConnect />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">
        <div className="mb-5">
          <div
            className="flex gap-2 pb-1"
            style={{ borderBottom: "2px solid #e0e0e0" }}
          >
            <button
              onClick={() => setActiveTab("create")}
              className={`px-3 py-2 text-sm`}
              style={{
                borderBottom:
                  activeTab === "create" ? "3px solid #4a90e2" : "none",
                color: activeTab === "create" ? "#4a90e2" : "#666",
                fontWeight: activeTab === "create" ? 600 : 400,
                marginBottom: "-2px",
              }}
            >
              Create Game
            </button>
            <button
              onClick={() => setActiveTab("join")}
              className={`px-3 py-2 text-sm`}
              style={{
                borderBottom:
                  activeTab === "join" ? "3px solid #4a90e2" : "none",
                color: activeTab === "join" ? "#4a90e2" : "#666",
                fontWeight: activeTab === "join" ? 600 : 400,
                marginBottom: "-2px",
              }}
            >
              Join Game
            </button>
            <button
              onClick={() => setActiveTab("reveal")}
              className={`px-3 py-2 text-sm`}
              style={{
                borderBottom:
                  activeTab === "reveal" ? "3px solid #4a90e2" : "none",
                color: activeTab === "reveal" ? "#4a90e2" : "#666",
                fontWeight: activeTab === "reveal" ? 600 : 400,
                marginBottom: "-2px",
              }}
            >
              Reveal Move
            </button>
          </div>
        </div>

        <div className="mb-6">
          {activeTab === "create" && <GameCreator />}
          {activeTab === "join" && <GameJoiner />}
          {activeTab === "reveal" && <GameRevealer />}
        </div>

        <footer className="text-center text-xs mt-8" style={{ color: "#999" }}>
          <p>Sepolia Testnet</p>
        </footer>
      </main>
    </div>
  );
}
