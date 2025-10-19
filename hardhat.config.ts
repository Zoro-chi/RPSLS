import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "dotenv/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.4.26",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.SEPOLIA_RPC_URL?.trim() || "",
      accounts: process.env.SEPOLIA_PRIVATE_KEY
        ? [
            (() => {
              const key = process.env.SEPOLIA_PRIVATE_KEY.trim().replace(
                /['"]/g,
                ""
              );
              return key.startsWith("0x") ? key : `0x${key}`;
            })(),
          ]
        : [],
    },
  },
};

export default config;
