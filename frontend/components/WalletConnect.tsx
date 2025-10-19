"use client";

import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/lib/utils";

export default function WalletConnect() {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  } = useWallet();

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        style={{
          padding: "8px 16px",
          backgroundColor: "#333",
          color: "white",
          border: "1px solid #555",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        Connect Wallet
      </button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "13px", color: "#555" }}>
          {address && formatAddress(address)}
        </span>
        <button
          onClick={switchToSepolia}
          style={{
            padding: "7px 12px",
            backgroundColor: "#e67e22",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Switch to Sepolia
        </button>
        <button
          onClick={disconnectWallet}
          style={{
            padding: "7px 12px",
            backgroundColor: "#ddd",
            color: "#333",
            border: "1px solid #bbb",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{ fontSize: "13px", color: "#444" }}>
        {address && formatAddress(address)}
      </span>
      <button
        onClick={disconnectWallet}
        style={{
          padding: "7px 12px",
          backgroundColor: "#ddd",
          color: "#333",
          border: "1px solid #bbb",
          cursor: "pointer",
          fontSize: "13px",
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
