import styled from "@emotion/styled";

import { media } from "@themes/breakpoints";

export interface FlexProps {
  justifyContent?: "start" | "flex-end" | "space-around" | "space-between" | "center";
  alignItems?: "start" | "end" | "center" | "inherit" | "unset" | "flex-end" | "flex-start" | "baseline";
  crossAxisSize?: "min" | "max";
  mainAxisSize?: "fit-content" | "stretch";
}

export const Row = styled.div<FlexProps>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ justifyContent }) => justifyContent ?? "start"};
  align-items: ${({ alignItems }) => alignItems ?? "start"};
  height: ${({ crossAxisSize }) => (crossAxisSize === "max" ? "100%" : "fit-content")};
  width: ${({ mainAxisSize }) => (mainAxisSize === "fit-content" ? "fit-content" : "100%")};
`;

export const Column = styled.div<FlexProps>`
  display: flex;
  flex-direction: column;
  justify-content: ${({ justifyContent }) => justifyContent ?? "start"};
  align-items: ${({ alignItems }) => alignItems ?? "start"};
  width: ${({ crossAxisSize }) => (crossAxisSize === "max" ? "100%" : "fit-content")};
  height: ${({ mainAxisSize }) => (mainAxisSize === "stretch" ? "100%" : "fit-content")};
`;

export const DesktopRow = styled(Row)`
  align-items: center;
  width: fit-content;
  display: none;

  ${media.desktop} {
    display: flex;
  }
`;

export const MobileRow = styled(Row)`
  display: flex;
  align-items: center;
  width: fit-content;

  ${media.desktop} {
    display: none;
  }
`;
