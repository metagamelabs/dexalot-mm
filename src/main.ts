import { request, gql } from "graphql-request";
import yargs from "yargs";

const argvPromise = yargs
  .option("addressToQuery", {
    description: "wallet to query. For debugging purposes.",
    alias: "addressToQuery",
    type: "string",
  })
  .help()
  .alias("help", "h").argv;

let argv: any;

const EXECUTE_SINGLE_ITERATION = true;

const UNDERWATER_ACCOUNTS_QUERY = `
{
  accounts(where: {health_gt: 0, health_lt: 1, totalBorrowValueInUSD_gt: 0}) {
      id
      health
      totalBorrowValueInUSD
      totalCollateralValueInUSD
      tokens {
        symbol
        enteredMarket
        jTokenBalance
        supplyBalanceUnderlying
        lifetimeBorrowInterestAccrued
      }
  }
}
`;

const ACCOUNT_JTOKEN_QUERY = `
{
  accounts(where: {health_gt: 0, health_lt: 1, totalBorrowValueInUSD_gt: 0}) {
      id
      health
      totalBorrowValueInUSD
      totalCollateralValueInUSD
  }
}
`;

const BANKER_JOE_SUBGRAPH_API =
  "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/lending";

interface Account {
  id: string;
  health: number;
  totalBorrowValueInUSD: number;
  totalCollateralValueInUSD: number;
  tokens: AccountJToken;
}

interface AccountJToken {
  id?: string;
  symbol: string;
  enteredMarket: boolean;
  jTokenBalance: number;
  accountBorrowIndex?: number;
  storedBorrowBalance?: number;
}

async function eventLoop(singleIteration: boolean = false) {
  if (argv.addressToQuery) {
    console.log("Querying specific wallet: ", argv.addressToQuery);

    const QUERY_SPECIFIC_WALLET = `
    {
      accounts(where: {id: "${argv.addressToQuery}"}) {
        id
        health
        totalBorrowValueInUSD
        totalCollateralValueInUSD
        tokens {
          symbol
          enteredMarket
          jTokenBalance
          supplyBalanceUnderlying
          lifetimeBorrowInterestAccrued
          borrowBalanceUnderlying
        }
      }
    }
    `;
    const queryResponse = await request(
      BANKER_JOE_SUBGRAPH_API,
      QUERY_SPECIFIC_WALLET
    );
    console.log(queryResponse.accounts[0]);

    return;
  }

  while (true) {
    let accounts: Array<Account> = [];
    try {
      const queryResponse = await request(
        BANKER_JOE_SUBGRAPH_API,
        UNDERWATER_ACCOUNTS_QUERY
      );
      accounts = queryResponse.accounts;
    } catch (err) {
      console.log("Error with query...");
      console.error(err);
    }

    console.log("# Accounts: ", accounts.length);

    console.log("Accounts[0]: ", accounts[0]);

    if (singleIteration) {
      return;
    }
  }
}

async function main() {
  console.log("Start");

  argv = await argvPromise;

  await eventLoop(EXECUTE_SINGLE_ITERATION);

  console.log("End");
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.log("Error: " + e);
  }
})();
