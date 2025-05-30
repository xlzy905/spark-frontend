import React from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { BN } from "@blockchain/fuel/types";

import { SmartFlex } from "@components/SmartFlex";
import Text from "@components/Text";
import { media } from "@themes/breakpoints";

import { useStores } from "@stores";

import { toCurrency } from "@utils/toCurrency";

const StatsAllTime = observer(() => {
  const { leaderboardStore } = useStores();
  const stats = leaderboardStore.allTimeStats;

  return (
    <AllTimeStatsContent>
      <StatsItem>
        <Text type="H">All Time Volume</Text>
        <Text type="H" primary>
          {toCurrency(new BN(stats?.total_volume).toSignificant(0))}
        </Text>{" "}
      </StatsItem>
      <StatsItem>
        <Text type="H">All Time Trades</Text>
        <Text type="H" primary>
          {new BN(stats?.total_trades).toSignificant(0)}
        </Text>
      </StatsItem>
    </AllTimeStatsContent>
  );
});

export default StatsAllTime;

const AllTimeStatsContent = styled(SmartFlex)`
  background-color: #171717;
  border-radius: 10px;
  height: 132px;
  width: 100%;
  margin: 32px 0;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  ${media.mobile} {
    flex-direction: column;
    height: 260px;
  }
`;

const StatsItem = styled(SmartFlex)`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 130px;
  gap: 8px;
  &:first-child {
    border-right: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
  }
  ${media.mobile} {
    width: 100%;
    &:first-child {
      border-right: none;
      border-bottom: 1px solid ${({ theme }) => theme.colors.strokeSecondary};
    }
  }
`;
