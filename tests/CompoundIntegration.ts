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
      aapl = newLocal.aaplToken;
      cAAPL = newLocal.cAAPLdelegator;
      cUSDC = newLocal.cUSDC;
      unitAsComp = newLocal.unitAsComp;
      usdc = newLocal.usdc;
  });




  describe("With Compound", async function () {

    it("AAPL is controllable",async () => {
      expect(await aapl.isControllable()).to.eq(true);

    })
    it("Has 2 markets",async () => {
      
      expect(await unitAsComp.getAllMarkets()).to.length(2);

    })


    it("Investor1 can borrow ERC20 with ERC1400 as collateral", async function () {

      const [deployer, investor1, investor2] = await ethers.getSigners();


      // // set partition controller
      // const setPartitionControllersTx = await aapl.setPartitionControllers(partition1, [cAAPL.address]);
      // await setPartitionControllersTx.wait();

      
      // Issue 1000 aapl to investor1
      const issue = await aapl.issue(investor1.address, BigNumber.from(1000), "0x");
      await issue.wait();



      // const defaultPartition = await aapl.getDefaultPartitions();
      // console.log(`default partitions: ${defaultPartition.map((x) => x)}`)

      // approveByPartition
      const approveTx = await aapl.
        connect(investor1).
        approveByPartition(partition1, cAAPL.address, BigNumber.from(1000));

      await approveTx.wait();
      
      // unlimited approval to operator
      // const allowOperatorForPartition1 = await aapl.
      //     connect(investor1).
      //     authorizeOperatorByPartition(partition1, cAAPL.address);
      // await allowOperatorForPartition1.wait();

      // or set operator
      // const setControllersTx = await aapl.setControllers([deployer.address, cAAPL.address]);
      // await setControllersTx.wait();

      // console.log(`is operator? : ${await aapl.isOperator(cAAPL.address, investor1.address)}`)


      const mintcAaplTx = await cAAPL.connect(investor1).
        mint(BigNumber.from(100));
      await mintcAaplTx.wait();

      const cTokenBalanceInvestor1 = await cAAPL.balanceOf(investor1.address);

      console.log(`cTokenBalanceInvestor1: ${cTokenBalanceInvestor1}`)

      const aaplBalanceInvestor1 = await aapl.balanceOf(investor1.address);
      console.log(`aaplBalanceInvestor1: ${aaplBalanceInvestor1}`)


      /// Investor 2 mint, allow, enter

      const mintUsdcTx = await usdc.mint(investor2.address, 1_000_000);
      await mintUsdcTx.wait();

      const allowUsdcTx = await usdc.connect(investor2).approve(cUSDC.address, 1_000_000);
      await allowUsdcTx.wait();

      const mintCusdcTx = await cUSDC.connect(investor2).mint(1_000_000);
      await mintCusdcTx.wait();

      const enterMarkets1Tx = await unitAsComp.connect(investor1).enterMarkets([cAAPL.address]);
      await enterMarkets1Tx.wait();


      const enterMarkets2Tx = await unitAsComp.connect(investor2).enterMarkets([cUSDC.address]);
      await enterMarkets2Tx.wait();

    

      console.log(`cusdc balance of investor2: ${await cUSDC.balanceOf(investor2.address)}`);
      console.log(` usdc balance of investor2: ${await usdc.balanceOf(investor2.address)}`);

      // There is 1m usdc to borrow

      const cusdcmarket = await unitAsComp.markets(cUSDC.address);
      console.log({cusdcmarket});


      const caaplmarket = await unitAsComp.markets(cAAPL.address);
      console.log({caaplmarket});

      

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
      console.log({accountLiquidityInvestor1})

      const accountLiquidityInvestor2 = await unitAsComp.getAccountLiquidity(investor2.address);
      console.log({accountLiquidityInvestor2})


    });

  });



});
