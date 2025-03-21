import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import styled from "@emotion/styled";
import { observer } from "mobx-react";
import Competitions from "src/screens/Competitions";
import Leaderboard from "src/screens/Leaderboard";

import ConnectWalletDialog from "@components/ConnectWalletDialog";
import { Column } from "@components/Flex";
import Header from "@components/Header";
import { MobileAppStoreSheet } from "@components/Modal/MobileAppStoreSheet";
import { Onboarding } from "@components/Onboarding";
import { HeaderPoints } from "@components/Points/HeaderPoints";
import WalletConnectors from "@components/WalletConnectors";

import { useClearUrlParam } from "@hooks/useClearUrlParam";
import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";
import { MODAL_TYPE } from "@stores/ModalStore";

import SideManageAssets from "@screens/Assets/SideManageAssets/SideManageAssets";
import Dashboard from "@screens/Dashboard";
import Faucet from "@screens/Faucet";
import SpotScreen from "@screens/SpotScreen";
import Stats from "@screens/Stats/Stats";
import { SwapScreen } from "@screens/SwapScreen";

import { ROUTES } from "@constants";

import { FeatureToggleProvider, IntercomProvider, UnderConstructionProvider } from "@src/providers";
import { DiscordProvider } from "@src/providers/DiscordProvider";

const App: React.FC = observer(() => {
  const { modalStore, tradeStore } = useStores();
  const media = useMedia();

  const [isAppStoreSheetVisible, setIsAppStoreSheetVisible] = useState(() => media.mobile);

  // This hooks is used to clear unnecessary URL parameters,
  // specifically "tx_id", after returning from the faucet
  useClearUrlParam("tx_id");

  // usePrivateKeyAsAuth();

  return (
    <IntercomProvider>
      <DiscordProvider>
        <FeatureToggleProvider>
          <UnderConstructionProvider>
            <Root>
              <Header />
              <HeaderPoints />
              <Routes>
                <Route element={<SpotScreen />} path={`${ROUTES.SPOT}/:marketId`} />
                <Route element={<SwapScreen />} path={ROUTES.SWAP} />
                <Route element={<Faucet />} path={ROUTES.FAUCET} />
                <Route element={<Navigate to={ROUTES.ROOT} />} path="*" />
                <Route element={<Navigate to={`${ROUTES.SPOT}/${tradeStore.marketSymbol}`} />} path={ROUTES.ROOT} />
                <Route element={<Dashboard />} path={ROUTES.DASHBOARD} />
                <Route element={<Leaderboard />} path={ROUTES.LEADERBOARD} />
                <Route element={<Competitions />} path={ROUTES.COMPETITIONS} />
                <Route element={<Stats />} path={ROUTES.STATS} />
              </Routes>
              <SideManageAssets />
              <WalletConnectors visible={modalStore.isOpen(MODAL_TYPE.SELECT_WALLET)} onClose={modalStore.close} />
              <ConnectWalletDialog visible={modalStore.isOpen(MODAL_TYPE.CONNECT)} onClose={modalStore.close} />
              <MobileAppStoreSheet isOpen={isAppStoreSheetVisible} onClose={() => setIsAppStoreSheetVisible(false)} />
              <Onboarding />
            </Root>
          </UnderConstructionProvider>
        </FeatureToggleProvider>
      </DiscordProvider>
    </IntercomProvider>
  );
});

export default App;

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  height: 100vh;
`;
