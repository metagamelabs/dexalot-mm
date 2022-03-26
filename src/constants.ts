import { Token, ChainId } from "@traderjoe-xyz/sdk";

export interface Jtoken {
  token: Token;
  DELEGATOR_ADDR: string;
}
namespace C {
  export const JOETROLLER_ADDR = "0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC";

  export const JOEROUTER02_ADDR = "0x60ae616a2155ee3d9a68541ba4544862310933d4";

  export const ERC20_ABI = [
    "function balanceOf(address) external view returns (uint)",
    "function transfer(address, uint) external returns (bool)",
    "function decimals() public view returns (uint8)",
  ];

  export const JTOKEN_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function balanceOfUnderlying(address owner) external returns (uint256)",
    // "function liquidateBorrow(address borrower, uint256 repayAmount, JTokenInterface jTokenCollateral) external returns (uint256)"
    "function mintNative() external payable returns (uint256)",

    "function redeemNative(uint256 redeemTokens) external returns (uint256)",

    "function redeemUnderlyingNative(uint256 redeemAmount) external returns (uint256)",

    "function borrow(uint256 borrowAmount) external returns (uint256)",

    "function borrowNative(uint256 borrowAmount) external returns (uint256)",

    "function repayBorrowNative() external payable returns (uint256)",

    "function repayBorrowBehalfNative(address borrower) external payable returns (uint256)",

    "function liquidateBorrow(address borrower, uint256 repayAmount, JTokenInterface jTokenCollateral) external payable returns (uint256)",

    "function liquidateBorrowNative(address borrower, JTokenInterface jTokenCollateral) external payable returns (uint256)",

    "function flashLoan(ERC3156FlashBorrowerInterface receiver, address initiator, uint256 amount, bytes calldata data) external returns (bool)",

    "function registerCollateral(address account) external returns (uint256)",

    "function borrowBalanceStored(address account) public view returns (uint256)",
  ]

  export const jUSDCE = {
    token: new Token(
      ChainId.AVALANCHE,
      "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
      6,
      "USDC.e"
    ),
    delegatorAddr: "0xEd6AaF91a2B084bd594DBd1245be3691F9f637aC",
  };

  export const jWBTC = {
    token: new Token(
      ChainId.AVALANCHE,
      "0x50b7545627a5162F82A992c33b87aDc75187B218",
      18,
      "WBTC"
    ),
    delegatorAddr: "0x3fE38b7b610C0ACD10296fEf69d9b18eB7a9eB1F",
  }

  export const jWAVAX = {
    token: new Token(
      ChainId.AVALANCHE,
      "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      18,
      "WAVAX"
    ),
    delegatorAddr: "0xC22F01ddc8010Ee05574028528614634684EC29e",
  }

  export const HARDHAT_SIGNER_ADDR = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  export const HARDHAT_TEST_VICTIM_ADDR = "0x2546BcD3c84621e976D8185a91A922aE77ECEc30";
}

export default C;
