# ERC1400 and Compound integration

This proof of concept shows how to integrate the ERC1400 token standard interface as a collateral in the Compound protocol. It comes with the Compound protocol found here: 

- The contracts for the ERC1400 implementation are from [here](https://github.com/SecurityTokenStandard/EIP-Spec).
- The compound protocol can be found [here](https://github.com/compound-finance/compound-protocol).








compound-fork

erc1400 $1400
usdc-fork $1



https://tokeny.com/erc3643-vs-erc1400/

https://github.com/ethereum/eips/issues/1411

In deploy:

Deploy token USDC (ERC20)
Deploy token ERC1400

Deploy oracle with 2 prices:

USDC, 1$
ERC1400, 1400$

Deploy Comptroller and compound

## My assumption ##

From what I understand about ERC1400; It is a Security standard for fungible tokens like ERC20 to make them Un-fungible. You can lock them up in so called partitions or tranches. The partitions can be controlled or operated. There can be 0 or more default partitions which are always fungible unless there are 0 default partitions and they are locked. The ERC1400 token can represent an asset held by a custodian by the token holder. Therefore the ERC1400 token can only be hold by a token holder and not a smart contract.


## A possible solution ##

For the integration with the Compound protocol I had to create a new implementation for the CToken, the CErc1400, to handle the new ERC1400 token based on the assumptions above. Normally a lender of tokens deposits an ERC20 token like USDC or wBTC into the CToken contract with the `mint` function. The ERC20 tokens are locked in the contract and a cToken is minted. Because the ERC1400 token cannot `leave` the address of the owner, the tokens are not transferred, but locked up in a partition controlled by the CToken contract. The investor receives it's cTokens, but cannot transfer the locked ERC1400 tokens anymore. To move the ERC1400 out of the locked partiton (redeem), the user needs to repay the cTokens. The cToken contract will then unlock the ERC1400 tokens by moving them from the locked partition to the default partition.


## Verification ##


As a verification method I created several Unit- and Integration-tests. 
The CErc1400.sol contract can be tested by running the tests:


```
yarn hardhat test tests/LockAndUnlock.ts 

```

For the integration test with the compound protocol:

```
yarn hardhat test tests/CompoundIntegration.ts 
```

In the integration test there are 2 investors; investor1 and investor2. Investor2 provides 1000000 usdc tokens to the protocol. Investor1 Uses 100 of his 1000 APPL tokens as a collateral to borrow 1000 usdc tokens. 





## Out-of-scopes ##

This PoC focuses primarely on the collateralization of the ERC1400 standard. Liquidations or borrowing of ERC1400 are therefore out of scope. The 1820 registry is also out of scope.

