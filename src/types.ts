
export interface TradePair {
    pair: string;
    base: string;
    quote: string;
    basedisplaydecimals: number,
    quotedisplaydecimals: number,
    baseaddress: string,
    quoteaddress?: string,
    base_evmdecimals: number,
    quote_evmdecimals: number,
    mintrade_amnt: number;
    maxtrade_amnt: number;
}

export enum Side {BUY, SELL}

export enum Type1 {
    MARKET,
    LIMIT,
    STOP,
    STOPLIMIT,
    LIMITFOK
}
export enum Status   {NEW, REJECTED, PARTIAL, FILLED, CANCELED, EXPIRED, KILLED}