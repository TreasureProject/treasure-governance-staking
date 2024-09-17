import { useCallback } from "react";
import { zeroAddress } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import {
  governanceAbi,
  useReadGovernanceGetAllUserDepositIds,
} from "~/generated";
import { useContractAddresses } from "./useContractAddress";

type DepositInfo = {
  depositAmount: bigint;
  lockedUntil: bigint;
};

export const useDeposits = () => {
  const { address } = useAccount();
  const contractAddresses = useContractAddresses();

  const {
    data: depositIds = [],
    isLoading: isLoadingDepositIds,
    refetch: refetchDepositIds,
  } = useReadGovernanceGetAllUserDepositIds({
    address: contractAddresses.Governance,
    args: [address ?? zeroAddress],
    query: {
      enabled: !!address,
    },
  });

  const {
    data = [],
    isLoading: isLoadingDepositInfo,
    refetch: refetchDepositInfo,
  } = useReadContracts({
    contracts: depositIds.map((depositId) => ({
      address: contractAddresses.Governance,
      abi: governanceAbi,
      functionName: "depositInfo",
      args: [address ?? zeroAddress, depositId],
    })),
    query: {
      enabled: depositIds.length > 0,
    },
  });

  const deposits = data
    .filter(({ result }) => !!result)
    .map(({ result }, i) => ({
      depositId: depositIds[i] ?? 0n,
      amount: (result as unknown as DepositInfo).depositAmount,
      unlockTimestamp: Number((result as unknown as DepositInfo).lockedUntil),
    }))
    .sort((a, b) => b.unlockTimestamp - a.unlockTimestamp);

  const refetch = useCallback(async () => {
    await refetchDepositIds();
    await refetchDepositInfo();
  }, [refetchDepositIds, refetchDepositInfo]);

  return {
    deposits,
    isLoading: isLoadingDepositIds || isLoadingDepositInfo,
    refetch,
  };
};
