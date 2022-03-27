import { ethers } from "ethers";
export interface TradePair {
  pair: string;
  base: string;
  quote: string;
  basedisplaydecimals: number;
  quotedisplaydecimals: number;
  baseaddress: string;
  quoteaddress: string | null;
  base_evmdecimals: number;
  quote_evmdecimals: number;
  mintrade_amnt: number;
  maxtrade_amnt: number;
}

export interface Order {
  id: string;
  traderaddress: string;
  tx: string;
  pair: string;
  type: Type1;
  side: Side;
  status: Status;
  price: string;
  quantity: string;
  totalamount: string;
  ts: string;
  quantityfilled: string;
  totalfee: string;
  update_ts?: string;
}

export function fromRestOrder(orderFromRestApi: any) {
  const order: Order = orderFromRestApi;
  // order.price = Number(order.price);
  // order.quantity = Number(order.quantity);
  // order.totalamount = Number(order.totalamount);
  // order.quantityfilled = Number(order.quantityfilled);
  // order.totalfee = Number(order.totalfee);

  return order;
}

export enum Side {
  BUY,
  SELL,
}

export enum Type1 {
  MARKET,
  LIMIT,
  STOP,
  STOPLIMIT,
  LIMITFOK,
}
export enum Status {
  NEW,
  REJECTED,
  PARTIAL,
  FILLED,
  CANCELED,
  EXPIRED,
  KILLED,
}

export function B32(x: string) {
  return ethers.utils.formatBytes32String(x);
}
