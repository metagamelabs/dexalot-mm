import { DexalotMM } from "../typechain-types/DexalotMM";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { task } from "hardhat/config";
import C from "../src/constants";
import { SwapParameters } from "@traderjoe-xyz/sdk";
import _ from "lodash";
import axios from "axios"


export async function fetchTradingPairs() {
  const result = await axios.get("https://api.dexalot-dev.com/api/trading/pairs");
  return result.data
}

export async function fetchDeploymentAbi(contractName: string) {
  const result = await axios.get(`https://api.dexalot-dev.com/api/trading/deploymentabi/${contractName}`);
  return result.data
}
