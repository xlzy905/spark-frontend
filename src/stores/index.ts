import { storesContext, useStores } from "@stores/useStores";

import AccountStore from "./AccountStore";
import FaucetStore from "./FaucetStore";
import MixPanelStore from "./MixPanelStore";
import NotificationStore from "./NotificationStore";
import QuickAssetsStore from "./QuickAssetsStore";
// import SpotOrdersStore from "./SpotOrdersStore";
import OracleStore from "./OracleStore";
import RootStore from "./RootStore";
import SettingsStore from "./SettingsStore";
import TradeStore from "./TradeStore";

export {
  AccountStore,
  FaucetStore,
  MixPanelStore,
  NotificationStore,
  OracleStore,
  QuickAssetsStore,
  RootStore,
  SettingsStore,
  storesContext,
  // SpotOrdersStore,
  TradeStore,
  useStores,
};
