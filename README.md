# Rock Paper Scissors Lizard Spock

Web3 game on Ethereum Sepolia testnet. Two players, ETH stakes, winner takes all.

### What it does

- Player 1 creates a game with a hidden move (commitment scheme).
- Player 2 joins and picks their move.
- Player 1 reveals to see who wins.

Contract handles the logic - Rock beats Scissors and Lizard, Paper beats Rock and Spock, etc.

### Deployed Contract

Sepolia testnet: `0x2EF372c1C72AB640a44e3bA76EaaAE872202b7A2`

### Running the Frontend

The UI is built with Next.js. To run it locally:

```bash
cd frontend
yarn install
yarn run dev
```

Open http://localhost:3000 and connect MetaMask (make sure you're on Sepolia).

Three tabs:

- Create Game - for Player 1 to start a game
- Join Game - for Player 2 to join
- Reveal Move - for Player 1 to reveal and determine winner

Your commitment and salt are saved in browser storage so you don't lose them.

### Setup for Development

Install everything:

```bash
yarn install
```

Copy the .env.example to your .env file and add your RPC URL and private key:

```bash
cp .env.example .env
```

### How the Game Works

- Player 1 picks a move and generates a commitment hash (move + random salt). They deploy the contract with their commitment and Player 2's address.

- Player 2 joins by calling play() with their move and matching the stake.

- Player 1 reveals by calling solve() with their original move and salt. Contract checks the hash matches and determines winner based on game rules.

- If someone doesn't play within the timeout (5 minutes), the other player can claim the funds.

## Nash Equilibrium for RPSLS

#### Note: I researched Nash Equilibrium concept in game theory and applied it to the game.

### Answer

The Nash equilibrium is to play each move with equal probability of 20% each (1/5).

### Why?

RPSLS is a symmetric game. Each move beats 2 others and loses to 2 others:

- Rock beats Scissors & Lizard
- Paper beats Rock & Spock
- Scissors beats Paper & Lizard
- Spock beats Scissors & Rock
- Lizard beats Spock & Paper

Since the game is perfectly balanced, there's no pure strategy that dominates. If you always play Rock, opponent plays Paper. If you always play Paper, opponent plays Scissors. And so on.

The only way to avoid being exploited is to randomize. When you play each move 20% of the time, your opponent can't gain an advantage by changing their strategy.

Expected payoff calculation:

- Win 2/5 of the time (+1)
- Lose 2/5 of the time (-1)
- Tie 1/5 of the time (0)
- Expected value = 0

Both players get 0 expected payoff when playing optimally, which is the definition of Nash equilibrium in a zero sum game.
