import {
  OrderStatusChangedEvent,
  OrderStatusChangedEventFilter,
} from "./../typechain-types/TradePairs";
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
  processOrder,
  printMyOrders,
} from "../src/dexalot-tasks";
import _ from "lodash";
import C from "../src/constants";
import { Contract, Wallet, BigNumber } from "ethers";
import { skipPartiallyEmittedExpressions } from "typescript";
import { ROCKET_SUBGRAPH, Trade } from "@traderjoe-xyz/sdk";

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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

  console.log("Getting existing orders using REST API");
  const orderBookQueryResult = await fetchOrderBookData(
    C.DEXALOT_MM_WALLET_ADDR,
    TEAM6_AVAX_PAIR.pair
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
  printMyOrders();
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

  let buyFilllReacting = false;
  let sellFillReacting = false;

  // Subscribe to OrderStatusChanged
  TradePairsContract.on(
    "OrderStatusChanged",
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
      if (
        traderAddress == WALLET.address &&
        pairB32 == B32(TEAM6_AVAX_PAIR.pair)
      ) {
        await processOrder({
          traderAddr: traderAddress,
          pairId: ethers.utils.parseBytes32String(pairB32),
          orderId: id,
          price: BigNumber.from(price),
          totalAmount: BigNumber.from(totalamount),
          quantity: BigNumber.from(quantity),
          side: side,
          type1: type1,
          orderStatus: orderStatus,
          quantityFilled: BigNumber.from(quantityfilled),
          totalFee: BigNumber.from(totalfee),
        });

        if (orderStatus == Status.FILLED) {
          const targetPrice = Number(
            ethers.utils.formatEther(
              BigNumber.from(price).sub(
                C.INIT_ARGS.predefinedSpreadAmount.div(2)
              )
            )
          );
          const minBuyAmount = TEAM6_AVAX_PAIR.mintrade_amnt / targetPrice;
          if (side == Side.BUY) {
            if (!buyFilllReacting) {
              console.log("Reacting with an order in 5 sec");
              buyFilllReacting = true;
              await sleep(5000);
              await addBuyLimitOrder(
                TEAM6_AVAX_PAIR,
                targetPrice,
                minBuyAmount,
                TradePairsContract,
                WALLET
              );
              buyFilllReacting = false;
            }
          } else {
            if (!sellFillReacting) {
              console.log("Reacting with an order in 5 sec");
              sellFillReacting = true;
              await sleep(5000);
              await addSellLimitOrder(
                TEAM6_AVAX_PAIR,
                targetPrice,
                minBuyAmount,
                TradePairsContract,
                WALLET
              );
            }
            sellFillReacting = false;
          }
        }
      }
    }
  );

  // Subscribe to Executed
  TradePairsContract.on(
    "Executed",
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
      if (pairB32 == B32(TEAM6_AVAX_PAIR.pair)) {
        console.log("Trade executed on TEAM6/AVAX: ", execId);
      }
    }
  );
}

async function main() {
  // Query market data
  await initData();

  // console.log("Initialized Trading Pair Data: ", TEAM6_AVAX_PAIR);

  // ethers.js init stuff
  await initWeb3Stuff();
  // console.log("Initialized web 3 stuff");

  // initial configuration:
  // console.log("Initial Config: ", C.INIT_ARGS);

  const midPriceFromOrderBook = await calcMidPriceFromOnChainOrderBook(
    TEAM6_AVAX_PAIR.pair,
    C.INIT_ARGS.predefinedSpreadAmount,
    TradePairsContract,
    WALLET
  );
  const midPrice: BigNumber =
    midPriceFromOrderBook && midPriceFromOrderBook.gt(0)
      ? midPriceFromOrderBook
      : C.INIT_ARGS.midPrice;
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
    // The code will add the BUY and SELL order below
  }

  // Add funds if needed
  const team6Balance = await PortfolioContract.getBalance(
    WALLET.address,
    B32(TEAM6_AVAX_PAIR.quote)
  );
  // console.log("Team 6 Available Balance: ", team6Balance.available);
  const minTeam6AvailableAmount = ethers.utils.parseUnits(
    "" + C.INIT_ARGS.minStartingAvailableBase,
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
  const minAvaxAvailableAmount = ethers.utils.parseEther(
    "" + C.INIT_ARGS.minStartingAvailableQuote
  );
  if (avaxBalance.available.lt(minAvaxAvailableAmount)) {
    const depositAvaxTx = await WALLET.sendTransaction({
      to: PortfolioContract.address,
      value: minAvaxAvailableAmount.sub(avaxBalance.available),
    });
    await depositAvaxTx.wait();
    console.log("Done depositing AVAX");
  }

  // Create buy order on mid price:
  const targetBuyPrice = Number(
    ethers.utils.formatEther(
      midPrice.sub(C.INIT_ARGS.predefinedSpreadAmount.div(2))
    )
  );
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
  const targetSellPrice = Number(
    ethers.utils.formatEther(
      midPrice.add(C.INIT_ARGS.predefinedSpreadAmount.div(2))
    )
  );
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

  console.log("Going into while(true) loop...");
  while (true) {}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
