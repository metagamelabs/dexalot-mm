import { DexalotMM } from "../typechain-types/DexalotMM";
import { ethers } from "hardhat";
import { TradePair } from "../src/types";
import JoetrollerAbi from "../contracts/abi/Joetroller.json";
import {
  fetchTradingPairs,
  fetchDeploymentAbi,
  addBuyLimitOrder,
  addSellLimitOrder,
} from "../src/dexalot-tasks";
import _ from "lodash";
import C from "../src/constants";
import { Contract, Wallet, BigNumber } from "ethers";

// init args
const INIT_ARGS = {
  predefinedSpread: 0.01,
  midPrice: 0.1,
  clearOrderBookOnStart: false,
  minStartingAvailableBase: 20,
  minStartingAvailableQuote: 20,
};

// init state
let TEAM6_AVAX_PAIR: TradePair;

// ethers objects
let WALLET: Wallet;
let PortfolioContract: Contract;
let ExchangeContract: Contract;
let TradePairsContract: Contract;

// orderbook state

function B32(x: string) {
  return ethers.utils.formatBytes32String(x);
}

async function initData() {
  const tradingPairsData: Array<TradePair> = await fetchTradingPairs();
  const team6AvaxPair = _.find(tradingPairsData, (x) => x.pair == "TEAM6/AVAX");
  if (!team6AvaxPair) {
    throw Error("Unable to fetch TEAM6/AVAX pair data");
  }
  team6AvaxPair.mintrade_amnt = Number(team6AvaxPair.mintrade_amnt);
  team6AvaxPair.maxtrade_amnt = Number(team6AvaxPair.maxtrade_amnt);
  TEAM6_AVAX_PAIR = team6AvaxPair;
}

async function initWeb3Stuff() {
  WALLET = await new ethers.Wallet(
    "8e9cdb3e5c49c5382c888772e0651cb62d89837fcddb7beb5875a2cf6e412d45",
    await ethers.provider
  );
  const DexPortfolioFactory = await ethers.getContractFactory(
    "Portfolio",
    WALLET
  );
  PortfolioContract = DexPortfolioFactory.attach(C.DEXALOT_PORTFOLIO_ADDR);
  const DexExchangeFactory = await ethers.getContractFactory(
    "Exchange",
    WALLET
  );
  ExchangeContract = DexExchangeFactory.attach(C.DEXALOT_EXCHANGE_ADDR);
  const TradePairsFactory = await ethers.getContractFactory(
    "TradePairs",
    WALLET
  );
  TradePairsContract = TradePairsFactory.attach(C.DEXALOT_TRADE_PAIRS_ADDR);
}

async function main() {
  // Query market data
  await initData();

  console.log("Initialized Trading Pair Data: ", TEAM6_AVAX_PAIR);

  // ethers.js init stuff
  await initWeb3Stuff();
  console.log("Initialized web 3 stuff");

  // initial configuration:
  console.log("Initial Confnig: ", INIT_ARGS);

  // Add funds if needed
  const team6Balance = await PortfolioContract.getBalance(
    WALLET.address,
    B32(TEAM6_AVAX_PAIR.quote)
  );
  console.log("Team 6 Available Balance: ", team6Balance.available);
  const minTeam6AvailableAmount = ethers.utils.parseUnits(
    "20",
    TEAM6_AVAX_PAIR.base_evmdecimals
  );
  if (team6Balance.available.lt(minTeam6AvailableAmount)) {
    console.log(
      "DEPOSTING: ",
      minTeam6AvailableAmount.sub(team6Balance.available)
    );
    const depositTeam6TokensTx = await PortfolioContract.depositToken(
      WALLET.address,
      B32(TEAM6_AVAX_PAIR.base),
      minTeam6AvailableAmount.sub(team6Balance.available)
    );
    await depositTeam6TokensTx.wait();
    console.log("Done depositing Tokens");
  }
  const avaxBalance = await PortfolioContract.getBalance(
    WALLET.address,
    B32(TEAM6_AVAX_PAIR.base)
  );
  console.log("AVAX Balance: ", avaxBalance);
  const minAvaxAvailableAmmount = ethers.utils.parseEther("20");
  if (avaxBalance.available.lt(minAvaxAvailableAmmount)) {
    const depositAvaxTx = await WALLET.sendTransaction({
      to: PortfolioContract.address,
      value: minAvaxAvailableAmmount.sub(avaxBalance.available),
    });
    await depositAvaxTx.wait();
    console.log("Done depositing AVAX");
  }

  // Create buy order on mid price:
  const minTradeAmount = TEAM6_AVAX_PAIR.mintrade_amnt / INIT_ARGS.midPrice;
  await addBuyLimitOrder(
    TEAM6_AVAX_PAIR,
    INIT_ARGS.midPrice,
    minTradeAmount,
    TradePairsContract,
    WALLET
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
