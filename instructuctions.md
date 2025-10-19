# Rock Paper Scissors Lizard Spock

Note that this exercise is hard, you are expected to spend at least a day on it. If you are new to blockchain and dapps it can take even more.

Make a web3 website to play this extended version of rock paper scissors (See wikipedia article about RPS and additional weapons).
It should allow a party to create a RPS game. The first party creates the game, puts a commitment of his move, selects the other player and stakes some ETH.
The second party pays the same amount of ETH and chooses his move.
The first party reveals his move and the contract distributes the ETH to the winner or splits them in case of a tie.
If some party stops responding there are some timeouts.
You can find the smart contract here: https://github.com/clesaege/RPS/blob/master/RPS.sol (you are not allowed to modify it).

#### You need to:

- Code a web3 page allowing parties to play the game. It should work on metamask using Ethereum testnet (indicate which one).
- Provide us the URL for our test.

#### In order for this to be as short as possible, you don’t need to:

- Write smart contracts.
- Write tests.
- Design a fancy interface (the elements of the interface should be well-thought, but no need to use images, colors or background).
- Make it work for every browser (if it does great but we will just try the one you choose, so don’t worry about it).
- Make it possible to have multiple games (we assume there are never more than 2 parties playing this game).

#### But you do need to:

- Make it secure to prevent people from losing their ETH (think about what could go wrong, which kind of attack a party trying to always win could try, in particular make sure the salt is handled properly).

#### In addition you need to answer:

What is the Mixed strategy Nash equilibria of this game? (you are free to search about “Mixed strategy Nash equilibria” to see what they are)
You can ask questions and advice on our slack. Just use private messages @clesaege to avoid everyone from seeing them.
