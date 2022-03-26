import { DexalotMM } from "../typechain-types/DexalotMM";
import { ethers } from "hardhat";
import JoetrollerAbi from "../contracts/abi/Joetroller.json";
import C from "../src/constants";

async function main() {
  // Depoloy LiquidaterJoe
  const DexalotMMFactory = await ethers.getContractFactory("DexalotMM");
  const dexMM = await DexalotMMFactory.deploy();

  await dexMM.deployed();

  console.log("DexalotMM deployed to:", dexMM.address);

  console.log("Deployed by: ", await DexalotMMFactory.signer.getAddress());

  // doin some JoeTroller expeirment
  // const JoetrollerContract = await ethers.getContractAt(
  //   JoetrollerAbi,
  //   C.JOETROLLER_ADDR
  // );

  // console.log("JOETROLLER: markets: ", await JoetrollerContract.getAllMarkets());
  
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
