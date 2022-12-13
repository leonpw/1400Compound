

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { ERC1400 } from "../typechain-types";


export const partition1 = '0x7265736572766564000000000000000000000000000000000000000000000000'; // reserved in hex
export const partition2 = '0x6973737565640000000000000000000000000000000000000000000000000000'; // issued in hex
export const partition3 = '0x6c6f636b65640000000000000000000000000000000000000000000000000000'; // locked in hex 
export const changePartitionFlag = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';


export async function printBalanceForAllPartitions(erc1400: ERC1400, address: string) {


    console.log(`Total Balances: ${address}: ${await erc1400.balanceOf(address)} ${await erc1400.name()}`)
    const balanceFree = await erc1400.balanceOfByPartition(partition1, address);
    const balanceP2 = await erc1400.balanceOfByPartition(partition2, address);
    const balanceLocked = await erc1400.balanceOfByPartition(partition3, address);

    console.log({ balanceP1: balanceFree })
    console.log({ balanceP2 })
    console.log({ balanceP3: balanceLocked })
};


export async function register1820IfNotDoneYet(verbose:boolean = false) {

    const deployerAddress = '0xa990077c3205cbDf861e17Fa532eeB069cE9fF96';

    const nonce = await ethers.provider.getTransactionCount(deployerAddress);
    verbose ?? verbose ?? console.log(`nonce was: ${nonce}`)
    if (nonce > 0) {
        return;
    }


    const [deployer] = await ethers.getSigners();

    // fund random wallet to deploy the 1820 registry contract
    const txParams = {
        to: deployerAddress,
        value: ethers.utils.parseEther("0.1")
    }
    const fundTx = await deployer.sendTransaction(txParams);
    await fundTx.wait();


    // Do some next level Nick shit 
    const rawTx = '0xf90a388085174876e800830c35008080b909e5608060405234801561001057600080fd5b506109c5806100206000396000f3fe608060405234801561001057600080fd5b50600436106100a5576000357c010000000000000000000000000000000000000000000000000000000090048063a41e7d5111610078578063a41e7d51146101d4578063aabbb8ca1461020a578063b705676514610236578063f712f3e814610280576100a5565b806329965a1d146100aa5780633d584063146100e25780635df8122f1461012457806365ba36c114610152575b600080fd5b6100e0600480360360608110156100c057600080fd5b50600160a060020a038135811691602081013591604090910135166102b6565b005b610108600480360360208110156100f857600080fd5b5035600160a060020a0316610570565b60408051600160a060020a039092168252519081900360200190f35b6100e06004803603604081101561013a57600080fd5b50600160a060020a03813581169160200135166105bc565b6101c26004803603602081101561016857600080fd5b81019060208101813564010000000081111561018357600080fd5b82018360208201111561019557600080fd5b803590602001918460018302840111640100000000831117156101b757600080fd5b5090925090506106b3565b60408051918252519081900360200190f35b6100e0600480360360408110156101ea57600080fd5b508035600160a060020a03169060200135600160e060020a0319166106ee565b6101086004803603604081101561022057600080fd5b50600160a060020a038135169060200135610778565b61026c6004803603604081101561024c57600080fd5b508035600160a060020a03169060200135600160e060020a0319166107ef565b604080519115158252519081900360200190f35b61026c6004803603604081101561029657600080fd5b508035600160a060020a03169060200135600160e060020a0319166108aa565b6000600160a060020a038416156102cd57836102cf565b335b9050336102db82610570565b600160a060020a031614610339576040805160e560020a62461bcd02815260206004820152600f60248201527f4e6f7420746865206d616e616765720000000000000000000000000000000000604482015290519081900360640190fd5b6103428361092a565b15610397576040805160e560020a62461bcd02815260206004820152601a60248201527f4d757374206e6f7420626520616e204552433136352068617368000000000000604482015290519081900360640190fd5b600160a060020a038216158015906103b85750600160a060020a0382163314155b156104ff5760405160200180807f455243313832305f4143434550545f4d4147494300000000000000000000000081525060140190506040516020818303038152906040528051906020012082600160a060020a031663249cb3fa85846040518363ffffffff167c01000000000000000000000000000000000000000000000000000000000281526004018083815260200182600160a060020a0316600160a060020a031681526020019250505060206040518083038186803b15801561047e57600080fd5b505afa158015610492573d6000803e3d6000fd5b505050506040513d60208110156104a857600080fd5b5051146104ff576040805160e560020a62461bcd02815260206004820181905260248201527f446f6573206e6f7420696d706c656d656e742074686520696e74657266616365604482015290519081900360640190fd5b600160a060020a03818116600081815260208181526040808320888452909152808220805473ffffffffffffffffffffffffffffffffffffffff19169487169485179055518692917f93baa6efbd2244243bfee6ce4cfdd1d04fc4c0e9a786abd3a41313bd352db15391a450505050565b600160a060020a03818116600090815260016020526040812054909116151561059a5750806105b7565b50600160a060020a03808216600090815260016020526040902054165b919050565b336105c683610570565b600160a060020a031614610624576040805160e560020a62461bcd02815260206004820152600f60248201527f4e6f7420746865206d616e616765720000000000000000000000000000000000604482015290519081900360640190fd5b81600160a060020a031681600160a060020a0316146106435780610646565b60005b600160a060020a03838116600081815260016020526040808220805473ffffffffffffffffffffffffffffffffffffffff19169585169590951790945592519184169290917f605c2dbf762e5f7d60a546d42e7205dcb1b011ebc62a61736a57c9089d3a43509190a35050565b600082826040516020018083838082843780830192505050925050506040516020818303038152906040528051906020012090505b92915050565b6106f882826107ef565b610703576000610705565b815b600160a060020a03928316600081815260208181526040808320600160e060020a031996909616808452958252808320805473ffffffffffffffffffffffffffffffffffffffff19169590971694909417909555908152600284528181209281529190925220805460ff19166001179055565b600080600160a060020a038416156107905783610792565b335b905061079d8361092a565b156107c357826107ad82826108aa565b6107b85760006107ba565b815b925050506106e8565b600160a060020a0390811660009081526020818152604080832086845290915290205416905092915050565b6000808061081d857f01ffc9a70000000000000000000000000000000000000000000000000000000061094c565b909250905081158061082d575080155b1561083d576000925050506106e8565b61084f85600160e060020a031961094c565b909250905081158061086057508015155b15610870576000925050506106e8565b61087a858561094c565b909250905060018214801561088f5750806001145b1561089f576001925050506106e8565b506000949350505050565b600160a060020a0382166000908152600260209081526040808320600160e060020a03198516845290915281205460ff1615156108f2576108eb83836107ef565b90506106e8565b50600160a060020a03808316600081815260208181526040808320600160e060020a0319871684529091529020549091161492915050565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff161590565b6040517f01ffc9a7000000000000000000000000000000000000000000000000000000008082526004820183905260009182919060208160248189617530fa90519096909550935050505056fea165627a7a72305820377f4a2d4301ede9949f163f319021a6e9c687c292a5e2b2c4734c126b524e6c00291ba01820182018201820182018201820182018201820182018201820182018201820a01820182018201820182018201820182018201820182018201820182018201820';

    const deployRegistry1820Tx = await ethers.provider.sendTransaction(rawTx);
    const c1820 = await deployRegistry1820Tx.wait();
    verbose ?? verbose ?? console.log(`registry succesfully deployed at: ${c1820.contractAddress}`); // <-- should have an 0x1820 address



}

