import { DexalotMM } from "../typechain-types/DexalotMM";
import { ethers } from "hardhat";
import JoetrollerAbi from "../contracts/abi/Joetroller.json";
import C from "../src/constants";

async function main() {
  // Query market data
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
