# ERC1400 and Compound integration

This proof of concept shows how to integrate the ERC1400 token standard interface as a collateral in the Compound protocol. It comes with the Compound protocol found here: 

- The contracts for the ERC1400 implementation are from [here](https://github.com/SecurityTokenStandard/EIP-Spec).
- The compound protocol can be found [here](https://github.com/compound-finance/compound-protocol).

Based on the following docs.
https://tokeny.com/erc3643-vs-erc1400/

https://github.com/ethereum/eips/issues/1411



## My assumption ##

From what I understand about ERC1400; It is a Security standard for fungible tokens like ERC20 to make them Un-fungible. You can lock them up in so called partitions or tranches. The partitions can be controlled or operated. There can be 0 or more default partitions which are always fungible unless. They are not fungible when there are 0 default partitions. Then they are locked. The ERC1400 token can represent an asset held by a custodian by the token holder. Therefore the ERC1400 token can only be hold by a token holder and not a smart contract.


## A possible solution ##

For the integration with the Compound protocol I had to create a new implementation for the CToken, the CErc1400, to handle the new ERC1400 token based on the assumptions above. Normally a lender of tokens deposits an ERC20 token like USDC or wBTC into the CToken contract with the `mint` function. The ERC20 tokens are locked in the contract and a cToken is minted. Because the ERC1400 token cannot `leave` the address of the owner, the tokens are not transferred, but locked up in a partition controlled by the CToken contract. The investor receives it's cTokens, but cannot transfer the locked ERC1400 tokens anymore. To move the ERC1400 out of the locked partiton (redeem), the user needs to repay the cTokens. The cToken contract will then unlock the ERC1400 tokens by moving them from the locked partition to the default partition.



## Verification ##


As a verification method I created several Unit- and Integration-tests. 
The CErc1400.sol contract can be tested by running the tests:


```
yarn hardhat test tests/Erc1400.ts 
yarn hardhat test tests/LockAndUnlock.ts 

```

For the integration test with the compound protocol:

```
yarn hardhat test tests/CompoundIntegration.ts 
```

In the integration test there are 2 investors; investor1 and investor2. Investor2 provides 1000000 usdc tokens to the protocol. Investor1 Uses 100 of his 1000 APPL tokens as a collateral to borrow 1000 usdc tokens. The setup fixture comes with a simple Oracle with prices pegged to respectively 1 and 1400 dollar for usdc and aapl.


## CErc1400 vs CErc20 ##

One of the notable differences between Cerc1400 and the standard CErc20 is the transfer of underlying tokens. This can be seen in the methods doTransferIn() and doTransferOut(). getCashPrior() calls the totalSupplyByPartition(). 



## Out-of-scopes ##

This PoC focuses primarely on the collateralization of the ERC1400 standard. Liquidations or borrowing of ERC1400 are therefore out of scope. The 1820 registry is also out of scope. The setting and getting of legal documents, another feature of the ERC1400 is also out of scope.



## Verbose ##

The tests comes with a lot of verbose messages. For example the Locking and Unlocking of ERC1400;

```
Locking and Unlocking of ERC1400

Initial balances after issuing 1000 tokens
Total Balances: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8: 1000 Apple INC NASDAQ:AAPL
{ balanceFree: BigNumber { value: "1000" } }
{ balanceLocked: BigNumber { value: "0" } }
Balances after locking tokens
Total Balances: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8: 1000 Apple INC NASDAQ:AAPL
{ balanceFree: BigNumber { value: "746" } }
{ balanceLocked: BigNumber { value: "254" } }
Balances after unlocking tokens
Total Balances: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8: 1000 Apple INC NASDAQ:AAPL
{ balanceFree: BigNumber { value: "1000" } }
{ balanceLocked: BigNumber { value: "0" } }
```

The operator locks and unlocks the tokens of the token holder. The import part is that the total balance of token holder stays 1000. Even if he can't move the tokens.