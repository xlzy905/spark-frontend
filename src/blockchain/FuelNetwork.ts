import { Account, B256Address } from "fuels";
import { makeObservable } from "mobx";
import { Nullable } from "tsdef";

import SparkOrderBookSdk, {
  GetActiveOrdersParams,
  Order,
  OrderType,
  WriteTransactionResponse,
} from "@compolabs/spark-orderbook-ts-sdk";

import BN from "@utils/BN";
import { CONFIG } from "@utils/getConfig";

import { SpotMarketOrder, Token } from "@entity";

import { Balances, SpotMarketVolume } from "./types";
import { WalletManager } from "./WalletManager";

export class FuelNetwork {
  private static instance: Nullable<FuelNetwork> = null;

  private walletManager = new WalletManager();
  private orderbookSdk: SparkOrderBookSdk;

  private constructor() {
    makeObservable(this.walletManager);

    this.orderbookSdk = new SparkOrderBookSdk({
      networkUrl: CONFIG.APP.networkUrl,
      contractAddresses: {
        orderbook: CONFIG.APP.contracts.orderbook,
        multiAsset: CONFIG.APP.contracts.multiAsset,
      },
    });
  }

  public static getInstance(): FuelNetwork {
    if (!FuelNetwork.instance) {
      FuelNetwork.instance = new FuelNetwork();
    }
    return FuelNetwork.instance;
  }

  setActiveMarket = (...params: Parameters<typeof this.orderbookSdk.setActiveMarket>) => {
    this.orderbookSdk.setActiveMarket(...params);
  };

  getAddress = (): Nullable<B256Address> => {
    return this.walletManager.address;
  };

  getPrivateKey(): Nullable<string> {
    return this.walletManager.privateKey;
  }

  getBalances = async (): Promise<Balances> => {
    return this.walletManager.getBalances();
  };

  getWallet = (): Nullable<any> => {
    return this.walletManager.wallet;
  };

  // TODO: Fix for mobile wallets connected to desktop
  getIsExternalWallet = () => false;

  getTokenList = (): Token[] => {
    return CONFIG.TOKENS;
  };

  getTokenBySymbol = (symbol: string): Token => {
    return CONFIG.TOKENS_BY_SYMBOL[symbol];
  };

  getTokenByAssetId = (assetId: string): Token => {
    return CONFIG.TOKENS_BY_ASSET_ID[assetId.toLowerCase()];
  };

  connect = async (wallet: Account): Promise<void> => {
    await this.walletManager.connect(wallet);
    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  connectWalletByPrivateKey = async (privateKey: string): Promise<void> => {
    const provider = await this.orderbookSdk.getProvider();
    await this.walletManager.connectByPrivateKey(privateKey, provider);
    this.orderbookSdk.setActiveWallet((this.walletManager.wallet as any) ?? undefined);
  };

  disconnectWallet = async (): Promise<void> => {
    await this.walletManager.disconnect();
    this.orderbookSdk.setActiveWallet(undefined);
  };

  addAssetToWallet = async (assetId: string): Promise<void> => {
    await this.walletManager.addAsset(assetId);
  };

  createSpotOrder = async (
    ...params: Parameters<typeof this.orderbookSdk.createOrder>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.createOrder(...params);
  };

  createSpotOrderWithDeposit = async (
    ...params: Parameters<typeof this.orderbookSdk.createOrderWithDeposit>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.createOrderWithDeposit(...params);
  };

  swapTokens = async (
    ...params: Parameters<typeof this.orderbookSdk.fulfillOrderMany>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.fulfillOrderMany(...params);
  };

  fulfillOrderManyWithDeposit = async (
    ...params: Parameters<typeof this.orderbookSdk.fulfillOrderManyWithDeposit>
  ): Promise<WriteTransactionResponse> => {
    console.log("order", ...params);
    return this.orderbookSdk.fulfillOrderManyWithDeposit(...params);
  };

  cancelSpotOrder = async (
    ...params: Parameters<typeof this.orderbookSdk.cancelOrder>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.cancelOrder(...params);
  };

  mintToken = async (...params: Parameters<typeof this.orderbookSdk.mintToken>): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.mintToken(...params);
  };

