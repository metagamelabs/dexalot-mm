import { ITradePairs } from "./../typechain-types/ITradePairs";
import { Signer } from "ethers";
import { DexalotMM } from "./../typechain-types/DexalotMM";
import { Side, Type1 } from "../src/types";
import { expect, util } from "chai";
import { ethers } from "hardhat";
import C from "../src/constants";
import { hexStripZeros } from "ethers/lib/utils";
import JoetrollerAbi from "../contracts/abi/Joetroller.json";
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

describe("DexalotMM", function () {
  it("Assert DexalotMM Functionality", async function () {
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

    const TEAM6AVAXTradePairFactory = await await ethers.getContractFactory(
      "TradePairs",
      wallet
    );
    const TradePairContract = TEAM6AVAXTradePairFactory.attach(
      "0x8664EFa775aBf51aD5b2a179E088efF5AF477c73"
    );
    const price = 0.1;
    console.log(
      "TRADE AMOUNT: ",
      ethers.utils.parseUnits((1.0).toFixed(1), 18)
    );

    // Confirm order added
    //   const DexOrderBooksFactory = await ethers.getContractFactory("OrderBooks", wallet);
    //   const OrderBooksContract = DexExchangeFactory.attach(C.DEXALOT_ORDERBOOK_ADDR);
    //   const getNOrderBooks = await OrderBooksContract.getNBuyBook()
  });
  // it("Assert LiquidaterJoe Can Liquidate", async function () {
  //   // STEP 1: Initizialization
  //   const chainId: ChainId = ChainId.AVALANCHE;
  //   const signer = await ethers.provider.getSigner(C.HARDHAT_SIGNER_ADDR);
  //   const DexalotMMFactory = await ethers.getContractFactory(
  //     "DexalotMM", signer
  //   );
  //   const ljoe = await DexalotMMFactory.deploy(C.JOETROLLER_ADDR);
  //   await ljoe.deployed();
  //   console.log(
  //     "Liquidator Joe deployed by: ",
  //     await DexalotMMFactory.signer.getAddress()
  //   );

  //   // STEP 2: Using JoeRouter, Swap AVAX into USDC.E so that we have funds to pay fees
  //   const pair = await Fetcher.fetchPairData(
  //     C.jUSDCE.token,
  //     WAVAX[chainId],
  //     ethers.provider
  //   );
  //   const route = new Route([pair], CAVAX);
  //   const avaxAmountIn = CurrencyAmount.ether(JSBI.BigInt(1 * 1e18));
  //   const trade = Trade.exactIn(route, avaxAmountIn, chainId);
  //   console.log("Input amount: ", trade.inputAmount.toFixed(6));
  //   console.log("Execution Price: ", trade.executionPrice.adjusted.toFixed(6));
  //   console.log("Output amount: ", trade.outputAmount.toFixed(6));

  //   const tradeOptions = {
  //     allowedSlippage: new Percent("50", "10000"),
  //     ttl: 30,
  //     recipient: await signer.getAddress(),
  //   };
  //   const swapCallParams = Router.swapCallParameters(trade, tradeOptions);
  //   // Call the helper to make the swap tx
  //   await swap(swapCallParams, signer, avaxAmountIn.raw.toString());

  //   // assert balance transferred to liquidator joe contract
  //   console.log("Checking balance of signer: ", await signer.getAddress());
  //   const USDCE = new ethers.Contract(
  //     C.jUSDCE.token.address,
  //     C.ERC20_ABI,
  //     signer
  //   );
  //   const usdcBalanceFromTrade: BigNumber = await USDCE.balanceOf(
  //     await signer.getAddress()
  //   );
  //   expect(usdcBalanceFromTrade.toNumber()).greaterThan(0);
  //   console.log("Balance after trade, before transfer: ", usdcBalanceFromTrade);

  //   // Send all of the USDCE to ljoe deployment
  //   console.log(
  //     "Transfering ",
  //     usdcBalanceFromTrade.toNumber(),
  //     " USDCE to ",
  //     ljoe.address
  //   );
  //   const usdcTransferTx = await USDCE.transfer(
  //     ljoe.address,
  //     usdcBalanceFromTrade.toNumber()
  //   );
  //   await usdcTransferTx.wait();

  //   // assert the result
  //   const ljoeUsdcBalanceAfterTransfer: BigNumber = await USDCE.balanceOf(
  //     ljoe.address
  //   );
  //   expect(ljoeUsdcBalanceAfterTransfer.toNumber()).equals(
  //     usdcBalanceFromTrade.toNumber()
  //   );

  //   // STEP 4: Setup up a victim to liquidate. The victim will deposit AVAX as collateral, and borrow USDC.E
  //   // const victimSigner = (await ethers.getSigners()).find((x: Signer) => x.add != signer._address)
  //   const victimSigner = (await ethers.getSigner(C.HARDHAT_TEST_VICTIM_ADDR));
  //   const victimsCollateralTokenContract = await ethers.getContractAt(
  //     C.JTOKEN_ABI,
  //     C.jWAVAX.delegatorAddr,
  //     victimSigner
  //   );

  //   const balancey = await ethers.provider.getBalance(
  //     await victimSigner.getAddress()
  //   );
  //   console.log(`victim has balance ${balancey.toString()}`);
  //   console.log("Victim: Depositing AVAX as collateral.");
  //   const depositCollateralVictimTx = await victimsCollateralTokenContract.mintNative({value: "" + 10 * 1e18});
  //   await depositCollateralVictimTx.wait();
  //   const jWAVAXContract = await ethers.getContractAt(
  //     C.JTOKEN_ABI,
  //     C.jWAVAX.delegatorAddr,
  //     victimSigner
  //   );

  //   const balancez = await ethers.provider.getBalance(
  //     await victimSigner.getAddress()
  //   );
  //   console.log(`victim has balance ${balancez.toString()}`);
  //   // const wavaxCollateralAmount = await jWAVAXContract.accountCollateralTokens(await victimSigner.getAddress());
  //   // console.log("Victim wavax collateral amount: ", wavaxCollateralAmount)
  //   const wavaxBalanceUnderlying = await jWAVAXContract.balanceOfUnderlying(await victimSigner.getAddress());
  //   console.log("Victim wavax collateral amount: ", wavaxBalanceUnderlying)

  //   const JoetrollerContract = await ethers.getContractAt(
  //     JoetrollerAbi,
  //     C.JOETROLLER_ADDR,
  //     victimSigner
  //   );

  //   console.log("Victim: Enter Markets");
  //   const enterMarketsVictimTx = await JoetrollerContract.enterMarkets([C.jWAVAX.delegatorAddr]);
  //   await enterMarketsVictimTx.wait();

  //   console.log("Victim: Borrowing 10 USDC");
  //   const victimBorrowAmount = 10 * 1e6;
  //   const victimsBorrowTokenContract = await ethers.getContractAt(C.JTOKEN_ABI, C.jUSDCE.delegatorAddr, victimSigner);
  //   const borrowUsdceVictimTx = await victimsBorrowTokenContract.borrow(victimBorrowAmount)
  //   const result = await borrowUsdceVictimTx.wait();
  //   // console.log("REsult: ", result)

  //   // Assert balance
  //   console.log("Victim Address: ", await victimSigner.getAddress())
  //   const victimUsdceBalance: BigNumber = await USDCE.balanceOf(
  //     await victimSigner.getAddress()
  //   );
  //   console.log("Victim USDCE balance: ", victimUsdceBalance.toNumber());
  //   expect(victimUsdceBalance.toNumber()).equals(victimBorrowAmount);
  //   const jUSDCEContract = await ethers.getContractAt(
  //     C.JTOKEN_ABI,
  //     C.jUSDCE.delegatorAddr,
  //     victimSigner
  //   );
  //   const victimjUsdceBorrowBalance = await jUSDCEContract.borrowBalanceStored(
  //     await victimSigner.getAddress()
  //   );
  //   console.log("victim jUSDCE borrowBalance: ", victimjUsdceBorrowBalance)
  //   expect(victimjUsdceBorrowBalance.toNumber()).equals(victimBorrowAmount);

  //   const usdcBalanceBeforeFlashLoan: BigNumber = await USDCE.balanceOf(ljoe.address);
  //   console.log("Balance after trade, before transfer: ", usdcBalanceBeforeFlashLoan);

  //   // STEP 5: Attempt to liquidate the victim Execute the flashloan
  //   console.log("Executing flashloan");
  //   console.log("LJOE Signer: ", ljoe.signer)
  //   const flashLoanTx = await ljoe.connect(ljoe.signer).doFlashloan(
  //     C.jUSDCE.delegatorAddr,
  //     C.jUSDCE.token.address,
  //     10 * 1e6,
  //     await victimSigner.getAddress()
  //   );
  //   const flashLoanTxResult = await flashLoanTx.wait();
  // });
});
