import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import { SmartFlex } from "@components/SmartFlex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import Tooltip from "@components/Tooltip";
import { media } from "@themes/breakpoints";

import InfoIcon from "@assets/icons/info.svg?react";

import { POINTS_LINK } from "@constants";
import TOKEN_LOGOS from "@constants/tokenLogos";

const END_DATE = new Date("2025-03-01T19:00:00.000Z");

export const DashboardPoints: React.FC = observer(() => {
  const fuelAmount = 0;
  const usdAmount = 0;

  return (
    <SmartFlex gap="20px" margin="40px 0 0 0" width="100%" column>
      <Text type={TEXT_TYPES.H} primary>
        Boost Rewards
      </Text>
      <PointsContainer>
        <SmartFlex center="y" justifyContent="space-between" width="100%">
          <SmartFlex gap="8px" column>
            <Tooltip
              content={
                <SmartFlex gap="4px" padding="8px" width="300px" column>
                  <Text type={TEXT_TYPES.BODY} primary>
                    These are the total Fuel tokens earned that will be distributed at the end of the season. The exact
                    dollar amount will change based on Fuel&apos;s current price. The exact token amount might change.
                  </Text>
                </SmartFlex>
              }
            >
              <SmartFlex center="y" gap="4px">
                <Text type={TEXT_TYPES.BODY} primary>
                  You earned
                </Text>
                <InfoIconStyled />
              </SmartFlex>
            </Tooltip>
            <SmartFlex gap="8px">
              <Text type={TEXT_TYPES.H} primary>
                ${usdAmount}
              </Text>
              <Text type={TEXT_TYPES.H} secondary>
                |
              </Text>
              <SmartFlex gap="4px">
                <img height="16px" src={TOKEN_LOGOS.FUEL} width="16px" />
                <Text type={TEXT_TYPES.H} secondary>
                  {fuelAmount} FUEL
                </Text>
              </SmartFlex>
            </SmartFlex>
          </SmartFlex>
          <SmartFlex gap="8px" column>
            <Tooltip
              content={
                <SmartFlex gap="4px" padding="8px" width="300px" column>
                  <Text type={TEXT_TYPES.BODY} primary>
                    Current season lasts for 45 days total. All rewards will be distributed at the end of the season.
                  </Text>
                </SmartFlex>
              }
            >
              <SmartFlex center="y" gap="4px">
                <Text type={TEXT_TYPES.BODY} primary>
                  Season duration
                </Text>
                <InfoIconStyled />
              </SmartFlex>
            </Tooltip>
            <CountdownTimer targetTime={END_DATE.getTime()} />
          </SmartFlex>
        </SmartFlex>
        <Divider />
        <InfoContainer>
          <Text type={TEXT_TYPES.BODY} secondary>
            Rewards are estimates and final rewards can be slightly different
          </Text>
          <ExternalLink href={POINTS_LINK} rel="noreferrer noopener" target="_blank">
            Learn More →
          </ExternalLink>
        </InfoContainer>
      </PointsContainer>
    </SmartFlex>
  );
});

interface CountdownTimerProps {
  targetTime: number;
}

const getTimeLeft = (diffInMilliseconds: number): string => {
  const minutes = Math.floor((diffInMilliseconds / 1000 / 60) % 60);
  const hours = Math.floor((diffInMilliseconds / 1000 / 60 / 60) % 24);
  const days = Math.floor(diffInMilliseconds / 1000 / 60 / 60 / 24);

  return `${days}d ${hours}h ${minutes}m`;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime }) => {
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const diffInMilliseconds = targetTime - Date.now();

      setRemainingTime(getTimeLeft(diffInMilliseconds));

      if (diffInMilliseconds <= 0) {
        clearInterval(interval);
        setRemainingTime("Completed");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (!remainingTime.length) {
    return (
      <TimerText type={TEXT_TYPES.H} primary>
        -
      </TimerText>
    );
  }

  return (
    <TimerText type={TEXT_TYPES.H} primary>
      {remainingTime}
    </TimerText>
  );
};

const PointsContainer = styled(SmartFlex)`
  border: 1px solid ${({ theme }) => theme.colors.greenStrong};
  background-color: ${({ theme }) => theme.colors.greenWeek};

  border-radius: 8px;

  flex-direction: column;
  gap: 16px;

  padding: 24px 24px 16px;

  width: 100%;

  ${media.mobile} {
    gap: 12px;
    padding: 12px;
  }
`;

const InfoIconStyled = styled(InfoIcon)`
  width: 12px;
  height: 12px;

  & > path {
    fill: ${({ theme }) => theme.colors.textDisabled};
  }
`;

const TimerText = styled(Text)`
  text-align: right;
`;

const Divider = styled(SmartFlex)`
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.greenMedium};
`;

const InfoContainer = styled(SmartFlex)`
  justify-content: space-between;

  ${media.mobile} {
    flex-direction: column;
    gap: 8px;
  }
`;

const ExternalLink = styled.a`
  ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}

  color: ${({ theme }) => theme.colors.greenStrong};

  cursor: pointer;
`;
