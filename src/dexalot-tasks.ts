import { DexalotMM } from "../typechain-types/DexalotMM";
import { Signer } from "ethers";
import { Contract, BigNumber, Wallet, utils } from "ethers";
import { Side, Type1, Status, TradePair, B32, Order } from "./types";
import { task } from "hardhat/config";
import { ethers } from "ethers";
import C from "../src/constants";
import _ from "lodash";
import axios from "axios";
import { number } from "yargs";
import chalk from "chalk";
import e from "express";

export let BIDS: Array<Order> = [];
export let ASKS: Array<Order> = [];

export let lastPrice: BigNumber;

export async function fetchTradingPairs() {
  const result = await axios.get(
    "https://api.dexalot-dev.com/api/trading/pairs"
  );
  return result.data;
}

export async function fetchDeploymentAbi(contractName: string) {
  const result = await axios.get(
    `https://api.dexalot-dev.com/api/trading/deploymentabi/${contractName}`
  );
  return result.data;
}

export async function fetchOrderBookData(traderaddress: string, pair: string) {
  const result = await axios.get(
    `https://api.dexalot-dev.com/api/trading/openorders/params`,
    { params: { traderaddress, pair } }
  );
  return result.data;
}

export async function printMyOrders() {
  console.log(chalk.yellow.bold("My Orders:"));
  BIDS.forEach((x: Order) =>
    console.log(
      chalk.green(
        `\tBID: price=${ethers.utils.formatEther(
          x.price
        )} quantity=${ethers.utils.formatEther(
          x.quantity
        )} filled=${ethers.utils.formatEther(x.quantityfilled)}`
      )
    )
  );
  ASKS.forEach((x: Order) =>
    console.log(
      chalk.red(
        `\tASK: price=${ethers.utils.formatEther(
          x.price
        )} quantity=${ethers.utils.formatEther(
          x.quantity
        )} filled=${ethers.utils.formatEther(x.quantityfilled)}`
      )
    )
  );
}

//@ts-ignore
export async function processOrder({
  traderAddr,
  pairId,
  orderId,
  price,
  totalAmount,
  quantity,
  side,
  type1,
  orderStatus,
  quantityFilled,
  totalFee,
}: {
  traderAddr: string;
  pairId: string;
  orderId: string;
  price: BigNumber;
  totalAmount: BigNumber;
  quantity: BigNumber;
  side: Side;
  type1: Type1;
  orderStatus: Status;
  quantityFilled: BigNumber;
  totalFee: BigNumber;
}) {
  // console.log("Processing order: ", arguments);
  // console.log("Order Status: ", Status[orderStatus]);
  // console.log("Type1: ", Type1[type1]);
  // console.log("Side: ", Side[side]);

  // See if it already exists in the map
  const existingOrderObject = _.find(
    side == Side.BUY ? BIDS : ASKS,
    (x) => x.id == orderId
  );
  if (existingOrderObject) {
    if (orderStatus == Status.NEW) {
      // Duplicate order process, skip.
      return;
    }

    if (orderStatus == Status.CANCELED) {
      // Remove it from the internal array
      if (side == Side.BUY) {
        BIDS = _.filter(BIDS, (x) => x.id != orderId);
      } else {
        ASKS = _.filter(ASKS, (x) => x.id != orderId);
      }
      printMyOrders();
      return;
    }

    if (orderStatus == Status.PARTIAL) {
      existingOrderObject.quantityfilled = quantityFilled;
      existingOrderObject.totalfee = totalFee;
      existingOrderObject.update_ts = new Date().toISOString();
      console.log("Updated Order(id=%s)", orderId);
      printMyOrders();
      return;
    }

    if (orderStatus == Status.FILLED) {
      // Remove from OrderBook
      if (side == Side.BUY) {
        BIDS = _.filter(BIDS, (x) => x.id != orderId);
      } else {
        ASKS = _.filter(ASKS, (x) => x.id != orderId);
      }
      console.log("Removed Filled Order(id=%s)", orderId);
      printMyOrders();
      return;
    }

    console.log("Unhandled order status: ", orderStatus);
  } else if (orderStatus == Status.CANCELED) {
    // already removed it, skip.
  } else {
    console.log("Inserting new order into internal array: ", orderId);
    const orderObj: Order = {
      id: orderId,
      traderaddress: traderAddr,
      tx: "txn",
      pair: pairId,
      type: type1,
      status: orderStatus,
      side: side,
      price: price,
      quantity: quantity,
      totalamount: totalAmount,
      ts: new Date().toISOString(),
      quantityfilled: quantityFilled,
      totalfee: totalFee,
    };
    if (side == Side.BUY) {
      BIDS.push(orderObj);
      BIDS = _.sortBy(BIDS, ["price", "ts"], ["desc", "desc"]);
    } else {
      ASKS.push(orderObj);
      ASKS = _.sortBy(ASKS, ["price", "ts"], ["asc", "desc"]);
    }
    printMyOrders();
  }
}

