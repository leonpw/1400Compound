import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import setupCompound from "./Helper";
import { CErc1400Delegator, CErc20Delegator, Comptroller, ERC1400, USDC } from "../typechain-types";

const partition1 = '0x7265736572766564000000000000000000000000000000000000000000000000'; // reserved in hex

describe("Compound with ERC1400's", async function () {

  let aapl: ERC1400;
  let usdc: USDC;
  let cAAPL: CErc1400Delegator;
  let cUSDC: CErc20Delegator;
  let unitAsComp: Comptroller;

  before(async function () {

    const newLocal = await loadFixture(setupCompound);
    aapl = newLocal.aapl;
    usdc = newLocal.usdc;
    cAAPL = newLocal.cAAPL;
    cUSDC = newLocal.cUSDC;
    unitAsComp = newLocal.unitAsComp;
  });




  describe("With Compound", async function () {

    it("AAPL is controllable", async () => {
      expect(await aapl.isControllable()).to.eq(true);

    })
    it("Has 2 markets", async () => {

      expect(await unitAsComp.getAllMarkets()).to.length(2);

    })


    it("Investor1 can borrow ERC20 with ERC1400 as collateral", async function () {

      const [deployer, investor1, investor2] = await ethers.getSigners();


      // Issue 1000 aapl to investor1
      (await aapl.issue(investor1.address, BigNumber.from(1000), "0x")).wait();


      // approveByPartition
      (await aapl.
        connect(investor1).
        approveByPartition(partition1, cAAPL.address, BigNumber.from(1000))).wait();


      (await cAAPL.
        connect(investor1).
        mint(BigNumber.from(100))).wait();


      console.log(`cTokenBalanceInvestor1: ${await cAAPL.balanceOf(investor1.address)}`)
      console.log(`aaplBalanceInvestor1: ${await aapl.balanceOf(investor1.address)}`);


      /// Investor 2 mint, allow, entermarkets

      (await usdc.mint(investor2.address, 1_000_000)).wait();
      (await usdc.connect(investor2).approve(cUSDC.address, 1_000_000)).wait();
      (await cUSDC.connect(investor2).mint(1_000_000)).wait();
      (await unitAsComp.connect(investor2).enterMarkets([cUSDC.address])).wait();

      // investor 1 enters market
      (await unitAsComp.connect(investor1).enterMarkets([cAAPL.address])).wait();


      console.log(`cusdc balance of investor2: ${await cUSDC.balanceOf(investor2.address)}`);
      console.log(` usdc balance of investor2: ${await usdc.balanceOf(investor2.address)}`);


      // There is 1m usdc to borrow

      const borrowTx = await cUSDC.connect(investor1).borrow(1_000);
      await borrowTx.wait();

      console.log(`\nOverview of balances investor1`)

      console.log(`  usdc: ${await usdc.balanceOf(investor1.address)}`);
      console.log(`  aapl: ${await aapl.balanceOf(investor1.address)}`);
      console.log(` cusdc: ${await cUSDC.balanceOf(investor1.address)}`);
      console.log(` caapl: ${await cAAPL.balanceOf(investor1.address)}`);

      console.log(`\nOverview of balances investor2`)

      console.log(`  usdc: ${await usdc.balanceOf(investor2.address)}`);
      console.log(`  aapl: ${await aapl.balanceOf(investor2.address)}`);
      console.log(` cusdc: ${await cUSDC.balanceOf(investor2.address)}`);
      console.log(` caapl: ${await cAAPL.balanceOf(investor2.address)}`);


      const accountLiquidityInvestor1 = await unitAsComp.getAccountLiquidity(investor1.address);
      console.log({ accountLiquidityInvestor1 })

      const accountLiquidityInvestor2 = await unitAsComp.getAccountLiquidity(investor2.address);
      console.log({ accountLiquidityInvestor2 })

    });
  });
});
