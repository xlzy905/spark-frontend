import React, { HTMLAttributes, useState } from "react";
import styled from "@emotion/styled";

import SizedBox from "@components/SizedBox";
import { media } from "@themes/breakpoints";

import arrowIcon from "@assets/icons/arrowUp.svg";

import { Column } from "./Flex";
import Text, { TEXT_TYPES_MAP } from "./Text";
import Tooltip from "./Tooltip";

interface SelectOption<T = string> {
  key: T;
  title: string | JSX.Element;
  value?: string | number;
  disabled?: boolean;
}

interface SelectProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  options: SelectOption<T>[];
  selected?: T;
  onSelect: (option: SelectOption<T>, index: number) => void;
  label?: string;
}

const Select = <T,>({ options, selected, onSelect, label, ...rest }: SelectProps<T>) => {
  const [isVisible, setIsVisible] = useState(false);
  const selectedOption = options.find(({ key }) => selected === key);
  const handleSelectClick = (v: SelectOption<T>, index: number) => {
    onSelect(v, index);
    setIsVisible(false);
  };

  return (
    <Tooltip
      config={{
        placement: "bottom-start",
        trigger: "click",
        visible: isVisible,
        onVisibleChange: setIsVisible,
      }}
      content={
        <Column crossAxisSize="max">
          {options.map((v, index) => {
            const active = selected === v.key;
            return (
              <Option
                key={v.key + "_option"}
                active={active}
                disabled={v.disabled}
                onClick={() => handleSelectClick(v, index)}
              >
                {v.title}
              </Option>
            );
          })}
        </Column>
      }
    >
      <Wrap focused={isVisible}>
        {label && (
          <>
            <Text>{label}</Text>
            <SizedBox height={2} />
          </>
        )}
        <Root onBlur={() => setIsVisible(false)} onClick={() => setIsVisible(true)} {...rest}>
          {selectedOption?.title ?? options[0]?.title}
          {/*<SizedBox width={10}/>*/}
          <img alt="arrow" className="menu-arrow" src={arrowIcon} />
        </Root>
      </Wrap>
    </Tooltip>
  );
};

export default Select;

const Root = styled.div<{
  focused?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  height: 40px;
  padding: 0 8px;
  box-sizing: border-box;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ focused, theme }) => (focused ? theme.colors.borderAccent : theme.colors.borderSecondary)};
  ${TEXT_TYPES_MAP.BODY}
  color: ${({ theme, disabled }) => (!disabled ? theme.colors.textPrimary : theme.colors.textDisabled)};
  cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;

  ${media.mobile} {
    height: 32px;
  }
`;

export const Option = styled.div<{
  active?: boolean;
  disabled?: boolean;
}>`
  width: 100%;
  display: flex;
  cursor: ${({ disabled }) => (!disabled ? "pointer" : "not-allowed")};
  align-items: center;
  background: ${({ active, theme }) => (active ? theme.colors.borderPrimary : "transparent")};
  color: ${({ disabled, theme }) => (disabled ? theme.colors.textDisabled : theme.colors.textPrimary)};
  padding: 8px 10px;
  box-sizing: border-box;
  white-space: nowrap;
  transition: 0.4s;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  :hover {
    background: ${({ theme, active, disabled }) =>
      active ? theme.colors.borderPrimary : disabled ? "transparent" : theme.colors.borderSecondary};
  }

  :active {
    background: ${({ theme, disabled }) => (!disabled ? theme.colors.borderPrimary : "transparent")};
  }

  ${TEXT_TYPES_MAP.BUTTON_SECONDARY};
`;

const Wrap = styled.div<{
  focused?: boolean;
  disabled?: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: 100%;

  .menu-arrow {
    transition: 0.4s;
    transform: ${({ focused }) => (focused ? "rotate(-180deg)" : "rotate(0deg)")};
  }

  :hover {
    .menu-arrow {
      transform: ${({ focused, disabled }) =>
        focused ? "rotate(-180)" : disabled ? "rotate(0deg)" : "rotate(-90deg)"};
    }
  }
`;
