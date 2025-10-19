import { ethers } from "ethers";

export function generateSalt(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

export function generateCommitment(move: number, salt: string): string {
  return ethers.solidityPackedKeccak256(["uint8", "uint256"], [move, salt]);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(wei: bigint): string {
  return ethers.formatEther(wei);
}

export function parseEtherSafe(value: string): bigint {
  try {
    return ethers.parseEther(value);
  } catch {
    return 0n;
  }
}
