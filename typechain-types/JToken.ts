/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface JTokenInterface extends utils.Interface {
  contractName: "JToken";
  functions: {
    "borrow(uint256)": FunctionFragment;
    "liquidateBorrow(address,uint256,address)": FunctionFragment;
    "liquidateBorrowNative(address,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "borrow",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "liquidateBorrow",
    values: [string, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "liquidateBorrowNative",
    values: [string, string]
  ): string;

  decodeFunctionResult(functionFragment: "borrow", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "liquidateBorrow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "liquidateBorrowNative",
    data: BytesLike
  ): Result;

  events: {};
}

export interface JToken extends BaseContract {
  contractName: "JToken";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: JTokenInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    borrow(
      borrowAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    liquidateBorrow(
      borrower: string,
      repayAmount: BigNumberish,
      jTokenCollateral: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    liquidateBorrowNative(
      borrower: string,
      jTokenCollateral: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  borrow(
    borrowAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  liquidateBorrow(
    borrower: string,
    repayAmount: BigNumberish,
    jTokenCollateral: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  liquidateBorrowNative(
    borrower: string,
    jTokenCollateral: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    borrow(
      borrowAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    liquidateBorrow(
      borrower: string,
      repayAmount: BigNumberish,
      jTokenCollateral: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    liquidateBorrowNative(
      borrower: string,
      jTokenCollateral: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    borrow(
      borrowAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    liquidateBorrow(
      borrower: string,
      repayAmount: BigNumberish,
      jTokenCollateral: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    liquidateBorrowNative(
      borrower: string,
      jTokenCollateral: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    borrow(
      borrowAmount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    liquidateBorrow(
      borrower: string,
      repayAmount: BigNumberish,
      jTokenCollateral: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    liquidateBorrowNative(
      borrower: string,
      jTokenCollateral: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
