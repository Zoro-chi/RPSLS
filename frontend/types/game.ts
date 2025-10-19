export interface GameData {
  contractAddress: string;
  stake: bigint;
  player1: string;
  player2: string;
  commitmentHash: string;
  player2Move: number;
  lastAction: bigint;
  timeout: bigint;
}

// Local save
export interface GameCommitment {
  move: number;
  salt: string;
  commitment: string;
  player2Address: string;
  stakeAmount: string;
  timestamp: string;
}

export type Move = number; // 0-5

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}
