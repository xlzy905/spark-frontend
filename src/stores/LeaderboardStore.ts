import _ from "lodash";
import { makeAutoObservable, reaction } from "mobx";

import {
  GetSortedLeaderboardQueryParams,
  LeaderboardPnlResponse,
  TraderVolumeResponse,
} from "@compolabs/spark-orderbook-ts-sdk";

import { FiltersProps } from "@stores/DashboardStore";

import { filters, pnlTimeline } from "@screens/Dashboard/const";

import { CONFIG } from "@utils/getConfig";

import { FuelNetwork } from "@blockchain";

import RootStore from "./RootStore";

const config = {
  url: CONFIG.APP.sentioUrl,
  apiKey: "TLjw41s3DYbWALbwmvwLDM9vbVEDrD9BP",
};

export interface PaginationProps {
  title: string;
  key: number;
}

export const PAGINATION_PER_PAGE: PaginationProps[] = [
  { title: "10", key: 10 },
  { title: "25", key: 25 },
  { title: "50", key: 50 },
  { title: "100", key: 100 },
];

class LeaderboardStore {
  initialized = false;
  activeUserStat = 0;
  activeTime = 0;
  page = 1;
  activeFilter = filters[0];
  leaderboard: TraderVolumeResponse[] = [];
  leaderboardPnl: LeaderboardPnlResponse[] = [];
  searchWallet = "";
  orderPerPage: PaginationProps = PAGINATION_PER_PAGE[0];
  sortLeaderboard = {
    field: "volume",
    side: "DESC",
  };
  isLoading = false;

  constructor(private rootStore: RootStore) {
    const { accountStore } = this.rootStore;
    makeAutoObservable(this);
    this.init();

    reaction(
      () => [this.activeFilter, accountStore.address, this.searchWallet, this.orderPerPage],
      () => {
        this.page = 1;
        this.resolveFetch();
      },
    );

    reaction(
      () => [accountStore.isConnected],
      () => {
        if (!accountStore.isConnected) this.disconnect();
      },
    );
  }

  private resolveFetch = async () => {
    this.isLoading = true;
    if (this.sortLeaderboard.field === "volume") {
      await this.fetchSortedLeaderboard();
    } else {
      await this.fetchSortedPnlLeaderboard();
    }
    this.isLoading = false;
  };

  private fetchLeaderboard = async (wallets: string[]) => {
    return wallets;
    // const bcNetwork = FuelNetwork.getInstance();
    // const params = {
    //   limit: this.orderPerPage.key,
    //   page: this.page - 1,
    //   search: this.searchWallet,
    //   currentTimestamp: Math.floor(new Date().getTime() / 1000),
    //   interval: this.activeFilter.value * 3600,
    //   side: this.sortLeaderboard.side,
    //   wallets: wallets,
    // };
    // const t = await bcNetwork.getLeaderboard(params);
    // console.log("t", t);
    // TODO: Сортировка по pnl
  };

  private fetchSortedPnlLeaderboard = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const params = {
      limit: this.orderPerPage.key,
      page: this.page - 1,
      side: this.sortLeaderboard.side,
      timeline: pnlTimeline[this.activeFilter.title as keyof typeof pnlTimeline],
    };
    const data = await bcNetwork.fetchSortedLeaderboardPnl(params);
    const wallets = data?.result?.rows.map((el) => el.user);
    this.fetchLeaderboard(wallets);
    // this.leaderboardPnl = data?.result?.rows ?? [];
  };

  private fetchPnlLeaderboard = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const wallets = this.leaderboard.map((el) => el.walletId);
    const data = await bcNetwork.fetchLeaderBoardPnl({ wallets });
    this.leaderboardPnl = data?.result?.rows ?? [];
  };

  private fetchSortedLeaderboard = async () => {
    const bcNetwork = FuelNetwork.getInstance();
    const params = {
      limit: this.orderPerPage.key,
      page: this.page - 1,
      search: this.searchWallet,
      currentTimestamp: Math.floor(new Date().getTime() / 1000),
      interval: this.activeFilter.value * 3600,
      side: this.sortLeaderboard.side,
    };
    bcNetwork.setSentioConfig(config);

    const data = await bcNetwork.getSortedLeaderboard(params);
    const mainData = data?.result?.rows ?? [];

    let finalData = mainData;

    if (this.page === 1) {
      const dataMe = await this.fetchMeLeaderboard(params);
      if (dataMe.length > 0) {
        finalData = [...dataMe, ...mainData];
      }
    }
    this.leaderboard = finalData;
    this.fetchPnlLeaderboard();
  };

  private fetchMeLeaderboard = async (params: GetSortedLeaderboardQueryParams) => {
    const { accountStore } = this.rootStore;
    if (!accountStore.address) return [];
    const bcNetwork = FuelNetwork.getInstance();
    params.page = this.page - 1;
    params.search = accountStore.address;
    const data = await bcNetwork.getSortedLeaderboard(params);
    let meData = data?.result?.rows[0] ?? null;
    const meDataMock: TraderVolumeResponse = {
      walletId: accountStore.address,
      traderVolume: 0,
      id: "N/A",
      totalCount: 0,
      isYour: true,
    };
    if (meData) {
      meDataMock.id = (meData?.id as number) > 100 ? "+100" : (meData.id as number);
    } else {
      meData = meDataMock;
    }

    return [meData];
  };

  public setActivePage = (page: number) => {
    this.page = page;
    this.resolveFetch();
  };

  public setActiveFilter = (filter: FiltersProps) => {
    this.activeFilter = filter;
  };

  public setOrderPerPage = (page: PaginationProps) => {
    this.orderPerPage = page;
  };

  fetchLeaderboardDebounce = _.debounce(this.resolveFetch, 250);

  public setSearchWallet = (searchWallet: string) => {
    this.searchWallet = searchWallet;
    this.fetchLeaderboardDebounce();
  };

  private findSideSort = (side: string) => {
    return side === "ASC" ? "DESC" : "ASC";
  };

  makeSort = (field: string) => {
    console.log("ckick");
    this.sortLeaderboard =
      field === this.sortLeaderboard.field
        ? { field: this.sortLeaderboard.field, side: this.findSideSort(this.sortLeaderboard.side) }
        : { field, side: "asc" };
    console.log("this.sortLeaderboard", this.sortLeaderboard);
    this.resolveFetch();
  };

  get maxTotalCount() {
    return this.leaderboard.reduce((max, item) => {
      return item?.totalCount > max ? item.totalCount : max;
    }, 0);
  }

  init = async () => {
    this.initialized = true;
    const date = new Date();
    this.resolveFetch();
    this.activeTime = this.calculateTime(date, 24);
  };

  disconnect = () => {
    this.initialized = false;
    this.activeUserStat = 0;
    this.activeTime = 0;
    this.activeFilter = filters[0];
  };

  calculateTime = (date: Date, range: number) => {
    return Math.floor(date.setHours(date.getHours() - range) / 1000);
  };
}

export default LeaderboardStore;
