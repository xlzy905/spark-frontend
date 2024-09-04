import React from "react";
import { LimitType } from "@compolabs/spark-orderbook-ts-sdk";
import styled from "@emotion/styled";
import { Accordion } from "@szhsin/react-accordion";
import { observer } from "mobx-react";

import AccordionItem from "@components/AccordionItem";
import { Row } from "@components/Flex";
import MaxButton from "@components/MaxButton";
import Select from "@components/Select";
import Slider from "@components/Slider";
import Text, { TEXT_TYPES } from "@components/Text";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@src/components/Button";
import SizedBox from "@src/components/SizedBox";
import { SmartFlex } from "@src/components/SmartFlex";
import { DEFAULT_DECIMALS } from "@src/constants";
import useFlag from "@src/hooks/useFlag";
import { useMedia } from "@src/hooks/useMedia";
import {
  ACTIVE_INPUT,
  ORDER_MODE,
  ORDER_TYPE,
  useCreateOrderVM,
} from "@src/screens/TradeScreen/RightBlock/CreateOrder/CreateOrderVM";
import { media } from "@src/themes/breakpoints";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

import { OrderTypeSheet, OrderTypeTooltip, OrderTypeTooltipIcon } from "./OrderTypeTooltip";

const ORDER_OPTIONS = [
  { title: "Market", key: ORDER_TYPE.Market, timeInForce: LimitType.FOK },
  { title: "Limit", key: ORDER_TYPE.Limit, timeInForce: LimitType.GTC },
  // { title: "Limit (IOC)", key: ORDER_TYPE.LimitIOC, timeInForce: LimitType.IOC },
  // { title: "Limit (FOK)", key: ORDER_TYPE.LimitFOK, timeInForce: LimitType.FOK },
];

export const MINIMAL_ETH_REQUIRED = 25000; // 0.000025

