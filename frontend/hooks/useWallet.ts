"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { SEPOLIA_CHAIN_ID } from "@/lib/contract";
import type { WalletState } from "@/types/game";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
  });
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const updateWalletState = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.listAccounts();
      const network = await browserProvider.getNetwork();

      if (accounts.length > 0) {
        const signer = await browserProvider.getSigner();
        setProvider(browserProvider);
        setSigner(signer);
        setWalletState({
          address: accounts[0].address,
          chainId: Number(network.chainId),
          isConnected: true,
        });
      } else {
        setProvider(null);
        setSigner(null);
        setWalletState({
          address: null,
          chainId: null,
          isConnected: false,
        });
      }
    } catch (error) {
      console.error("wallet state error:", error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Install MetaMask first!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      updateWalletState();
    } catch (error) {
      console.error("connect error:", error);
      alert("Failed to connect wallet");
    }
  }, [updateWalletState]);

  const disconnectWallet = useCallback(() => {
    // just clear everything
    setProvider(null);
    setSigner(null);
    setWalletState({
      address: null,
      chainId: null,
      isConnected: false,
    });
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
      updateWalletState();
    } catch (error: any) {
      // chain not added yet, so add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "SEP",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          updateWalletState();
        } catch (addError) {
          console.error("cant add sepolia:", addError);
        }
      } else {
        console.error("switch error:", error);
      }
    }
  }, [updateWalletState]);

  useEffect(() => {
    if (!window.ethereum) return;

    updateWalletState();

    // listen to metamask events
    const handleAccountsChanged = () => updateWalletState();
    const handleChainChanged = () => updateWalletState();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [updateWalletState]);

  return {
    ...walletState,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    isCorrectNetwork: walletState.chainId === SEPOLIA_CHAIN_ID,
  };
}
