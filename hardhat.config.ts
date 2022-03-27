import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import {
  fetchTradingPairs,
  fetchDeploymentAbi,
  fetchOrderBookData,
  cancelAllOrders,
} from "./src/dexalot-tasks";
import { B32 } from "./src/types";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import C from "./src/constants";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-abi-exporter";
import _ from "lodash";
import chalk from "chalk";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

task(
  "accounts",
  "Prints the list of accounts",
  async (args, hre): Promise<void> => {
    const accounts: SignerWithAddress[] = await hre.ethers.getSigners();
    accounts.forEach((account: SignerWithAddress): void => {
      console.log(account.address);
    });
  }
);

task(
  "DexMMBalance",
  "Prints the Dex MM Balance",
  async (args, hre): Promise<void> => {
    const signer = await hre.ethers.getSigner(C.DEXALOT_MM_WALLET_ADDR);
    const balance: BigNumber = await hre.ethers.provider.getBalance(
      signer.address
    );
    console.log(`${signer.address} has balance ${balance.toString()}`);
  }
);

task(
  "balances",
  "Prints the list of AVAX account balances",
  async (args, hre): Promise<void> => {
    const accounts: SignerWithAddress[] = await hre.ethers.getSigners();
    for (const account of accounts) {
      const balance: BigNumber = await hre.ethers.provider.getBalance(
        account.address
      );
      console.log(`${account.address} has balance ${balance.toString()}`);
    }
  }
);

task(
  "fetchTradingPairs",
  "Prints the trading pairs Data from Dexalot REST API",
  async (args, hre): Promise<void> => {
    console.log(await fetchTradingPairs());
  }
);

task(
  "fetchDeploymentAbi",
  "Prints the deployment info from api",
  async (args: any, hre): Promise<void> => {
    console.log(await fetchDeploymentAbi(args.contractName));
  }
).addParam("contractName", "contract name to query");

task(
  "cancelAllOrders",
  "Cancels all orders",
  async (args: any, hre): Promise<void> => {
    // get orders
    const wallet = await new hre.ethers.Wallet(
      "8e9cdb3e5c49c5382c888772e0651cb62d89837fcddb7beb5875a2cf6e412d45",
      await hre.ethers.provider
    );
    const TradePairsFactory = await hre.ethers.getContractFactory(
      "TradePairs",
      wallet
    );
    const TradePairsContract = TradePairsFactory.attach(
      C.DEXALOT_TRADE_PAIRS_ADDR
    );

    await cancelAllOrders(TradePairsContract, wallet);

    console.log("cancel orders txn done");
  }
);

task(
  "printOnChainOrderBook",
  "Cancels all orders",
  async (args: any, hre): Promise<void> => {
    // get orders
    const wallet = await new hre.ethers.Wallet(
      "8e9cdb3e5c49c5382c888772e0651cb62d89837fcddb7beb5875a2cf6e412d45",
      await hre.ethers.provider
    );
    const TradePairsFactory = await hre.ethers.getContractFactory(
      "TradePairs",
      wallet
    );
    const TradePairsContract = TradePairsFactory.attach(
      C.DEXALOT_TRADE_PAIRS_ADDR
    );

    console.log(chalk.bgRed.white("SELLS"));
    console.log(chalk.bgRed.white("Price\tAmount"));
    const sellOrderBookQueryResult = await TradePairsContract.getNSellBook(
      B32("TEAM6/AVAX"),
      5,
      5,
      0,
      B32("")
    );
    const zippedSellOrderBook = _.zip(
      sellOrderBookQueryResult[0].map((x: BigNumber) =>
        hre.ethers.utils.formatEther(x)
      ),
      sellOrderBookQueryResult[1].map((x: BigNumber) =>
        hre.ethers.utils.formatEther(x)
      )
    ).filter((x: any) => x[1] > 0);
    zippedSellOrderBook.forEach((x) => {
      console.log(chalk.red(x[0], "\t", x[1]));
    });

    const buyOrderBookQueryResult = await TradePairsContract.getNBuyBook(
      B32("TEAM6/AVAX"),
      5,
      5,
      0,
      B32("")
    );
    const zippedBuyOrderBook = _.zip(
      buyOrderBookQueryResult[0].map((x: BigNumber) =>
        hre.ethers.utils.formatEther(x)
      ),
      buyOrderBookQueryResult[1].map((x: BigNumber) =>
        hre.ethers.utils.formatEther(x)
      )
    ).filter((x: any) => x[1] > 0);
    zippedBuyOrderBook.forEach((x) => {
      console.log(chalk.green(x[0], "\t", x[1]));
    });
    console.log(chalk.bgGreen.white("Price\tAmount"));
    console.log(chalk.bgGreen.white("BUYS:"));
  }
);

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 43112,
      gasPrice: 225000000000,
      forking: {
        url: "https://node.dexalot-dev.com/ext/bc/C/rpc",
        enabled: true,
        // blockNumber: 11271698,
      },
    },
    local: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
      ],
    },
    avalancheMainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: [],
    },
    dexalotDev: {
      url: "https://node.dexalot-dev.com/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43112,
      accounts: [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  abiExporter: {
    path: "./abi",
    clear: false,
    flat: true,
    // only: [],
    // except: []
  },
  mocha: {
    timeout: 100000,
  },
};

export default config;
