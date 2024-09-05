import { useCallback, useEffect, useState } from "react";
import { useConnectUI, useFuel } from "@fuels/react";
import { Account } from "fuels";

import { useStores } from "@stores";

export const useWallet = () => {
  const { fuel } = useFuel();
  const { accountStore } = useStores();
  const { connect, isConnecting } = useConnectUI();

  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<Account | null>(null);

  const handleDisconnect = useCallback(async () => {
    await fuel.disconnect();
    await accountStore.disconnect();
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await fuel.isConnected();
      setIsConnected(connected);
      if (connected) {
        const accounts = await fuel.accounts();
        const wallet = await fuel.getWallet(accounts[0]);
        setWallet(wallet);
      }
    };

    checkConnection();
  }, [fuel, isConnecting]);

  useEffect(() => {
    if (!isConnected || !wallet) return;

    accountStore.connect(wallet);
  }, [isConnected, wallet, accountStore]);

  return {
    isConnected,
    isConnecting,
    wallet,
    connect,
    disconnect: handleDisconnect,
  };
};
