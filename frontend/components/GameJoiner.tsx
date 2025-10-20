"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { RPS_ABI, MOVES, MOVE_NAMES, MOVE_EMOJIS } from "@/lib/contract";
import { formatAddress, formatEther } from "@/lib/utils";
import type { GameData } from "@/types/game";

export default function GameJoiner() {
  const { signer, address, isConnected, isCorrectNetwork } = useWallet();
  const [contractAddress, setContractAddress] = useState("");
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [selectedMove, setSelectedMove] = useState<number>(MOVES.ROCK);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const loadGameData = async () => {
    if (!signer || !ethers.isAddress(contractAddress)) return;

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);

      // load all game data
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

  const handleJoinGame = async () => {
    if (!signer || !gameData || !address) return;

    // check if this is the right player
    console.log("Your address:", address);
    console.log("Required Player 2 address:", gameData.player2);
    console.log(
      "Match:",
      address.toLowerCase() === gameData.player2.toLowerCase()
    );

    if (address.toLowerCase() !== gameData.player2.toLowerCase()) {
      alert(
        `You are not Player 2 for this game!\n\nYour address: ${address}\nRequired Player 2: ${gameData.player2}\n\nPlease switch to the correct account in MetaMask.`
      );
      return;
    }

    if (gameData.player2Move !== MOVES.NULL) {
      alert("Player 2 has already joined this game!");
      return;
    }

    setIsJoining(true);
    try {
      const contract = new ethers.Contract(contractAddress, RPS_ABI, signer);
      const tx = await contract.play(selectedMove, {
        value: gameData.stake,
      });

      console.log("Transaction sent:", tx.hash);
      await tx.wait();

      alert("Successfully joined the game!");
      // refresh the data
      await loadGameData();
    } catch (error: any) {
      console.error("Error joining game:", error);
      alert(`Failed to join game: ${error.message || "Unknown error"}`);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #ddd",
        padding: "18px",
      }}
    >
      <h2
        style={{
          fontSize: "17px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#333",
        }}
      >
        Join Game
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              color: "#444",
              marginBottom: "5px",
            }}
          >
            Contract Address
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              style={{
                flex: 1,
                padding: "8px 10px",
                border: "1px solid #ccc",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              onClick={loadGameData}
              disabled={isLoading || !isConnected || !isCorrectNetwork}
              style={{
                padding: "8px 14px",
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
            <div style={{ border: "1px solid #ddd", padding: "14px" }}>
              <h3
                style={{
                  fontWeight: "600",
                  marginBottom: "10px",
                  fontSize: "14px",
                }}
              >
                Game Info
              </h3>
              <p
                style={{ fontSize: "13px", color: "#333", marginBottom: "6px" }}
              >
                <strong>Player 1:</strong> {formatAddress(gameData.player1)}
              </p>
              <p
                style={{ fontSize: "13px", color: "#333", marginBottom: "6px" }}
              >
                <strong>Player 2:</strong> {formatAddress(gameData.player2)}
              </p>
              {address && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#333",
                    marginBottom: "6px",
                  }}
                >
                  <strong>Your Address:</strong> {formatAddress(address)}
                  {address.toLowerCase() === gameData.player2.toLowerCase() ? (
                    <span style={{ marginLeft: "8px", color: "#28a745" }}>
                      Correct
                    </span>
                  ) : (
                    <span style={{ marginLeft: "8px", color: "#dc3545" }}>
                      Wrong Account
                    </span>
                  )}
                </p>
              )}
              <p style={{ fontSize: "13px", color: "#333" }}>
                <strong>Stake:</strong> {formatEther(gameData.stake)} ETH
              </p>
              <p style={{ fontSize: "13px", color: "#333" }}>
                <strong>Status:</strong>
                {gameData.player2Move === MOVES.NULL ? (
                  <span style={{ color: "#ff8c00" }}>Waiting for Player 2</span>
                ) : (
                  <span style={{ color: "#28a745" }}>Player 2 has joined</span>
                )}
              </p>
            </div>

            {gameData.player2Move === MOVES.NULL && (
              <>
                <div style={{ marginTop: "4px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#444",
                      marginBottom: "7px",
                    }}
                  >
                    Your Move
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: "7px",
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
                          padding: "11px",
                          border:
                            selectedMove === move
                              ? "2px solid #4a90e2"
                              : "1px solid #ccc",
                          backgroundColor:
                            selectedMove === move ? "#e8f4fd" : "white",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: "22px", marginBottom: "3px" }}>
                          {MOVE_EMOJIS[move]}
                        </div>
                        <div style={{ fontSize: "11px", color: "#222" }}>
                          {MOVE_NAMES[move]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleJoinGame}
                  disabled={isJoining || !isConnected || !isCorrectNetwork}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor:
                      isJoining || !isConnected || !isCorrectNetwork
                        ? "#999"
                        : "#28a745",
                    color: "white",
                    border: "none",
                    cursor:
                      isJoining || !isConnected || !isCorrectNetwork
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginTop: "6px",
                  }}
                >
                  {isJoining
                    ? "Joining..."
                    : `Join Game (${formatEther(gameData.stake)} ETH)`}
                </button>
              </>
            )}

            {gameData.player2Move !== MOVES.NULL && (
              <div style={{ border: "1px solid #ddd", padding: "13px" }}>
                <h3
                  style={{
                    fontWeight: "600",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  Joined!
                </h3>
                <p style={{ fontSize: "13px", color: "#333" }}>
                  <strong>Your Move:</strong>
                  {MOVE_EMOJIS[gameData.player2Move]}
                  {MOVE_NAMES[gameData.player2Move]}
                </p>
                <p
                  style={{ fontSize: "13px", color: "#333", marginTop: "8px" }}
                >
                  Waiting for Player 1 to reveal...
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
