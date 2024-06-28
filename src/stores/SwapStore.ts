import { AssetType, GetOrdersParams, OrderType } from "@compolabs/spark-orderbook-ts-sdk";
import { autorun, makeAutoObservable } from "mobx";
import { Undefinable } from "tsdef";

import { FuelNetwork } from "@src/blockchain";
import { createToast } from "@src/components/Toast";
import { DEFAULT_DECIMALS } from "@src/constants";
import { TokenOption } from "@src/screens/SwapScreen/TokenSelect";
import BN from "@src/utils/BN";
import { parseNumberWithCommas } from "@src/utils/swapUtils";

import RootStore from "./RootStore";

class SwapStore {
  tokens: TokenOption[];
  sellToken: TokenOption;
  buyToken: TokenOption;
  // maybe use BN
  payAmount: string;
  receiveAmount: string;
  buyTokenPrice: string;
  sellTokenPrice: string;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    this.tokens = this.fetchNewTokens();
    this.sellToken = this.tokens[0];
    this.buyToken = this.tokens[1];
    this.payAmount = "0.00";
    this.receiveAmount = "0.00";

    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);

    autorun(async () => {
      await this.initialize();
    });
  }

  async initialize() {
    await this.rootStore.balanceStore.initialize();
    this.updateTokens();
  }

  getPrice(token: TokenOption): string {
    const { oracleStore } = this.rootStore;
    return token.priceFeed
      ? BN.formatUnits(oracleStore.getTokenIndexPrice(token.priceFeed), DEFAULT_DECIMALS).toFormat(2)
      : "0";
  }

  updateTokens() {
    const newTokens = this.fetchNewTokens();
    this.tokens = newTokens;
    this.sellToken = newTokens[0];
    this.buyToken = newTokens[1];
    this.buyTokenPrice = this.getPrice(this.buyToken);
    this.sellTokenPrice = this.getPrice(this.sellToken);
  }

  fetchNewTokens(): TokenOption[] {
    const { balanceStore } = this.rootStore;
    const bcNetwork = FuelNetwork.getInstance();

    return bcNetwork!
      .getTokenList()
      .filter((token) => token.symbol !== "ETH")
      .map((v) => {
        const balance = balanceStore.getBalance(v.assetId);
        const formatBalance = BN.formatUnits(balance ?? BN.ZERO, v.decimals);
        const token = bcNetwork!.getTokenByAssetId(v.assetId);

        return {
          key: token.symbol,
          title: token.name,
          symbol: token.symbol,
          img: token.logo,
          balance: formatBalance?.toFormat(4),
          priceFeed: token.priceFeed,
          assetId: token.assetId,
        };
      });
  }

  swapTokens = async ({ slippage }: { slippage: number }) => {
    const { notificationStore, balanceStore } = this.rootStore;
    const hash: Undefinable<string> = "";
    const bcNetwork = FuelNetwork.getInstance();

    const params: GetOrdersParams = {
      limit: 100, // or more if needed
      asset: this.buyToken.assetId, // sellToken.assetId for sell orders
      status: ["Active"],
    };

    const sellOrders = await bcNetwork!.fetchSpotOrders({ ...params, orderType: OrderType.Buy });
    // TODO: check if there is enough price sum to fulfill the order

    const deposit = {
      amount: this.receiveAmount, // payAmount for sell order
      asset: this.buyToken.assetId, // sellToken.assetId for sell order
    };

    // fulfillManyParams
    // amount: string;
    // assetType: AssetType;
    // orderType: OrderType;
    // price: string;
    // slippage: string;
    // orders: string[];

    const order = {
      amount: this.payAmount,
      assetType: AssetType.Base,
      orderType: OrderType.Buy,
      price: this.buyTokenPrice,
      slippage: "100",
      orders: sellOrders.map((order) => order.id),
    };

    //  await bcNetwork!.fulfillManyOrders(order, deposit)

    notificationStore.toast(createToast({ text: "Order Created", hash: hash }), {
      type: "success",
    });

    // await balanceStore.update();
    // return hash?
  };

  onSwitchTokens = () => {
    const sellTokenPrice = parseNumberWithCommas(this.sellTokenPrice);
    const buyTokenPrice = parseNumberWithCommas(this.buyTokenPrice);

    const tempToken = { ...this.sellToken };

    this.setSellToken(this.buyToken as TokenOption);
    this.setBuyToken(tempToken as TokenOption);

    this.setPayAmount(this.receiveAmount);

    const newReceiveAmount = Number(this.receiveAmount) * (buyTokenPrice / sellTokenPrice);
    this.setReceiveAmount(newReceiveAmount.toFixed(4));
  };

  setSellToken(token: TokenOption) {
    this.sellToken = token;
    this.sellTokenPrice = this.getPrice(token);
  }

  setBuyToken(token: TokenOption) {
    this.buyToken = token;
    this.buyTokenPrice = this.getPrice(token);
  }

  setPayAmount(value: string) {
    this.payAmount = value;
  }

  setReceiveAmount(value: string) {
    this.receiveAmount = value;
  }
}

export default SwapStore;
