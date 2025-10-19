import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RPSModule = buildModule("RPSModule", (m) => {
  const commitment = m.getParameter("commitment");
  const player2Address = m.getParameter("player2Address");
  // Hardcoded stake amount: 0.00001 ETH
  const stakeAmount = 10_000_000_000_000n;

  const rps = m.contract("RPS", [commitment, player2Address], {
    value: stakeAmount,
  });

  return { rps };
});

export default RPSModule;
