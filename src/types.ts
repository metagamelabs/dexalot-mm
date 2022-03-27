import { ethers, BigNumber } from "ethers";
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
  price: BigNumber;
  quantity: BigNumber;
  totalamount: BigNumber;
  ts: string;
  quantityfilled: BigNumber;
  totalfee: BigNumber;
  update_ts?: string;
}

export function fromRestOrder(orderFromRestApi: any) {
  const order: Order = orderFromRestApi;
  order.price = ethers.utils.parseEther(orderFromRestApi.price);
  order.quantity = ethers.utils.parseEther(orderFromRestApi.quantity);
  order.totalamount = ethers.utils.parseEther(orderFromRestApi.totalamount);
  order.quantityfilled = ethers.utils.parseEther(
    orderFromRestApi.quantityfilled
  );
  order.totalfee = ethers.utils.parseEther(orderFromRestApi.totalfee);

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
