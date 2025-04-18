import React from "react";
import styled from "@emotion/styled";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
}

export const Checkbox: React.FC<Props> = ({ checked, children, ...props }) => {
  return (
    <Root data-checkbox="true">
      <HiddenCheckbox checked={checked} type="checkbox" {...props} />
      <StyledCheckbox checked={checked}>
        <CheckedIcon height="10" viewBox="0 0 8 7" width="12" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1.18626 2.32915L0 2.90673L2.69078 7H4.16637L8 0.577578L6.78481 -2.55301e-07L3.42857 5.83229L1.18626 2.32915Z"
            fill="currentColor"
          />
        </CheckedIcon>
      </StyledCheckbox>
      {children}
    </Root>
  );
};

const Root = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
`;

const CheckedIcon = styled.svg`
  fill: none;
`;

const HiddenCheckbox = styled.input`
  appearance: none;
  width: 0;
  height: 0;
`;

const StyledCheckbox = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid ${({ theme }) => theme.colors.strokeAccent};
  margin-right: 8px;

  background-color: ${({ checked, theme }) => (checked ? theme.colors.strokeAccent : "unset")};

  ${CheckedIcon} {
    visibility: ${({ checked }) => (checked ? "visible" : "hidden")};
    color: ${({ theme }) => theme.colors.bgSecondary};
  }
`;
