import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { partition1, partition2, partition3, register1820IfNotDoneYet } from "./Helper";

describe("ERC1400", async function () {

  before(async function () {
    await loadFixture(register1820IfNotDoneYet);
  });

  async function deployAapl() {
    const partitions = [partition1, partition2, partition3];
    const [deployer, investor1, investor2, notAnInvestor] = await ethers.getSigners();

    // deploy ERC1400 token [sAAPL]
    const Erc1400 = await ethers.getContractFactory("ERC1400");

    const aaplToken = await Erc1400.deploy("Apple INC NASDAQ:AAPL", "sAAPL", 1, [deployer.address], partitions);
    await aaplToken.deployed();

    (await aaplToken.issue(investor1.address, 1000, "0x")).wait();
    (await aaplToken.issue(investor2.address, 1000, "0x")).wait();

    return { aaplToken, deployer, investor1, investor2, notAnInvestor };
  }


  describe("Deployment", async function () {


    it("Should have 3 default partitions", async function () {

      const { aaplToken, deployer } = await loadFixture(deployAapl);

      console.log(await aaplToken.getDefaultPartitions());

      expect((await aaplToken.getDefaultPartitions()).length).to.equal(3);
    });

  });


  describe("Transfer", async function () {

    it("Investor1 can transfer to investor2", async function () {


      const { aaplToken, deployer, investor1, investor2 } = await loadFixture(deployAapl);

      const amountToTransfer = BigNumber.from(10);

      const balanceInvestor1Before = await aaplToken.balanceOf(investor1.address);
      const balanceInvestor2Before = await aaplToken.balanceOf(investor2.address);

      const transferTx = await aaplToken.connect(investor1).
        transfer(investor2.address, amountToTransfer);
      transferTx.wait();


      expect(await aaplToken.balanceOf(investor1.address)).
        to.equals(balanceInvestor1Before.sub(amountToTransfer));
      expect(await aaplToken.balanceOf(investor2.address)).
        to.equals(balanceInvestor2Before.add(amountToTransfer));

    });
  });
});




