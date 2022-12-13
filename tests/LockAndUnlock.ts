import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import setupCompound, { changePartitionFlag, partition1, partition3, printBalanceForAllPartitions } from "./Helper";

import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { CErc1400Delegator, CErc20Delegator, Comptroller, CToken, ERC1400, USDC } from "../typechain-types";
import { arrayify } from "ethers/lib/utils";


describe("Locking and Unlocking of ERC1400", async function () {

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


    it("Operator can Lock and Unlock tokens", async function () {

        let [deployer, investor1, investor2, operator] = await ethers.getSigners();

        // issue 1000 aapl tokens to investor1
        const issueTx = await aapl.issue(investor1.address, BigNumber.from(1000), "0x");
        await issueTx.wait();

        console.log(`Initial balances after issuing 1000 tokens`);
        await printBalanceForAllPartitions(aapl, investor1.address);


        // controller can access ALL tokens in partition
        await (await aapl.
            setPartitionControllers(partition3, [operator.address])).wait();



        // allow an operator to transferbypartition
        // this is some sort of 'approval' 
        const allowOperatorForPartition1 = await aapl.connect(investor1).
            authorizeOperatorByPartition(partition1, operator.address);
        await allowOperatorForPartition1.wait();



        const lockTx = await aapl.connect(operator).operatorTransferByPartition(
            partition1,
            investor1.address,
            investor1.address,
            254,
            ethers.utils.concat([(changePartitionFlag), arrayify(partition3)]),
            "0x01"
        );

        const lockTxConfirmed = await lockTx.wait();

        console.log(`Balances after locking tokens`);
        await printBalanceForAllPartitions(aapl, investor1.address);


        const unlockTx = await aapl.connect(operator).operatorTransferByPartition(
            partition3,
            investor1.address,
            investor1.address,
            254,
            ethers.utils.concat([(changePartitionFlag), arrayify(partition1)]),
            "0x01"
        );

        await unlockTx.wait();

        console.log(`Balances after unlocking tokens`);
        await printBalanceForAllPartitions(aapl, investor1.address);

        expect(await aapl.balanceOf(investor1.address)).to.equals((1000));
    })


    it("Investor cannot transfer locked tokens", async function () {
        let [deployer, investor1, investor2, operator] = await ethers.getSigners();

        const issueTx = await aapl.issue(investor2.address, BigNumber.from(1000), "0x");
        await issueTx.wait();

        // controller can access ALL tokens in partition
        const setPartitionControllersTx = await aapl.setPartitionControllers(ethers.utils.formatBytes32String("locked"), [operator.address]);
        await setPartitionControllersTx.wait();


        // allow an operator to transferbypartition
        // this is some sort of 'approval' 
        const allowOperatorForPartition1 = await aapl.connect(investor2).
            authorizeOperatorByPartition(partition1, operator.address);
        await allowOperatorForPartition1.wait();


        const lockTx = await aapl.connect(operator).operatorTransferByPartition(
            partition1,
            investor2.address,
            investor2.address,
            999,
            ethers.utils.concat([(changePartitionFlag), arrayify(partition3)]),
            "0x01"
        );
        await lockTx.wait();

        await expect(aapl.connect(investor2).transfer(investor1.address, 700)).
            to.revertedWith('52');

    });
});  