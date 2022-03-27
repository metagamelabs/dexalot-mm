import { OrderBooks } from "./../typechain-types/OrderBooks";
import { DexalotMM } from "../typechain-types/DexalotMM";
import { ethers } from "hardhat";
import {
  TradePair,
  B32,
  Order,
  Side,
  fromRestOrder,
  Type1,
  Status,
} from "../src/types";
import JoetrollerAbi from "../contracts/abi/Joetroller.json";
import {
  fetchTradingPairs,
  fetchDeploymentAbi,
  addBuyLimitOrder,
  fetchOrderBookData,
  addSellLimitOrder,
  BIDS,
  ASKS,
  setInternalAsksArray,
  setInternalBidsArray,
  cancelAllOrders,
  calcMidPriceFromOnChainOrderBook,
} from "../src/dexalot-tasks";
import _ from "lodash";
import C from "../src/constants";
import { Contract, Wallet, BigNumber } from "ethers";
import { skipPartiallyEmittedExpressions } from "typescript";
import { ROCKET_SUBGRAPH } from "@traderjoe-xyz/sdk";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// init args
const INIT_ARGS = {
  predefinedSpread: 0.01,
  midPrice: ethers.utils.parseEther("0.1"),
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
let OrderBooksContract: Contract;

async function initData() {
  const tradingPairsData: Array<TradePair> = await fetchTradingPairs();
  const team6AvaxPair = _.find(tradingPairsData, (x) => x.pair == "TEAM6/AVAX");
  if (!team6AvaxPair) {
    throw Error("Unable to fetch TEAM6/AVAX pair data");
  }
  team6AvaxPair.mintrade_amnt = Number(team6AvaxPair.mintrade_amnt);
  team6AvaxPair.maxtrade_amnt = Number(team6AvaxPair.maxtrade_amnt);
  TEAM6_AVAX_PAIR = team6AvaxPair;

  const orderBookQueryResult = await fetchOrderBookData(
    C.DEXALOT_MM_WALLET_ADDR,
    "TEAM6/AVAX"
  );

  setInternalBidsArray(
    orderBookQueryResult.rows
      .filter((x: Order) => x.side == Side.BUY)
      .map((x: any) => fromRestOrder(x))
  );
  setInternalAsksArray(
    orderBookQueryResult.rows
      .filter((x: Order) => x.side == Side.SELL)
      .map((x: any) => fromRestOrder(x))
  );
}

async function initWeb3Stuff() {
  WALLET = await new ethers.Wallet(
    "8e9cdb3e5c49c5382c888772e0651cb62d89837fcddb7beb5875a2cf6e412d45",
    ethers.provider
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
  const OrderBooksFactory = await ethers.getContractFactory(
    "OrderBooks",
    WALLET
  );
  OrderBooksContract = OrderBooksFactory.attach(C.DEXALOT_ORDERBOOK_ADDR);

  // Subscribe to OrderStatusChanged
  const orderStatusChangedFilter = {
    address: C.DEXALOT_TRADE_PAIRS_ADDR,
    topics: [
      ethers.utils.id(
        "OrderStatusChanged(address,bytes32,bytes32,uint,uint,uint,Side,Type1,Status,uint,uint)"
      ),
    ],
  };

  ethers.provider.on(
    orderStatusChangedFilter,
    async (
      traderAddress: string,
      pairB32: string,
      id: string,
      price: number,
      totalamount: number,
      quantity: number,
      side: Side,
      type1: Type1,
      orderStatus: Status,
      quantityfilled: number,
      totalfee: number
    ) => {
      console.log("Got Event orderStatusChanged");
    }
  );

  // Subscribe to Executed
  const executedFilter = {
    address: C.DEXALOT_TRADE_PAIRS_ADDR,
    topics: [
      ethers.utils.id(
        "Executed(bytes32,uint,uint,bytes32,bytes32,uint,uint,bool,uint)"
      ),
    ],
  };

  ethers.provider.on(
    executedFilter,
    async (
      pairB32: string,
      price: number,
      quantity: number,
      makerB32: string,
      takerB32: string,
      feeMaker: number,
      feeMakerBase: boolean,
      execId: number
    ) => {
      console.log("Got Event: Executed");
    }
  );
}

async function main() {
  // Query market data
  await initData();

  console.log("Initialized Trading Pair Data: ", TEAM6_AVAX_PAIR);
  console.log("INIT BIDS: ", BIDS);
  console.log("INIT ASKS: ", ASKS);

  // ethers.js init stuff
  await initWeb3Stuff();
  console.log("Initialized web 3 stuff");

  // initial configuration:
  console.log("Initial Config: ", INIT_ARGS);

  const midPriceFromOrderBook = await calcMidPriceFromOnChainOrderBook(
    TEAM6_AVAX_PAIR.pair,
    INIT_ARGS.predefinedSpread,
    TradePairsContract,
    WALLET
  );
  const midPrice: BigNumber =
    midPriceFromOrderBook && midPriceFromOrderBook.gt(0)
      ? midPriceFromOrderBook
      : INIT_ARGS.midPrice;
  console.log(
    "Determined Mid Price: %s, (%s)",
    midPrice,
    ethers.utils.formatEther(midPrice.toString())
  );

  // Check OrderBook and CANCEL orders if necessary
  if (BIDS.length > 0 || ASKS.length > 0) {
    console.log(
      "We have %s BUY and %s SELL existing orders",
      BIDS.length,
      ASKS.length
    );
    console.log("\tCancelling all orders after 10 seconds");
    await sleep(10000);
    console.log("\tCancelling orders...");
    await cancelAllOrders(TradePairsContract, WALLET);
    console.log("\tOrders cancelled!");
    console.log("\tWaiting 20 seconds before adding BUY and SELL orders: ");
    await sleep(20000);
    // setTimeout(function(){
    //   console.log("Running 'enter a new set of buy & sell orders with different prices based on the changing mid/last price'");
    // }, 20000);
  }

  // Add funds if needed
  const team6Balance = await PortfolioContract.getBalance(
    WALLET.address,
    B32(TEAM6_AVAX_PAIR.quote)
  );
  // console.log("Team 6 Available Balance: ", team6Balance.available);
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
  // console.log("AVAX Balance: ", avaxBalance);
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
  const targetBuyPrice =
    Number(ethers.utils.formatEther(midPrice)) - INIT_ARGS.predefinedSpread / 2;
  const minBuyAmount = TEAM6_AVAX_PAIR.mintrade_amnt / targetBuyPrice;
  await addBuyLimitOrder(
    TEAM6_AVAX_PAIR,
    targetBuyPrice,
    minBuyAmount,
    TradePairsContract,
    WALLET
  );

  console.log("Added buy order");

  // Create Sell Order on Mid Price
  const targetSellPrice =
    Number(ethers.utils.formatEther(midPrice)) + INIT_ARGS.predefinedSpread / 2;
  const minSellAmount = TEAM6_AVAX_PAIR.mintrade_amnt / targetSellPrice;
  await addSellLimitOrder(
    TEAM6_AVAX_PAIR,
    targetSellPrice,
    minSellAmount,
    TradePairsContract,
    WALLET
  );
  console.log("Added sell order");

  console.log("Waiting 30 seconds before cancelling all of the orders...");
  await sleep(30000);
  console.log("Cancelling all orders");
  await cancelAllOrders(TradePairsContract, WALLET);
  console.log("Cancelling all orders");

  // Outputting internal books:
  console.log("BIDS: ", BIDS);
  console.log("ASKS: ", ASKS);

  console.log("Going into while(1) loop...");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
