import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import Text from "@components/Text";
import { media } from "@themes/breakpoints";

interface CountdownTimerProps {
  targetTime: number;
}

const getTimeLeft = (diffInMilliseconds: number): string => {
  const minutes = Math.floor((diffInMilliseconds / 1000 / 60) % 60);
  const hours = Math.floor((diffInMilliseconds / 1000 / 60 / 60) % 24);
  const days = Math.floor(diffInMilliseconds / 1000 / 60 / 60 / 24);

  return `${days}d ${hours}h ${minutes}m`;
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime }) => {
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
      <TimerText type="H" primary>
        -
      </TimerText>
    );
  }

  return (
    <TimerText type="H" primary>
      {remainingTime}
    </TimerText>
  );
};

const TimerText = styled(Text)`
  text-align: right;
  ${media.mobile} {
    text-align: left;
  }
`;
