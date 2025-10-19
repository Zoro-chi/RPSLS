"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { generateSalt, generateCommitment } from "@/lib/utils";
import { MOVES, MOVE_NAMES, MOVE_EMOJIS } from "@/lib/contract";
import type { GameCommitment } from "@/types/game";
import RPSArtifact from "@/lib/RPS.json";

export default function GameCreator() {
  const { signer, isConnected, isCorrectNetwork } = useWallet();
  const [player2Address, setPlayer2Address] = useState("");
  const [selectedMove, setSelectedMove] = useState<number>(MOVES.ROCK);
  const [stakeAmount, setStakeAmount] = useState("0.0001");
  const [isCreating, setIsCreating] = useState(false);
  const [gameCommitment, setGameCommitment] = useState<GameCommitment | null>(
    null
  );
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  const handleCreateGame = async () => {
    if (!signer || !isConnected || !isCorrectNetwork) {
      alert("Please connect your wallet to Sepolia network");
      return;
    }

    if (!ethers.isAddress(player2Address)) {
      alert("Please enter a valid Ethereum address for Player 2");
      return;
    }

    if (parseFloat(stakeAmount) <= 0) {
      alert("Please enter a valid stake amount");
      return;
    }

    setIsCreating(true);

    try {
      const salt = generateSalt();
      const commitment = generateCommitment(selectedMove, salt);
      const stakeWei = ethers.parseEther(stakeAmount);

      console.log("Creating game with:");
      console.log("Commitment:", commitment);
      console.log("Player 2:", player2Address);
      console.log("Stake:", stakeAmount, "ETH");

      const factory = new ethers.ContractFactory(
        RPSArtifact.abi,
        RPSArtifact.bytecode,
        signer
      );

      const contract = await factory.deploy(commitment, player2Address, {
        value: stakeWei,
      });

      console.log("Transaction sent, waiting for confirmation...");
      await contract.waitForDeployment();

      const contractAddress = await contract.getAddress();
      console.log("Game deployed at:", contractAddress);

      const commitmentData: GameCommitment = {
        move: selectedMove,
        salt,
        commitment,
        player2Address,
        stakeAmount,
        timestamp: new Date().toISOString(),
      };

      setGameCommitment(commitmentData);
      setDeployedAddress(contractAddress);

      // Save to localStorage
      const savedGames = JSON.parse(localStorage.getItem("rpsGames") || "[]");
      savedGames.push({
        ...commitmentData,
        contractAddress,
      });
      localStorage.setItem("rpsGames", JSON.stringify(savedGames));

      alert(`Game created successfully at ${contractAddress}`);
    } catch (error: any) {
      console.error("Error creating game:", error);
      alert(`Failed to create game: ${error.message || "Unknown error"}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #ddd",
        padding: "20px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "15px",
          color: "#333",
        }}
      >
        Create New Game
      </h2>

      {!deployedAddress ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              backgroundColor: "#f0f8ff",
              border: "1px solid #b0d4f1",
              padding: "12px",
            }}
          >
            <p style={{ fontSize: "13px", color: "#333" }}>
              <strong>Note:</strong> You must specify Player 2's address. Only
              that address can join.
            </p>
          </div>

          <div style={{ marginTop: "5px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#444",
                marginBottom: "6px",
              }}
            >
              Player 2 Address
            </label>
            <input
              type="text"
              value={player2Address}
              onChange={(e) => setPlayer2Address(e.target.value)}
              placeholder="0x..."
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ccc",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#666" }}>
              Testing tip: Switch MetaMask accounts and paste that address
            </p>
          </div>

          <div style={{ marginTop: "3px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#444",
                marginBottom: "8px",
              }}
            >
              Your Move
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
              }}
            >
              {[
                MOVES.ROCK,
                MOVES.PAPER,
                MOVES.SCISSORS,
                MOVES.SPOCK,
                MOVES.LIZARD,
              ].map((move) => (
                <button
                  key={move}
                  onClick={() => setSelectedMove(move)}
                  style={{
                    padding: "10px",
                    border:
                      selectedMove === move
                        ? "2px solid #4a90e2"
                        : "1px solid #ccc",
                    backgroundColor:
                      selectedMove === move ? "#e8f4fd" : "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "4px" }}>
                    {MOVE_EMOJIS[move]}
                  </div>
                  <div style={{ fontSize: "11px", color: "#222" }}>
                    {MOVE_NAMES[move]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "2px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#444",
                marginBottom: "7px",
              }}
            >
              Stake Amount (ETH)
            </label>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              step="0.001"
              min="0"
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ccc",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={handleCreateGame}
            disabled={isCreating || !isConnected || !isCorrectNetwork}
            style={{
              width: "100%",
              padding: "10px 15px",
              backgroundColor:
                isCreating || !isConnected || !isCorrectNetwork
                  ? "#999"
                  : "#28a745",
              color: "white",
              border: "none",
              cursor:
                isCreating || !isConnected || !isCorrectNetwork
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "500",
              fontSize: "14px",
              marginTop: "8px",
            }}
          >
            {isCreating ? "Creating Game..." : "Create Game"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ border: "1px solid #ccc", padding: "15px" }}>
            <h3
              style={{
                fontWeight: "600",
                marginBottom: "10px",
                fontSize: "15px",
              }}
            >
              Game Created
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#333",
                wordBreak: "break-all",
                marginBottom: "8px",
              }}
            >
              <strong>Contract:</strong> {deployedAddress}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#333",
                wordBreak: "break-all",
              }}
            >
              <strong>Player 2:</strong> {gameCommitment!.player2Address}
            </p>
          </div>

          <div style={{ border: "1px solid #ddd", padding: "12px" }}>
            <p style={{ fontSize: "13px", color: "#333", marginBottom: "8px" }}>
              <strong>Next steps:</strong>
            </p>
            <ol
              style={{
                fontSize: "13px",
                color: "#444",
                paddingLeft: "20px",
                lineHeight: "1.6",
              }}
            >
              <li>Share contract address with Player 2</li>
              <li>Wait for them to join</li>
              <li>Reveal your move to determine winner</li>
            </ol>
          </div>

          <div style={{ border: "1px solid #ddd", padding: "12px" }}>
            <p style={{ fontSize: "13px", color: "#333", marginBottom: "5px" }}>
              <strong>Your move:</strong> {MOVE_EMOJIS[gameCommitment!.move]}
              {MOVE_NAMES[gameCommitment!.move]}
            </p>
            <p
              style={{
                fontSize: "11px",
                color: "#555",
                wordBreak: "break-all",
              }}
            >
              <strong>Salt:</strong> {gameCommitment!.salt}
            </p>
            <p style={{ fontSize: "11px", color: "#666", marginTop: "8px" }}>
              (Saved to browser storage)
            </p>
          </div>

          <button
            onClick={() => {
              setDeployedAddress(null);
              setGameCommitment(null);
              setPlayer2Address("");
              setSelectedMove(MOVES.ROCK);
              setStakeAmount("0.001");
            }}
            style={{
              width: "100%",
              padding: "9px",
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Create Another Game
          </button>
        </div>
      )}
    </div>
  );
}
