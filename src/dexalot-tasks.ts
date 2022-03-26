import { DexalotMM } from "../typechain-types/DexalotMM";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import C from "./constants";
import { SwapParameters } from "@traderjoe-xyz/sdk";
import _ from "lodash";

export async function swap(
  swapParams: SwapParameters,
  signer: Signer,
  avaxAmountIn?: string
) {
  console.log("SWAPPING: ", swapParams);

  const JoeRouter02Factory = await ethers.getContractFactory(
    "JoeRouter02",
    signer
  );
  const JOEROUTER = JoeRouter02Factory.attach(C.JOEROUTER02_ADDR);

  if (_.isEmpty(swapParams.methodName)) {
    throw Error("provided swapParams has no methodName");
  }

  if (swapParams.methodName == "swapExactAVAXForTokens") {
    let tx = await JOEROUTER.swapAVAXForExactTokens(...swapParams.args, {
      value: avaxAmountIn,
    });
    console.log("Done swapAVAXForExactTokens()");
    await tx.wait();
  } else if (swapParams.methodName == "swapExactTokensForTokens") {
    console.log("empty swapExactTokensForTokens()");
  } else {
    throw Error("Invalid swapParams.methodName: " + swapParams.methodName);
  }
}
