import { DexalotMM } from "../typechain-types/DexalotMM";
import { Signer } from "ethers";
import { Contract, BigNumber, Wallet, utils } from "ethers";
import { Side, Type1, Status, TradePair } from "./types";
import { task } from "hardhat/config";
import C from "../src/constants";
import { SwapParameters } from "@traderjoe-xyz/sdk";
import _ from "lodash";
import axios from "axios";
import { number } from "yargs";

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

//@ts-ignore
async function processOrder({
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
  console.log("Processing order: ", arguments);
  console.log("Order Status: ", Status[orderStatus]);
  console.log("Type1: ", Type1[type1]);
  console.log("Side: ", Side[side]);
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
    Side.BUY,
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
              totalAmount: _log.args.totalAmount,
              quantity: _log.args.quantity,
              side: _log.args.side,
              type1: _log.args.type1,
              orderStatus: _log.args.status,
              quantityFilled: _log.args.quantityFilled,
              totalFee: _log.args.totalFee,
            });
          }
        } else {
          throw Error("NOT HANDLED EVENT: " + _log.event);
        }
      }
    }
  }
}
