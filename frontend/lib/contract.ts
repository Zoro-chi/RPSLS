export const RPS_ABI = [
  "constructor(bytes32 _c1Hash, address _j2) payable",
  "function stake() view returns (uint256)",
  "function j1() view returns (address)",
  "function j2() view returns (address)",
  "function c1Hash() view returns (bytes32)",
  "function c2() view returns (uint8)",
  "function lastAction() view returns (uint256)",
  "function TIMEOUT() view returns (uint256)",
  "function play(uint8 _c2) payable",
  "function solve(uint8 _c1, uint256 _salt)",
  "function j2Timeout()",
  "function j1Timeout()",
] as const;

// Default deployed game contract address
export const DEFAULT_CONTRACT_ADDRESS =
  "0x2EF372c1C72AB640a44e3bA76EaaAE872202b7A2";

export const SEPOLIA_CHAIN_ID = 11155111;

export const MOVES = {
  NULL: 0,
  ROCK: 1,
  PAPER: 2,
  SCISSORS: 3,
  SPOCK: 4,
  LIZARD: 5,
} as const;

export const MOVE_NAMES: Record<number, string> = {
  0: "None",
  1: "Rock",
  2: "Paper",
  3: "Scissors",
  4: "Spock",
  5: "Lizard",
};

export const MOVE_EMOJIS: Record<number, string> = {
  0: "❓",
  1: "🪨",
  2: "📄",
  3: "✂️",
  4: "🖖",
  5: "🦎",
};

// check who wins
export function doesMove1Win(move1: number, move2: number) {
  if (move1 === move2) return false;

  // what beats what
  const wins: any = {
    1: [3, 5], // rock
    2: [1, 4], // paper
    3: [2, 5], // scissors
    4: [3, 1], // spock
    5: [4, 2], // lizard
  };

  if (wins[move1] && wins[move1].includes(move2)) return true;
  return false;
}
