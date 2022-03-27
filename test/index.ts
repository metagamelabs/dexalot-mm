import { ITradePairs } from "./../typechain-types/ITradePairs";
import { Signer } from "ethers";
import { DexalotMM } from "./../typechain-types/DexalotMM";
import { Side, Type1, B32, TradePair } from "../src/types";
import { expect, util } from "chai";
import { ethers } from "hardhat";
import C from "../src/constants";
import { hexStripZeros } from "ethers/lib/utils";
import {
  fetchTradingPairs,
  fetchDeploymentAbi,
  addBuyLimitOrder,
  addSellLimitOrder,
  fetchOrderBookData,
  cancelAllOrders,
} from "../src/dexalot-tasks";
import BigNumber from "bignumber.js";
import "@nomiclabs/hardhat-ethers";
import {
  ChainId,
  Token,
  Trade,
  TradeOptions,
  Route,
  Fetcher,
  WAVAX,
  TradeType,
  CAVAX,
  CurrencyAmount,
  Router,
  Percent,
  JSBI,
} from "@traderjoe-xyz/sdk";

const INIT_ARGS = {
  predefinedSpreadFactor: 0.01,
  midPrice: 0.1,
  clearOrderBookOnStart: false,
  minStartingAvailableBase: 20,
  minStartingAvailableQuote: 20,
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe("DexalotMM", function () {
  it("Assert DexalotMM Portfolio Deposits", async function () {
    if (!C.TEAM6_TOKEN.symbol) {
      throw Error("Need to init team6 symbol");
    }
    const chainId = C.DEXALOT_DEV_CHAIN_ID;

    const wallet = await new ethers.Wallet(
      "8e9cdb3e5c49c5382c888772e0651cb62d89837fcddb7beb5875a2cf6e412d45",
      await ethers.provider
    );
    const DexalotMMFactory = await ethers.getContractFactory(
      "DexalotMM",
      wallet
    );
    const balance = await ethers.provider.getBalance(wallet.address);

    console.log(`${wallet.address} has balance ${balance.toString()}`);
    console.log("Using wallet with addrs: ", wallet.address);
    console.log("Dexalot Factory Signr", DexalotMMFactory.interface);
    const deploymentData = DexalotMMFactory.interface.encodeDeploy([
      C.DEXALOT_MM_WALLET_ADDR,
    ]);
    const estimatedGas = await ethers.provider.estimateGas({
      data: deploymentData,
    });
    console.log("Estimated Gas: ", estimatedGas);
    const dexMM = await DexalotMMFactory.deploy(C.DEXALOT_MM_WALLET_ADDR);
    // const dexMM = await DexalotMMFactory.deploy({gasLimit: 100000});
    await dexMM.deployed();
    console.log(
      "Dexalot MM deployed by: ",
      await DexalotMMFactory.signer.getAddress()
    );

    // Setup Portfolio contract
    const DexPortfolioFactory = await (
      await ethers.getContractFactory("Portfolio", wallet)
    ).connect(wallet);
    const DexPortfolio = DexPortfolioFactory.attach(C.DEXALOT_PORTFOLIO_ADDR);
    const initialTeam6Balance = await DexPortfolio.getBalance(
      C.DEXALOT_MM_WALLET_ADDR,
      C.TEAM6_TOKEN.symbolB32
    );
    console.log("initial team6 balance result: ", initialTeam6Balance);
    const initialAvaxBalance = await DexPortfolio.getBalance(
      C.DEXALOT_MM_WALLET_ADDR,
      C.NATIVE_AVAX_B32
    );
    console.log("initial AVAX balance: ", initialAvaxBalance);

    // Deposit 10 TEAM6
    const depositTeam6TokensTx = await DexPortfolio.depositToken(
      wallet.address,
      C.TEAM6_TOKEN.symbolB32,
      ethers.utils.parseUnits("10", C.TEAM6_TOKEN.decimals)
    );
    await depositTeam6TokensTx.wait();

    // assert deposit balance
    const team6BalanceAfterDeposit = await DexPortfolio.getBalance(
      C.DEXALOT_MM_WALLET_ADDR,
      C.TEAM6_TOKEN.symbolB32
    );
    console.log("balance result after deposit: ", team6BalanceAfterDeposit);
    expect(team6BalanceAfterDeposit.total).equals(
      ethers.BigNumber.from(initialTeam6Balance.total).add(
        ethers.utils.parseUnits("10", C.TEAM6_TOKEN.decimals)
      )
    );

    // Deposit 10 AVAX
    const depositAvaxTx = await wallet.sendTransaction({
      to: C.DEXALOT_PORTFOLIO_ADDR,
      value: ethers.utils.parseEther("10"),
    });
    await depositAvaxTx.wait();
    // assert deposit balance
    const avaxBalanceAfterDeposit = await DexPortfolio.getBalance(
      C.DEXALOT_MM_WALLET_ADDR,
      C.NATIVE_AVAX_B32
    );
    console.log("avax balance result after deposit: ", avaxBalanceAfterDeposit);
    expect(avaxBalanceAfterDeposit.total).equals(
      ethers.BigNumber.from(initialAvaxBalance.total).add(
        ethers.utils.parseEther("10")
      )
    );
  });

  it("Assert DexalotMM OnChain OrderBook queries", async function () {
    if (!C.TEAM6_TOKEN.symbol) {
      throw Error("Need to init team6 symbol");
    }
    const chainId = C.DEXALOT_DEV_CHAIN_ID;

    const wallet = await new ethers.Wallet(
      "8e9cdb3e5c49c5382c888772e0651cb62d89837fcddb7beb5875a2cf6e412d45",
      await ethers.provider
    );

    const TradePairsFactory = await ethers.getContractFactory(
      "TradePairs",
      wallet
    );
    let TradePairsContract = TradePairsFactory.attach(
      C.DEXALOT_TRADE_PAIRS_ADDR
    );
    const tradePairQueryResult = await TradePairsContract.getNBuyBook(
      B32("TEAM6/AVAX"),
      5,
      5,
      0,
      B32("")
    );
    console.log(tradePairQueryResult);
  });

  it("Assert DexalotMM REST OrderBook queries and building internal structure", async function () {
    const TEAM6_AVAX_PAIR: TradePair = {
      pair: "TEAM6/AVAX",
      base: "TEAM6",
      quote: "AVAX",
      basedisplaydecimals: 1,
      quotedisplaydecimals: 4,
      baseaddress: "0x16CfA1c19Cf532112b514db1164a85ad34C3E6de",
      quoteaddress: null,
      mintrade_amnt: 0.3,
      maxtrade_amnt: 4000,
      base_evmdecimals: 18,
      quote_evmdecimals: 18,
    };
    const WALLET = await new ethers.Wallet(
      "8e9cdb3e5c49c5382c888772e0651cb62d89837fcddb7beb5875a2cf6e412d45",
      await ethers.provider
    );

    const TradePairsFactory = await ethers.getContractFactory(
      "TradePairs",
      WALLET
    );
    let TradePairsContract = TradePairsFactory.attach(
      C.DEXALOT_TRADE_PAIRS_ADDR
    );
    // Cancel all orders
    await cancelAllOrders(TradePairsContract, WALLET);
    await sleep(10000);
    let orderBookQueryResult = await fetchOrderBookData(
      C.DEXALOT_MM_WALLET_ADDR,
      "TEAM6/AVAX"
    );
    console.log(orderBookQueryResult);
    expect(orderBookQueryResult.rows.length).equals(0);

    // Add some orders
    // Create buy order on mid price:
    const targetBuyPrice = INIT_ARGS.midPrice - 0.01 / 2;
    const minBuyAmount = TEAM6_AVAX_PAIR.mintrade_amnt / targetBuyPrice;
    console.log("Target Buy Price: ", targetBuyPrice);
    console.log("MIN BUY AMOUNT: ", minBuyAmount);
    await addBuyLimitOrder(
      TEAM6_AVAX_PAIR,
      targetBuyPrice,
      minBuyAmount,
      TradePairsContract,
      WALLET
    );

    console.log("Added initial buy order");

    // Create Sell Order on Mid Price
    const targetSellPrice = INIT_ARGS.midPrice + 0.01 / 2;
    const minSellAmount = TEAM6_AVAX_PAIR.mintrade_amnt / targetSellPrice;
    await addSellLimitOrder(
      TEAM6_AVAX_PAIR,
      targetSellPrice,
      minSellAmount,
      TradePairsContract,
      WALLET
    );
    console.log("Added initial sell order");

    console.log("QUERYING order books again via REST API");

    orderBookQueryResult = await fetchOrderBookData(
      C.DEXALOT_MM_WALLET_ADDR,
      "TEAM6/AVAX"
    );
    console.log(orderBookQueryResult);
    expect(orderBookQueryResult.rows.length).equals(2);
  });
});
