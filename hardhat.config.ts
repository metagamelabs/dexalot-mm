import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-abi-exporter";

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
    ],
  },
  networks: {
    hardhat: {
      chainId: 43114,
      gasPrice: 225000000000,
      forking: {
        url: "https://api.avax.network/ext/bc/C/rpc",
        enabled: true,
        blockNumber: 11271698,
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
    timeout: 100000
  }
};

export default config;