const CreateOrder: React.FC = observer(() => {
  const { balanceStore, tradeStore, settingsStore } = useStores();
  const vm = useCreateOrderVM();
  const market = tradeStore.market;

  const media = useMedia();

  const dataOnboardingTradingKey = `trade-${media.mobile ? "mobile" : "desktop"}`;

  const isButtonDisabled = vm.isLoading || !vm.canProceed;

  const [isOrderTooltipOpen, openOrderTooltip, closeOrderTooltip] = useFlag();

  if (!market) return null;

  const { baseToken, quoteToken } = market;

  const handlePercentChange = (v: number) => {
    const balance = balanceStore.getContractBalanceInfo(vm.isSell ? baseToken.assetId : quoteToken.assetId).amount;

    if (balance.isZero()) return;

    const value = BN.percentOf(balance, v);
    if (vm.isSell) {
      vm.setInputAmount(value);
      return;
    }

    vm.setInputTotal(value);
  };

  const handleSetOrderType = (type: ORDER_TYPE) => {
    settingsStore.setOrderType(type);
  };

  const handleSetTimeInForce = (timeInForce: LimitType) => {
    settingsStore.setTimeInForce(timeInForce);
  };

  const handleSetPrice = (amount: BN) => {
    if (settingsStore.orderType === ORDER_TYPE.Market) return;

    vm.setInputPrice(amount);
  };

  const disabledOrderTypes = [ORDER_TYPE.Limit, ORDER_TYPE.LimitFOK, ORDER_TYPE.LimitIOC];
  const isInputPriceDisabled = !disabledOrderTypes.includes(settingsStore.orderType);

  const renderButton = () => {
    const isEnoughGas = balanceStore.getNativeBalance().gt(MINIMAL_ETH_REQUIRED);

    if (!isButtonDisabled && !isEnoughGas) {
      return (
        <CreateOrderButton disabled>
          <Text type={TEXT_TYPES.BUTTON}>Insufficient ETH for gas</Text>
        </CreateOrderButton>
      );
    }

    return (
      <CreateOrderButton
        data-onboarding={dataOnboardingTradingKey}
        disabled={isButtonDisabled}
        green={!vm.isSell}
        red={vm.isSell}
        onClick={vm.createOrder}
      >
        <Text primary={!isButtonDisabled} type={TEXT_TYPES.BUTTON}>
          {vm.isLoading ? "Loading..." : vm.isSell ? `Sell ${baseToken.symbol}` : `Buy ${baseToken.symbol}`}
        </Text>
      </CreateOrderButton>
    );
  };

  const renderOrderTooltip = () => {
    if (media.mobile) {
      return <OrderTypeTooltipIcon text="Info" onClick={openOrderTooltip} />;
    }

    return <OrderTypeTooltip />;
  };

  const renderOrderDetails = () => {
    return (
      <Accordion transitionTimeout={400} transition>
        <AccordionItem
          header={
            <Row alignItems="center" justifyContent="space-between" mainAxisSize="stretch">
              <Text type={TEXT_TYPES.BUTTON_SECONDARY} nowrap primary>
                Order Details
              </Text>
              <Row alignItems="center" justifyContent="flex-end">
                <Text primary>{BN.formatUnits(vm.inputAmount, baseToken.decimals).toSignificant(4)}</Text>
                <Text>&nbsp;{baseToken.symbol}</Text>
              </Row>
            </Row>
          }
          defaultChecked
          initialEntered
        >
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Max {vm.isSell ? "sell" : "buy"}</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{BN.formatUnits(vm.inputTotal, quoteToken.decimals).toFormat(2)}</Text>
              <Text>&nbsp;{quoteToken.symbol}</Text>
            </Row>
          </Row>
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Matcher Fee</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{vm.matcherFee.toString()}</Text>
              <Text>&nbsp;ETH</Text>
            </Row>
          </Row>
          <Row alignItems="center" justifyContent="space-between">
            <Text nowrap>Total amount</Text>
            <Row alignItems="center" justifyContent="flex-end">
              <Text primary>{BN.formatUnits(vm.inputAmount, baseToken.decimals).toSignificant(4)}</Text>
              <Text>&nbsp;{baseToken.symbol}</Text>
            </Row>
          </Row>
        </AccordionItem>
      </Accordion>
    );
  };

  const getAvailableAmount = () => {
    return balanceStore.getFormatContractBalanceInfo(
      vm.isSell ? baseToken.assetId : quoteToken.assetId,
      vm.isSell ? baseToken.decimals : quoteToken.decimals,
    );
  };

  const onSelectOrderType = ({ key }: { key: ORDER_TYPE }) => {
    handleSetOrderType(key);
    const elementOption = ORDER_OPTIONS.find((el) => el.key === key);
    elementOption && handleSetTimeInForce(elementOption.timeInForce);
  };
  return (
    <Root column>
      <ButtonGroup>
        <Button active={!vm.isSell} onClick={() => vm.setOrderMode(ORDER_MODE.BUY)}>
          <Text primary={!vm.isSell} type={TEXT_TYPES.BUTTON_SECONDARY}>
            buy
          </Text>
        </Button>
        <Button active={vm.isSell} onClick={() => vm.setOrderMode(ORDER_MODE.SELL)}>
          <Text primary={vm.isSell} type={TEXT_TYPES.BUTTON_SECONDARY}>
            sell
          </Text>
        </Button>
      </ButtonGroup>
      <ParamsContainer>
        <StyledRow>
          <SelectOrderTypeContainer>
            <Select
              label="Order type"
              options={ORDER_OPTIONS}
              selected={settingsStore.orderType}
              onSelect={onSelectOrderType}
            />
            {renderOrderTooltip()}
          </SelectOrderTypeContainer>
          <TokenInput
            amount={vm.inputPrice}
            decimals={DEFAULT_DECIMALS}
            disabled={isInputPriceDisabled}
            label="Price"
            setAmount={handleSetPrice}
            onBlur={vm.setActiveInput}
            onFocus={() => vm.setActiveInput(ACTIVE_INPUT.Price)}
          />
        </StyledRow>
        <InputContainerWithError>
          <TokenInput
            amount={vm.inputAmount}
            assetId={baseToken.assetId}
            decimals={baseToken.decimals}
            error={vm.isSell ? vm.isInputError : undefined}
            errorMessage={`Not enough ${baseToken.symbol}`}
            label="Order size"
            setAmount={vm.setInputAmount}
            onBlur={vm.setActiveInput}
            onFocus={() => vm.setActiveInput(ACTIVE_INPUT.Amount)}
          />
          <InputContainerWithMaxButton>
            <StyledMaxButton fitContent onClick={vm.onMaxClick}>
              MAX
            </StyledMaxButton>
            <SizedBox height={14} />
            <TokenInput
              amount={vm.inputTotal}
              assetId={quoteToken.assetId}
              decimals={quoteToken.decimals}
              error={vm.isSell ? undefined : vm.isInputError}
              errorMessage={`Not enough ${quoteToken.symbol}`}
              setAmount={vm.setInputTotal}
              onBlur={vm.setActiveInput}
              onFocus={() => vm.setActiveInput(ACTIVE_INPUT.Total)}
            />
          </InputContainerWithMaxButton>
        </InputContainerWithError>
        <Row alignItems="center" justifyContent="space-between">
          <Text type={TEXT_TYPES.SUPPORTING}>Available</Text>
          <Row alignItems="center" mainAxisSize="fit-content">
            <Text type={TEXT_TYPES.BODY} primary>
              {getAvailableAmount()}
            </Text>
            <Text type={TEXT_TYPES.SUPPORTING}>&nbsp;{vm.isSell ? baseToken.symbol : quoteToken.symbol}</Text>
          </Row>
        </Row>
        <SliderContainer>
          <Slider
            max={100}
            min={0}
            percent={vm.inputPercent.toNumber()}
            step={1}
            value={vm.inputPercent.toNumber()}
            onChange={(v) => handlePercentChange(v as number)}
          />
        </SliderContainer>
        {renderOrderDetails()}
      </ParamsContainer>
      {renderButton()}

      <OrderTypeSheet isOpen={isOrderTooltipOpen} onClose={closeOrderTooltip} />
    </Root>
  );
});

export default CreateOrder;
const Root = styled(SmartFlex)`
  padding: 12px;
  width: 100%;
  min-height: 418px;
  display: flex;
  gap: 16px;

  ${media.mobile} {
    min-height: fit-content;
  }
`;

const CreateOrderButton = styled(Button)`
  margin: auto 0 0;

  ${media.mobile} {
    margin: 0;
  }
`;

const ParamsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledRow = styled(SmartFlex)`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const SelectOrderTypeContainer = styled(SmartFlex)`
  display: flex;
  flex-direction: column;
  gap: 2px;

  width: 100%;
`;

const InputContainerWithMaxButton = styled(SelectOrderTypeContainer)`
  align-items: flex-end;
`;

const InputContainerWithError = styled(SmartFlex)`
  display: flex;
  gap: 8px;
  align-items: flex-start;

  padding-bottom: 12px;
`;

const StyledMaxButton = styled(MaxButton)`
  position: absolute;
  transform: translateY(-4px);
`;

const SliderContainer = styled.div`
  padding: 15px 0;

  ${media.mobile} {
    padding: 8px 0;
  }
`;
