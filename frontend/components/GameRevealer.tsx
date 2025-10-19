"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import {
  RPS_ABI,
  MOVES,
  MOVE_NAMES,
  MOVE_EMOJIS,
  doesMove1Win,
} from "@/lib/contract";
import { formatAddress, formatEther } from "@/lib/utils";
import type { GameData } from "@/types/game";

interface SavedGame {
  contractAddress: string;
  move: number;
  salt: string;
  commitment: string;
  player2Address: string;
  stakeAmount: string;
  timestamp: string;
}

export default function GameRevealer() {
  const { signer, address, isConnected, isCorrectNetwork } = useWallet();
  const [contractAddress, setContractAddress] = useState("");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // load saved game from localStorage when contract address changes
  useEffect(() => {
    if (contractAddress) {
      const savedGames = JSON.parse(localStorage.getItem("rpsGames") || "[]");
      const game = savedGames.find(
        (g: SavedGame) =>
          g.contractAddress.toLowerCase() === contractAddress.toLowerCase()
      );
      setSavedGame(game || null);
    }
  }, [contractAddress]);

  const loadGameData = async () => {
    if (!signer || !ethers.isAddress(contractAddress)) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);

      const [stake, player1, player2, commitmentHash, player2Move, lastAction] =
        await Promise.all([
          contract.stake(),
          contract.j1(),
          contract.j2(),
          contract.c1Hash(),
          contract.c2(),
          contract.lastAction(),
        ]);

      const timeout = await contract.TIMEOUT();

      setGameData({
        contractAddress,
        stake: BigInt(stake.toString()),
        player1,
        player2,
        commitmentHash,
        player2Move: Number(player2Move),
        lastAction: BigInt(lastAction.toString()),
        timeout: BigInt(timeout.toString()),
      });
    } catch (error: any) {
      console.error("Error loading game data:", error);
      alert(`Failed to load game: ${error.message || "Unknown error"}`);
      setGameData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReveal = async () => {
    if (!signer || !gameData || !savedGame || !address) return;

    // check player 1
    if (address.toLowerCase() !== gameData.player1.toLowerCase()) {
      alert("You are not Player 1 for this game!");
      return;
    }

    if (gameData.player2Move === MOVES.NULL) {
      alert("Player 2 hasn't joined yet!");
      return;
    }

    setIsRevealing(true);
    try {
      const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);
      const tx = await contract.solve(savedGame.move, savedGame.salt);

      console.log("Transaction sent:", tx.hash);
      setTxHash(tx.hash);
      await tx.wait();

      // figure out who won
      const player1Move = savedGame.move;
      const player2Move = gameData.player2Move;

      let winnerText: string;
      if (player1Move === player2Move) {
        winnerText = "It's a Tie!";
      } else if (doesMove1Win(player1Move, player2Move)) {
        winnerText = `Player 1 Wins! (${MOVE_NAMES[player1Move]} beats ${MOVE_NAMES[player2Move]})`;
      } else {
        winnerText = `Player 2 Wins! (${MOVE_NAMES[player2Move]} beats ${MOVE_NAMES[player1Move]})`;
      }

      setWinner(winnerText);
      alert(`Move revealed successfully!\n\n${winnerText}`);
    } catch (error: any) {
      console.error("Error revealing move:", error);
      alert(`Failed to reveal move: ${error.message || "Unknown error"}`);
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #ddd",
        padding: "17px",
      }}
    >
      <h2
        style={{
          fontSize: "17px",
          fontWeight: "bold",
          marginBottom: "14px",
          color: "#333",
        }}
      >
        Reveal Move
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              color: "#444",
              marginBottom: "6px",
            }}
          >
            Contract Address
          </label>
          <div style={{ display: "flex", gap: "7px" }}>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              style={{
                flex: 1,
                padding: "9px 11px",
                border: "1px solid #ccc",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              onClick={loadGameData}
              disabled={isLoading || !isConnected || !isCorrectNetwork}
              style={{
                padding: "9px 15px",
                backgroundColor:
                  isLoading || !isConnected || !isCorrectNetwork
                    ? "#999"
                    : "#4a90e2",
                color: "white",
                border: "none",
                cursor:
                  isLoading || !isConnected || !isCorrectNetwork
                    ? "not-allowed"
                    : "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              {isLoading ? "Loading..." : "Load"}
            </button>
          </div>
        </div>

        {gameData && (
          <>
            <div style={{ border: "1px solid #ddd", padding: "13px" }}>
              <h3
                style={{
                  fontWeight: "600",
                  marginBottom: "9px",
                  fontSize: "14px",
                }}
              >
                Game Info
              </h3>
              <p
                style={{ fontSize: "13px", color: "#333", marginBottom: "5px" }}
              >
                <strong>Player 1:</strong> {formatAddress(gameData.player1)}
              </p>
              <p
                style={{ fontSize: "13px", color: "#333", marginBottom: "5px" }}
              >
                <strong>Player 2:</strong> {formatAddress(gameData.player2)}
              </p>
              <p
                style={{ fontSize: "13px", color: "#333", marginBottom: "5px" }}
              >
                <strong>Stake:</strong> {formatEther(gameData.stake)} ETH
              </p>
              <p style={{ fontSize: "13px", color: "#333" }}>
                <strong>Player 2 Move:</strong>
                {gameData.player2Move === MOVES.NULL ? (
                  <span style={{ color: "#ff8c00" }}>Not played yet</span>
                ) : (
                  <span>
                    {MOVE_EMOJIS[gameData.player2Move]}
                    {MOVE_NAMES[gameData.player2Move]}
                  </span>
                )}
              </p>
            </div>

            {savedGame && (
              <div style={{ border: "1px solid #ddd", padding: "12px" }}>
                <h3
                  style={{
                    fontWeight: "600",
                    marginBottom: "7px",
                    fontSize: "14px",
                  }}
                >
                  Your Move (Hidden)
                </h3>
                <p style={{ fontSize: "13px", color: "#333" }}>
                  {MOVE_EMOJIS[savedGame.move]} {MOVE_NAMES[savedGame.move]}
                </p>
              </div>
            )}

            {!savedGame && (
              <div style={{ border: "1px solid #ddd", padding: "11px" }}>
                <p style={{ fontSize: "13px", color: "#555" }}>
                  No saved data found. You'll need to enter your move and salt
                  manually.
                </p>
              </div>
            )}

            {gameData.player2Move !== MOVES.NULL && savedGame && !winner && (
              <button
                onClick={handleReveal}
                disabled={isRevealing || !isConnected || !isCorrectNetwork}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor:
                    isRevealing || !isConnected || !isCorrectNetwork
                      ? "#999"
                      : "#7c3aed",
                  color: "white",
                  border: "none",
                  cursor:
                    isRevealing || !isConnected || !isCorrectNetwork
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginTop: "5px",
                }}
              >
                {isRevealing ? "Revealing..." : "Reveal & Determine Winner"}
              </button>
            )}

            {winner && (
              <div style={{ border: "1px solid #ddd", padding: "15px" }}>
                <h3
                  style={{
                    fontWeight: "600",
                    marginBottom: "10px",
                    textAlign: "center",
                    fontSize: "15px",
                  }}
                >
                  Game Complete
                </h3>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {winner}
                </p>
                {txHash && (
                  <div style={{ marginTop: "12px", textAlign: "center" }}>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#4a90e2",
                        fontSize: "13px",
                        textDecoration: "underline",
                      }}
                    >
                      View on Etherscan
                    </a>
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "11px",
                        color: "#666",
                      }}
                    >
                      Check transaction to see ETH transfer
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