async function setupCompound(verbose = false) {

    // deploy registery 0x1820 in local chain



    const partition1 = '0x7265736572766564000000000000000000000000000000000000000000000000'; // reserved in hex
    const partition2 = '0x6973737565640000000000000000000000000000000000000000000000000000'; // issued in hex
    const partition3 = '0x6c6f636b65640000000000000000000000000000000000000000000000000000'; // locked in hex
    const partitions = [partition1, partition2];


    const [deployer] = await ethers.getSigners();


    register1820IfNotDoneYet(verbose);

    // deploy ERC1400 token [sAAPL]

    const Erc1400 = await ethers.getContractFactory("ERC1400")
    const aaplToken = await Erc1400.deploy("Apple INC NASDAQ:AAPL", "sAAPL", 1, [deployer.address], partitions);
    await aaplToken.deployed();
    verbose ?? console.log(`aapl deployed to: ${aaplToken.address}`)


    // deploy ERC20 token [USDC]

    const Usdc = await ethers.getContractFactory("USDC");
    const usdc = await Usdc.deploy();
    await usdc.deployed();
    verbose ?? console.log(`usdc deployed to: ${usdc.address}`)



    // deploy SimplePriceOracle

    const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
    const simplePriceOracle = await SimplePriceOracle.deploy();
    await simplePriceOracle.deployed();
    verbose ?? console.log(`SimplePriceOracle deployed to: ${simplePriceOracle.address}`)



    // deploy Unitroller

    const Unitroller = await ethers.getContractFactory("Unitroller");
    const unitroller = await Unitroller.deploy();
    await unitroller.deployed();
    verbose ?? console.log(`Unitroller deployed to: ${unitroller.address}`)



    // deploy Comptroller

    const Comptroller = await ethers.getContractFactory("Comptroller");
    const comptroller = await Comptroller.deploy();
    await comptroller.deployed();
    verbose ?? console.log(`Comptroller deployed to: ${comptroller.address}`)



    // comp become unit

    const setPendingImpTx = await unitroller._setPendingImplementation(comptroller.address);
    await setPendingImpTx.wait();

    const becomeTx = await comptroller._become(unitroller.address);
    await becomeTx.wait();
    verbose ?? console.log({ becomeTx })


    // cast unit as comp
    const unitAsComp = comptroller.attach(unitroller.address);


    // sanity check 

    verbose ?? console.log(`is isComptroller: ${await unitAsComp.isComptroller()}`);
    verbose ?? console.log(`is borrowGuardianPaused: ${await unitAsComp._borrowGuardianPaused()}`);


    // set price Oracle

    const setPriceOracle = await unitAsComp._setPriceOracle(simplePriceOracle.address);
    await setPriceOracle.wait();
    verbose ?? console.log(`oracle set to: ${await unitAsComp.oracle()}`);


    // create jumpratemodelV2

    const baseRatePerYear = 0;
    // const multiplierPerYear = 23782343987 * 2102400;
    // const multiplierPerYear  : BigNumber = BigNumber.from(23782343987 * 2102400)
    const kink = BigNumber.from(800000000000000000n);
    const jumpMultiplierPerYear = 2102400 * 2102400;
    const multiplierPerYear = jumpMultiplierPerYear

    const JumpRateModelV2 = await ethers.getContractFactory("JumpRateModelV2");
    const jumpratemodelV2 = await JumpRateModelV2.deploy(
        baseRatePerYear,
        multiplierPerYear,
        jumpMultiplierPerYear,
        kink,
        deployer.address
    );

    await jumpratemodelV2.deployed();
    verbose ?? console.log(`JumpRateModelV2 deployed to: ${jumpratemodelV2.address}`)



    // check markets before

    const markets = await unitAsComp.getAllMarkets();
    verbose ?? console.log({ markets })


    //// Creating USDC market ///////


    // create cUSDC delegate first
    const CErc20Delegate = await ethers.getContractFactory("CErc20Delegate");
    const cErc20Delegate = await CErc20Delegate.deploy();
    await cErc20Delegate.deployed();
    verbose ?? console.log(`cusdc implementation deployed to: ${cErc20Delegate.address}`)


    // create cUSDC delegator next 

    const CErc20Delegator = await ethers.getContractFactory("CErc20Delegator");
    const cUSDC = await CErc20Delegator.deploy(
        usdc.address,
        unitroller.address,
        jumpratemodelV2.address,
        ethers.utils.parseEther("1.0"),
        "1400compound USDC",
        "cUSDC",
        18,
        deployer.address,
        cErc20Delegate.address,
        ethers.utils.hexlify([])

    );
    await cUSDC.deployed();

    verbose ?? console.log(`cusddelegator deployed to: ${cUSDC.address}`)



    // support market for USDC

    verbose ?? console.log(`add cusdc to market..`)

    // addAssets USDC and sAAPL as tokens
    const supportSusdcTx = await unitAsComp._supportMarket(cUSDC.address);
    await supportSusdcTx.wait();



    //// create AAPL markets ////


    // create cUSDC delegate first
    const CErc1400Delegate = await ethers.getContractFactory("CErc1400Delegate");
    const cErc1400Delegate = await CErc1400Delegate.deploy();
    await cErc1400Delegate.deployed();
    verbose ?? console.log(`caapl implementation deployed to: ${cErc1400Delegate.address}`)


    // create cAAPL delegator next 

    const CErc1400Delegator = await ethers.getContractFactory("CErc1400Delegator");
    const cAAPL = await CErc1400Delegator.deploy(
        aaplToken.address,
        unitroller.address,
        jumpratemodelV2.address,
        ethers.utils.parseEther("1.0"),
        "1400compound AAPL",
        "cAAPL",
        18,
        deployer.address,
        cErc1400Delegate.address,
        ethers.utils.hexlify([])

    );
    await cAAPL.deployed();

    verbose ?? console.log(`cAAPLdelegator deployed to: ${cAAPL.address}`)




    // support market for USDC

    verbose ?? console.log(`add aapl to market..`)

    // addAssets USDC and sAAPL as tokens
    const supportSaaplTx = await unitAsComp._supportMarket(cAAPL.address);
    await supportSaaplTx.wait();




    const marketsAfter = await unitAsComp.getAllMarkets();
    verbose ?? console.log({ marketsAfter })


    // set price

    const oneEther = ethers.constants.WeiPerEther

    const setPriceTxUsdc = await simplePriceOracle.setUnderlyingPrice(cUSDC.address, ethers.constants.WeiPerEther);
    (await setPriceTxUsdc.wait())
        .events?.forEach(element => {
            // verbose ?? console.log({ element })
        });

    const setPriceTxAapl = await simplePriceOracle.setUnderlyingPrice(cAAPL.address, ethers.constants.WeiPerEther.mul(1400));
    (await setPriceTxAapl.wait())
        .events?.forEach(element => {
            // verbose ?? console.log({ element })
        });


        const zeroPoint5 = BigNumber.from(500000000000000000n);
        const setCF1Tx = await unitAsComp._setCollateralFactor(cUSDC.address, zeroPoint5);
        const setCF2Tx = await unitAsComp._setCollateralFactor(cAAPL.address, zeroPoint5);
  
        await setCF1Tx.wait();
        await setCF2Tx.wait();


    verbose ?? console.log(`price of usdc: ${await simplePriceOracle.getUnderlyingPrice(cUSDC.address)}`)
    verbose ?? console.log(`price of aapl: ${await simplePriceOracle.getUnderlyingPrice(cAAPL.address)}`)


    // set cAAPL contract controller of partition `locked`
    const setPartitionControllersTx = await aaplToken.setPartitionControllers(ethers.utils.formatBytes32String("locked"), [cAAPL.address]);
    await setPartitionControllersTx.wait();


    return { unitAsComp, unitroller, comptroller, aaplToken, usdc, cAAPLdelegator: cAAPL, cUSDC }
}

export default setupCompound;