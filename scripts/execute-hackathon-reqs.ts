import { DexalotMM } from "../typechain-types/DexalotMM";
import { ethers } from "hardhat";
import JoetrollerAbi from "../contracts/abi/Joetroller.json";
import { fetchTradingPairs, fetchDeploymentAbi } from "../src/dexalot-tasks";
import _ from "lodash"
import C from "../src/constants";

interface TradePair {
    pair: String;
    mintrade_amnt: String;
    maxtrade_amnt: String;
}

// init state
let TEAM6_AVAX_PAIR: TradePair;

async function init() {
    const tradingPairsData: Array<TradePair> = await fetchTradingPairs();
    const team6AvaxPair = _.find(tradingPairsData, x => x.pair == "TEAM6/AVAX")
    if (!team6AvaxPair) {
        throw Error("Unable to fetch TEAM6/AVAX pair data")
    }
    TEAM6_AVAX_PAIR = team6AvaxPair;
}

async function main() {
  // Query market data
  await init();

  console.log("Initialized Trading Pair Data: ", TEAM6_AVAX_PAIR)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