  withdrawSpotBalance = async (
    ...params: Parameters<typeof this.orderbookSdk.withdrawAssets>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.withdrawAssets(...params);
  };

  withdrawSpotBalanceAll = async (...params: Parameters<typeof this.orderbookSdk.withdrawAllAssets>): Promise<void> => {
    console.log("params", params);
    await this.orderbookSdk.withdrawAllAssets(...params);
  };

  depositSpotBalance = async (
    ...params: Parameters<typeof this.orderbookSdk.deposit>
  ): Promise<WriteTransactionResponse> => {
    return this.orderbookSdk.deposit(...params);
  };

  subscribeSpotOrders = (...params: Parameters<typeof this.orderbookSdk.subscribeOrders>) => {
    return this.orderbookSdk.subscribeOrders(...params);
  };

  subscribeSpotActiveOrders = <T extends OrderType>(
    ...params: Parameters<typeof this.orderbookSdk.subscribeActiveOrders<T>>
  ): ReturnType<typeof this.orderbookSdk.subscribeActiveOrders<T>> => {
    return this.orderbookSdk.subscribeActiveOrders(...params);
  };

  subscribeSpotTradeOrderEvents = (...params: Parameters<typeof this.orderbookSdk.subscribeTradeOrderEvents>) => {
    return this.orderbookSdk.subscribeTradeOrderEvents(...params);
  };

  fetchSpotMarketPrice = async (...params: Parameters<typeof this.orderbookSdk.fetchMarketPrice>): Promise<BN> => {
    return this.orderbookSdk.fetchMarketPrice(...params);
  };

  fetchSpotOrders = async (params: GetActiveOrdersParams): Promise<SpotMarketOrder[]> => {
    const { data } = await this.orderbookSdk.fetchActiveOrders(params);

    const formatOrder = (order: Order) =>
      new SpotMarketOrder({
        ...order,
        quoteAssetId: CONFIG.TOKENS_BY_SYMBOL.USDC.assetId,
      });

    if ("ActiveSellOrder" in data) {
      return data.ActiveSellOrder.map(formatOrder);
    } else {
      return data.ActiveBuyOrder.map(formatOrder);
    }
  };

  fetchSpotVolume = async (): Promise<SpotMarketVolume> => {
    const data = await this.orderbookSdk.fetchVolume();

    return {
      low: new BN(data.low24h),
      high: new BN(data.high24h),
      volume: new BN(data.volume24h),
    };
  };

  fetchSpotMatcherFee = async () => {
    return this.orderbookSdk.fetchMatcherFee();
  };

  fetchSpotProtocolFee = async () => {
    return this.orderbookSdk.fetchProtocolFee();
  };

  fetchSpotProtocolFeeForUser = async (...params: Parameters<typeof this.orderbookSdk.fetchProtocolFeeForUser>) => {
    return this.orderbookSdk.fetchProtocolFeeForUser(...params);
  };

  fetchSpotProtocolFeeAmountForUser = async (
    ...params: Parameters<typeof this.orderbookSdk.fetchProtocolFeeAmountForUser>
  ) => {
    return this.orderbookSdk.fetchProtocolFeeAmountForUser(...params);
  };

  fetchSpotUserMarketBalance = async (...params: Parameters<typeof this.orderbookSdk.fetchUserMarketBalance>) => {
    return this.orderbookSdk.fetchUserMarketBalance(...params);
  };

  fetchUserMarketBalanceByContracts = async (
    ...params: Parameters<typeof this.orderbookSdk.fetchUserMarketBalanceByContracts>
  ) => {
    return this.orderbookSdk.fetchUserMarketBalanceByContracts(...params);
  };
}
