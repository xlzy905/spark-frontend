import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { Blockchain } from "@blockchain";

import Chip from "@components/Chip";
import { SmartFlex } from "@components/SmartFlex";
import { TableText } from "@components/Table";
import Text, { TEXT_TYPES_MAP } from "@components/Text";

import { useMedia } from "@hooks/useMedia";
import { useStores } from "@stores";

import { MINIMAL_ETH_REQUIRED } from "@constants";

import MintButtons from "./MintButtons";

const TokensFaucetTable: React.FC = observer(() => {
  const { faucetStore, balanceStore } = useStores();

  const media = useMedia();

  const bcNetwork = Blockchain.getInstance();

  const isEnoughGas = balanceStore.getWalletNativeBalance().gt(MINIMAL_ETH_REQUIRED);
  const ETH = bcNetwork.sdk.getTokenBySymbol("ETH");

  const shouldButtonBeDisabled = (tokenAddress: string) => {
    return !isEnoughGas && ETH.assetId !== tokenAddress;
  };

  const renderDesktop = () => {
    return (
      <DesktopTable className="better-scroll">
        <TableRow>
          <TableTitle>Asset</TableTitle>
          <TableTitle>Mint amount</TableTitle>
          <TableTitle>Wallet balance</TableTitle>
          <TableTitle></TableTitle>
        </TableRow>
        <TableBody>
          {faucetStore.faucetTokens.map((token) => (
            <TableRow key={token.assetId}>
              <TableText type="BUTTON_SECONDARY" primary>
                {token.name}
              </TableText>
              <TableText type="BUTTON_SECONDARY" primary>
                {token.mintAmount.toSignificant(3)} &nbsp;<Chip>{token.symbol}</Chip>
              </TableText>
              <TableText type="BUTTON_SECONDARY" primary>
                {token.formatBalance?.toSignificant(3)} &nbsp;<Chip>{token.symbol}</Chip>
              </TableText>
              <MintButtons assetId={token.assetId} disabled={shouldButtonBeDisabled(token.assetId)} />
            </TableRow>
          ))}
        </TableBody>
      </DesktopTable>
    );
  };

  const renderMobile = () => {
    return (
      <MobileContainer>
        {faucetStore.faucetTokens.map((token) => (
          <MintItemContainer key={token.assetId}>
            <SmartFlex justifyContent="space-between">
              <Text type="BUTTON_SECONDARY" primary>
                {token.name}
              </Text>
              <MintButtons assetId={token.assetId} disabled={shouldButtonBeDisabled(token.assetId)} />
            </SmartFlex>
            <SmartFlex gap="64px">
              <SmartFlex gap="8px" column>
                <Text type="SUPPORTING">Mint amount</Text>
                <SmartFlex center="y" gap="4px">
                  <Text type="BODY" primary>
                    {token.mintAmount.toSignificant(3)}
                  </Text>
                  <Text>{token.symbol}</Text>
                </SmartFlex>
              </SmartFlex>
              <SmartFlex gap="8px" column>
                <Text type="SUPPORTING">My balance</Text>
                <SmartFlex center="y" gap="4px">
                  <Text type="BODY" primary>
                    {token.formatBalance.toSignificant(3)}
                  </Text>
                  <Text>{token.symbol}</Text>
                </SmartFlex>
              </SmartFlex>
            </SmartFlex>
          </MintItemContainer>
        ))}
      </MobileContainer>
    );
  };

  return media.desktop ? renderDesktop() : renderMobile();
});

export default TokensFaucetTable;

const DesktopTable = styled(SmartFlex)`
  background: ${({ theme }) => theme.colors.bgSecondary};
  width: 100%;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
  overflow: hidden;
  border-radius: 10px;
  overflow-x: auto;
  max-width: 100%;

  & > * {
    min-width: 580px;
  }
`;

const MobileContainer = styled(SmartFlex)`
  flex-direction: column;
  gap: 2px;
`;

const TableRow = styled(SmartFlex)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;

  margin-bottom: 1px;
  height: 48px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  align-items: center;
  padding: 0 12px;

  & > :last-child {
    justify-self: flex-end;
  }
`;

const TableTitle = styled(Text)`
  flex: 1;
  white-space: nowrap;
  ${TEXT_TYPES_MAP.SUPPORTING}
`;

const TableBody = styled(SmartFlex)`
  flex-direction: column;
  width: 100%;
`;

const MintItemContainer = styled(SmartFlex)`
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.borderSecondary};
  border-radius: 10px;

  padding: 16px;
  gap: 16px;
`;
