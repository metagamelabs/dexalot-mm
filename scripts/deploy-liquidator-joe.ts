import { LiquidatorJoe } from "./../typechain-types/LiquidatorJoe";
import { ethers } from "hardhat";
import JoetrollerAbi from "../contracts/abi/Joetroller.json";
import C from "../src/constants";

async function main() {
  // Depoloy LiquidaterJoe
  const LiquidatorJoeFactory = await ethers.getContractFactory("LiquidatorJoe");
  const ljoe = await LiquidatorJoeFactory.deploy(C.JOETROLLER_ADDR);

  await ljoe.deployed();

  console.log("LJoe deployed to:", ljoe.address);

  console.log("Deployed by: ", await LiquidatorJoeFactory.signer.getAddress());

  // doin some JoeTroller expeirment
  const JoetrollerContract = await ethers.getContractAt(
    JoetrollerAbi,
    C.JOETROLLER_ADDR
  );

  console.log("JOETROLLER: markets: ", await JoetrollerContract.getAllMarkets());

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
