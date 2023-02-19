import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export const useIsConnected = () => {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  useEffect(() => setMounted(true), []);
  return {
    isConnected: mounted && isConnected && !!address,
    address,
  };
};
