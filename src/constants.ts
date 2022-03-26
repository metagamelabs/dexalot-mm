import { Token, ChainId } from "@traderjoe-xyz/sdk";

export interface Jtoken {
  token: Token;
  DELEGATOR_ADDR: string;
}
namespace C {

  export const DEXALOT_DEV_CHAIN_ID = 43112;

  export const DEXALOT_ORDERBOOK_ADDR = "0x1805bFdEf9df67F6943A640603D705E4768A97D1";
  export const DEXALOT_EXCHANGE_ADDR = "0x4344Ef6FD7cefbCe61083f0eD61F6176877b2622";
  export const DEXALOT_PORTFOLIO_ADDR = "0x17ca9Cc9E812D35DD8CBbE03ef526B8BBfab4380";
  export const DEXALOT_TRADE_PAIRS_ADDR = "0x8664EFa775aBf51aD5b2a179E088efF5AF477c73";

  export const DEXALOT_MM_WALLET_ADDR = "0x62c1e3bD7b3e9F7a915c1F84BD1a702b04F46482";
  
  export const ERC20_ABI = [
    "function balanceOf(address) external view returns (uint)",
    "function transfer(address, uint) external returns (bool)",
    "function decimals() public view returns (uint8)",
  ];

  export const DEXALOT_ORDERBOOK_ABI = [
  ]

  export const TEAM6_TOKEN = new Token(DEXALOT_DEV_CHAIN_ID, "0x16CfA1c19Cf532112b514db1164a85ad34C3E6de", 18, "TEAM6");

  export const HARDHAT_SIGNER_ADDR = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  export const HARDHAT_TEST_VICTIM_ADDR = "0x2546BcD3c84621e976D8185a91A922aE77ECEc30";
}

export default C;
