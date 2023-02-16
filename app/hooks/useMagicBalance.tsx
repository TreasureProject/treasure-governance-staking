import { useAccount, useBalance } from "wagmi";
import { AppContract } from "~/const";
import { useContractAddress } from "./useContractAddress";

export const useMagicBalance = () => {
  const { address } = useAccount();
  const token = useContractAddress(AppContract.MAGIC);
  const { data, isLoading, refetch } = useBalance({
    address,
    token,
    enabled: !!address,
  });
  return {
    balance: parseFloat(data?.formatted ?? "0"),
    isLoading,
    refetch,
  };
};
