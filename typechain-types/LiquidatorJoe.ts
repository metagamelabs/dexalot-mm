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
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface LiquidatorJoeInterface extends utils.Interface {
  contractName: "LiquidatorJoe";
  functions: {
    "doFlashloan(address,address,uint256,address)": FunctionFragment;
    "greet()": FunctionFragment;
    "joetroller()": FunctionFragment;
    "onFlashLoan(address,address,uint256,uint256,bytes)": FunctionFragment;
    "setGreeting(string)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "doFlashloan",
    values: [string, string, BigNumberish, string]
  ): string;
  encodeFunctionData(functionFragment: "greet", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "joetroller",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "onFlashLoan",
    values: [string, string, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "setGreeting", values: [string]): string;

  decodeFunctionResult(
    functionFragment: "doFlashloan",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "greet", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "joetroller", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "onFlashLoan",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setGreeting",
    data: BytesLike
  ): Result;

  events: {};
}

export interface LiquidatorJoe extends BaseContract {
  contractName: "LiquidatorJoe";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LiquidatorJoeInterface;

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
    doFlashloan(
      flashloanLender: string,
      borrowToken: string,
      borrowAmount: BigNumberish,
      victimAddr: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    greet(overrides?: CallOverrides): Promise<[string]>;

    joetroller(overrides?: CallOverrides): Promise<[string]>;

    onFlashLoan(
      initiator: string,
      token: string,
      amount: BigNumberish,
      fee: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setGreeting(
      _greeting: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  doFlashloan(
    flashloanLender: string,
    borrowToken: string,
    borrowAmount: BigNumberish,
    victimAddr: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  greet(overrides?: CallOverrides): Promise<string>;

  joetroller(overrides?: CallOverrides): Promise<string>;

  onFlashLoan(
    initiator: string,
    token: string,
    amount: BigNumberish,
    fee: BigNumberish,
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setGreeting(
    _greeting: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    doFlashloan(
      flashloanLender: string,
      borrowToken: string,
      borrowAmount: BigNumberish,
      victimAddr: string,
      overrides?: CallOverrides
    ): Promise<void>;

    greet(overrides?: CallOverrides): Promise<string>;

    joetroller(overrides?: CallOverrides): Promise<string>;

    onFlashLoan(
      initiator: string,
      token: string,
      amount: BigNumberish,
      fee: BigNumberish,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    setGreeting(_greeting: string, overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    doFlashloan(
      flashloanLender: string,
      borrowToken: string,
      borrowAmount: BigNumberish,
      victimAddr: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    greet(overrides?: CallOverrides): Promise<BigNumber>;

    joetroller(overrides?: CallOverrides): Promise<BigNumber>;

    onFlashLoan(
      initiator: string,
      token: string,
      amount: BigNumberish,
      fee: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setGreeting(
      _greeting: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    doFlashloan(
      flashloanLender: string,
      borrowToken: string,
      borrowAmount: BigNumberish,
      victimAddr: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    greet(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    joetroller(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    onFlashLoan(
      initiator: string,
      token: string,
      amount: BigNumberish,
      fee: BigNumberish,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setGreeting(
      _greeting: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