export async function addBuyLimitOrder(
  pair: TradePair,
  price: number,
  amount: number,
  TradePairContract: Contract,
  wallet: Wallet
) {
  return addLimitOrder(
    pair,
    price,
    amount,
    Side.BUY,
    TradePairContract,
    wallet
  );
}

export async function addSellLimitOrder(
  pair: TradePair,
  price: number,
  amount: number,
  TradePairContract: Contract,
  wallet: Wallet
) {
  return addLimitOrder(
    pair,
    price,
    amount,
    Side.SELL,
    TradePairContract,
    wallet
  );
}

export async function addLimitOrder(
  pair: TradePair,
  price: number,
  amount: number,
  side: Side,
  TradePairContract: Contract,
  wallet: Wallet
) {
  // console.log(
  //   "PRICE %s, QUANTITY: %s ",
  //   utils.parseUnits(
  //     price.toFixed(pair.quotedisplaydecimals),
  //     pair.quote_evmdecimals
  //   ),
  //   utils.parseUnits(
  //     amount.toFixed(pair.basedisplaydecimals),
  //     pair.base_evmdecimals
  //   )
  // );
  const tradePairB32 = utils.formatBytes32String(pair.pair);
  const addOrderTxn = await TradePairContract.addOrder(
    tradePairB32,
    utils.parseUnits(
      price.toFixed(pair.quotedisplaydecimals),
      pair.quote_evmdecimals
    ),
    utils.parseUnits(
      amount.toFixed(pair.basedisplaydecimals),
      pair.base_evmdecimals
    ),
    side == Side.BUY ? 0 : 1,
    Type1.LIMIT
  );
  const orderLog = await addOrderTxn.wait();
  // console.log(orderLog)

  // Loop thru events
  if (orderLog) {
    for (let _log of orderLog.events) {
      if (_log.event) {
        console.log("GOT LOG EVENT: ", _log.event);
        if (_log.event === "OrderStatusChanged") {
          if (
            _log.args.traderaddress === wallet.address &&
            _log.args.pair === tradePairB32
          ) {
            processOrder({
              traderAddr: wallet.address,
              pairId: utils.parseBytes32String(_log.args.pair),
              orderId: _log.args.id,
              price: _log.args.price,
              totalAmount: _log.args.totalamount,
              quantity: _log.args.quantity,
              side: _log.args.side,
              type1: _log.args.type1,
              orderStatus: _log.args.status,
              quantityFilled: _log.args.quantityfilled,
              totalFee: _log.args.totalfee,
            });
          }
        } else {
          throw Error("NOT HANDLED EVENT: " + _log.event);
        }
      }
    }
  }
}

export async function cancelAllOrders(
  TradePairsContract: Contract,
  wallet: Wallet
) {
  const getOrdersResult = await fetchOrderBookData(
    wallet.address,
    "TEAM6/AVAX"
  );
  const cancelAllOrdersTxn = await TradePairsContract.cancelAllOrders(
    B32("TEAM6/AVAX"),
    getOrdersResult.rows.map((x: { id: string }) => x.id)
  );
  await cancelAllOrdersTxn.wait();
  // If the txn succeeds we will clear out the BIDS and ASKS arrays
  BIDS = [];
  ASKS = [];
}

export async function calcMidPriceFromOnChainOrderBook(
  pair: string,
  spreadAmount: BigNumber,
  TradePairsContract: Contract,
  wallet: Wallet
) {
  const buyOrderBookQueryResult = await TradePairsContract.getNBuyBook(
    B32(pair),
    1,
    1,
    0,
    B32("")
  );
  const highestBuy = buyOrderBookQueryResult[0][0];

  const sellOrderBookQueryResult = await TradePairsContract.getNSellBook(
    B32(pair),
    1,
    1,
    0,
    B32("")
  );
  const lowestSell = sellOrderBookQueryResult[0][0];

  let midPrice: BigNumber;
  if (highestBuy.gt(0) && lowestSell.gt(0)) {
    // If we have stuff on both order books, we find the midpoint
    midPrice = highestBuy.add(lowestSell).div(2);
  } else if (highestBuy.gt(0)) {
    midPrice = highestBuy.add(spreadAmount.div(2));
  } else if (lowestSell.gt(0)) {
    midPrice = lowestSell.sub(spreadAmount.div(2));
  } else {
    return null;
  }

  return midPrice;
}

export function setInternalBidsArray(bids: Array<Order>) {
  BIDS = bids;
}

export function setInternalAsksArray(asks: Array<Order>) {
  ASKS = asks;
}
