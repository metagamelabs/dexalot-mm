//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./ERC3156FlashBorrowerInterface.sol";
import "./ERC3156FlashLenderInterface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface Joetroller {
    function isMarketListed(address jTokenAddress) external view returns (bool);
}

interface JToken {
    function liquidateBorrowNative(address borrower, address jTokenCollateral) external payable returns (uint256);
    function liquidateBorrow(address borrower, uint256 repayAmount, address jTokenCollateral) external payable returns (uint256);
    function borrow(uint256 borrowAmount) external returns (uint256);
}

contract LiquidatorJoe is ERC3156FlashBorrowerInterface {
    /**
     * @notice joetroller address
     */
    address public joetroller;

    constructor(address _joetroller) {
        joetroller = _joetroller;
    }
    string private greeting;

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function doFlashloan(
        address flashloanLender,
        address borrowToken,
        uint256 borrowAmount,
        address victimAddr
    ) external {
        bytes memory data = abi.encode(borrowToken, borrowAmount, victimAddr, flashloanLender);
        ERC3156FlashLenderInterface(flashloanLender).flashLoan(this, address(this), borrowAmount, data);
    }

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) override public returns (bytes32) {
        console.log(initiator);
        console.logAddress(address(this));
        require(Joetroller(joetroller).isMarketListed(msg.sender), "LiquidatorJoe onFlashLoan: untrusted message sender");
        require(initiator == address(this), "FlashBorrower: Untrusted loan initiator");
        (address borrowToken, uint256 borrowAmount, address victimAddr, address borrowJToken) = abi.decode(data, (address, uint256, address, address));
        require(borrowToken == token, "encoded data (borrowToken) does not match");
        require(borrowAmount == amount, "encoded data (borrowAmount) does not match");
        ERC20(borrowToken).approve(msg.sender, amount + fee);
        // your logic is written here...

        console.logAddress(borrowToken);
        console.log("onFlashLoan(): BorrowToken=%s, borrowAmount=%s, fee=%s", borrowToken, borrowAmount, fee);
        console.log("onFlashLoan(): Victim Addr:");
        console.logAddress(victimAddr);

        // What we need to do now is...
        // to liquidate an AVAX borrow position, redeem underlying seize tokens,
        // swap underlying seize tokens for AVAX and return the flash loaned AVAX back to JWrappedNative.

        // You cannot flash loan and liquidateBorrow the same token. Instead you will need to:
        // Flash loan different token
        // Swap token to the one you want to repay debt for
        // Call liquidateBorrow

        // call liquidateBorrow
        // msg.sender: The account which shall liquidate the borrower by repaying their debt and seizing their collateral.
        // borrower : The account with negative account liquidity that shall be liquidated.
        // repayAmount : The amount of the borrowed asset to be repaid and converted into collateral, specified in units of the underlying borrowed asset.
        // cTokenCollateral : The address of the cToken currently held as collateral by a borrower, that the liquidator shall seize.
        // RETURN : 0 on success, otherwise an Error codes


        console.log("onFlashLoan(): querying balance");
        uint256 balance = ERC20(borrowToken).balanceOf(address(this));
        console.log("onFlashLoan(): USDCE Balance: %d", balance);

        // Call liquidateBorrow
        uint256 res = JToken(borrowJToken).liquidateBorrow(victimAddr, borrowAmount, borrowToken);
        console.log("onFlashLoan(): liquidateBorrowNative result: %d", res);


        return keccak256("ERC3156FlashBorrowerInterface.onFlashLoan");
    }
}
