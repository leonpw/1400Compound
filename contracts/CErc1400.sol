// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "./CToken.sol";
import "./CTokenInterfaces.sol";
import "./EIP1400Interface.sol";

interface CompLike {
    function delegate(address delegatee) external;
}


      
/**
 * @title Compound's CErc1400 Contract
 * @notice CTokens which wrap an EIP-1400 underlying
 * @author Compound
 */
contract CErc1400 is CToken, CErc1400Interface {

    bytes32 public constant moveTo = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    bytes32 public constant locked = 0x6c6f636b65640000000000000000000000000000000000000000000000000000; // partition 3, locked
    bytes32 public constant partition1 = 0x7265736572766564000000000000000000000000000000000000000000000000; // default partition
    
    /**
     * @notice Initialize the new money market
     * @param underlying_ The address of the underlying asset
     * @param comptroller_ The address of the Comptroller
     * @param interestRateModel_ The address of the interest rate model
     * @param initialExchangeRateMantissa_ The initial exchange rate, scaled by 1e18
     * @param name_ ERC-1400 name of this token
     * @param symbol_ ERC-1400 symbol of this token
     * @param decimals_ ERC-1400 decimal precision of this token
     */
    function initialize(address underlying_,
                        ComptrollerInterface comptroller_,
                        InterestRateModel interestRateModel_,
                        uint initialExchangeRateMantissa_,
                        string memory name_,
                        string memory symbol_,
                        uint8 decimals_) public {
        // CToken initialize does the bulk of the work
        super.initialize(comptroller_, interestRateModel_, initialExchangeRateMantissa_, name_, symbol_, decimals_);

        // Set underlying and sanity check it
        underlying = underlying_;
        EIP20Interface(underlying).totalSupply();
    }


    
    /*** User Interface ***/

    /**
     * @notice Sender supplies assets into the market and receives cTokens in exchange
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param mintAmount The amount of the underlying asset to supply
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function mint(uint mintAmount) override external returns (uint) {
        mintInternal(mintAmount);
        return NO_ERROR;
    }

    /**
     * @notice Sender redeems cTokens in exchange for the underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemTokens The number of cTokens to redeem into underlying
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeem(uint redeemTokens) override external returns (uint) {
        redeemInternal(redeemTokens);
        return NO_ERROR;
    }

    /**
     * @notice Sender redeems cTokens in exchange for a specified amount of underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemAmount The amount of underlying to redeem
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeemUnderlying(uint redeemAmount) override external returns (uint) {
        redeemUnderlyingInternal(redeemAmount);
        return NO_ERROR;
    }

    /**
      * @notice Sender borrows assets from the protocol to their own address
      * @param borrowAmount The amount of the underlying asset to borrow
      * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
      */
    function borrow(uint borrowAmount) override external returns (uint) {
        borrowInternal(borrowAmount);
        return NO_ERROR;
    }

    /**
     * @notice Sender repays their own borrow
     * @param repayAmount The amount to repay, or -1 for the full outstanding amount
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrow(uint repayAmount) override external returns (uint) {
        repayBorrowInternal(repayAmount);
        return NO_ERROR;
    }

    /**
     * @notice Sender repays a borrow belonging to borrower
     * @param borrower the account with the debt being payed off
     * @param repayAmount The amount to repay, or -1 for the full outstanding amount
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrowBehalf(address borrower, uint repayAmount) override external returns (uint) {
        repayBorrowBehalfInternal(borrower, repayAmount);
        return NO_ERROR;
    }

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @param borrower The borrower of this cToken to be liquidated
     * @param repayAmount The amount of the underlying borrowed asset to repay
     * @param cTokenCollateral The market in which to seize collateral from the borrower
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function liquidateBorrow(address borrower, uint repayAmount, CTokenInterface cTokenCollateral) override external returns (uint) {
        liquidateBorrowInternal(borrower, repayAmount, cTokenCollateral);
        return NO_ERROR;
    }

    /**
     * @notice A public function to sweep accidental ERC-1400 transfers to this contract. Tokens are sent to admin (timelock)
     * @param token The address of the ERC-1400 token to sweep
     */
    function sweepToken(EIP20NonStandardInterface token) override external {
        require(msg.sender == admin, "CErc1400::sweepToken: only admin can sweep tokens");
        require(address(token) != underlying, "CErc1400::sweepToken: can not sweep underlying token");
        uint256 balance = token.balanceOf(address(this));
        token.transfer(admin, balance);
    }

    /**
     * @notice The sender adds to reserves.
     * @param addAmount The amount fo underlying token to add as reserves
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves(uint addAmount) override external returns (uint) {
        return _addReservesInternal(addAmount);
    }

    /*** Safe Token ***/

    /**
     * @notice Gets balance of this contract in terms of the underlying
     * @dev This excludes the value of the current message, if any
     * @return The quantity of underlying tokens owned by this contract
     */
    function getCashPrior() virtual override internal view returns (uint) {
        
        EIP1400Interface token  = EIP1400Interface(underlying);
        return token.totalSupplyByPartition(locked);
        
    }

    /**
     * @dev Locks the ERC1400 tokens in the partition 'locked'. The user cannot move the tokens anymore.
     */
    function doTransferIn(address from, uint amount) virtual override internal returns (uint) {
        // Read from storage once
        address underlying_ = underlying;
        
        uint256 balanceBefore = EIP1400Interface(underlying_).balanceOfByPartition(locked, from);
      
        EIP1400Interface(underlying_).operatorTransferByPartition(
            partition1,
            from,
            from,
            amount,
            abi.encode(moveTo, locked),
            abi.encode(1)
        );

        uint256 balanceAfter = EIP1400Interface(underlying_).balanceOfByPartition(locked, from);
        return balanceAfter - balanceBefore;   
    }

    /**
     * @dev Unlocks the ERC1400 tokens. Moves the tokens from partition 'locked' to partition1. Locked tokens cannot be transfered.
     */
    function doTransferOut(address payable to, uint amount) virtual override internal {
    
       address underlying_ = underlying;
      
        bytes32 destinationPartition = EIP1400Interface(underlying_).operatorTransferByPartition(
            locked,
            to,
            to,
            amount,
            abi.encode(moveTo, partition1),
            abi.encode(1)
        );

        require(destinationPartition == partition1, "TOKEN_TRANSFER_OUT_FAILED");
        
    }

    /**
    * @notice Admin call to delegate the votes of the COMP-like underlying
    * @param compLikeDelegatee The address to delegate votes to
    * @dev CTokens whose underlying are not CompLike should revert here
    */
    function _delegateCompLikeTo(address compLikeDelegatee) external {
        require(msg.sender == admin, "only the admin may set the comp-like delegate");
        CompLike(underlying).delegate(compLikeDelegatee);
    }
}
