import React from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import Loader from "@components/Loader";
import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES } from "@components/Text";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

export const SpotTrades: React.FC = observer(() => {
  const { spotOrderBookStore } = useStores();
  const theme = useTheme();

  const isOrderBookEmpty = spotOrderBookStore.trades.length === 0;

  if (spotOrderBookStore.isTradesLoading && isOrderBookEmpty) {
    return <Loader size={32} hideText />;
  }

  if (isOrderBookEmpty)
    return (
      <Root alignItems="center" justifyContent="center" mainAxisSize="stretch">
        <Text type={TEXT_TYPES.SUPPORTING}>No trades yet</Text>
      </Root>
    );

  return (
    <Root>
      <Header>
        <Text type={TEXT_TYPES.SUPPORTING}>Qty</Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Price</Text>
        <Text type={TEXT_TYPES.SUPPORTING}>Time</Text>
      </Header>

      <Container className="better-scroll">
        {spotOrderBookStore.trades.map((trade) => (
          <Row key={"trade" + trade.id}>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {trade.formatTradeAmount}
            </Text>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {trade.formatPrice}
            </Text>
            <Text color={theme.colors.textPrimary} type={TEXT_TYPES.BODY}>
              {trade.timestamp.format("HH:mm:ss")}
            </Text>
          </Row>
        ))}
      </Container>
    </Root>
  );
});

const Root = styled(Column)`
  width: 100%;
  height: 100%;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  padding: 0 12px;
  text-align: center;
  height: 26px;
  align-items: center;
  gap: 10px;

  ${Text} {
    text-align: start;
  }

  ${media.mobile} {
    grid-template-columns: 1fr min-content;

    ${Text}:nth-of-type(2) {
      text-align: end;
    }
    ${Text}:nth-of-type(3) {
      display: none;
    }
  }
`;
const Container = styled.div`
  display: grid;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 12px 0;
  overflow-y: auto;
  max-height: calc(100vh - 260px);
  gap: 2px;
`;

const Row = styled(SmartFlex)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  height: 16px;

  gap: 10px;

  align-items: center;
  justify-content: space-between;
`;
