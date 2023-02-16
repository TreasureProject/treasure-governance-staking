import type { BigNumber } from "ethers";
import { useAccount, useContractRead, useContractReads } from "wagmi";
import { governanceABI } from "~/artifacts/governance";
import { AppContract } from "~/const";
import { useContractAddress } from "./useContractAddress";

export const useDeposits = () => {
  const { address } = useAccount();
  const contractAddress = useContractAddress(AppContract.Governance);
  const governanceContract = {
    address: contractAddress,
    abi: governanceABI,
  };

  const {
    data: depositIds = [],
    isLoading: isDepositIdsLoading,
    refetch: refetchDepositIds,
  } = useContractRead({
    ...governanceContract,
    functionName: "getAllUserDepositIds",
    args: [address ?? "0x0"],
    enabled: !!address,
  });

  const {
    data: rawDeposits = [],
    isLoading: isDepositInfoLoading,
    refetch: refetchDepositInfo,
  } = useContractReads({
    contracts: depositIds.map((depositId) => ({
      ...governanceContract,
      functionName: "depositInfo",
      args: [address ?? "0x0", depositId],
    })),
    enabled: depositIds.length > 0,
  });

  const deposits = (
    rawDeposits as {
      depositAmount: BigNumber;
      lockedUntil: BigNumber;
    }[]
  ).map(({ depositAmount, lockedUntil }, i) => ({
    depositId: depositIds[i],
    amount: depositAmount,
    unlockTimestamp: lockedUntil.toNumber(),
  }));

  return {
    deposits,
    isLoading: isDepositIdsLoading || isDepositInfoLoading,
    refetch: async () => {
      await refetchDepositIds();
      await refetchDepositInfo();
    },
  };
};
