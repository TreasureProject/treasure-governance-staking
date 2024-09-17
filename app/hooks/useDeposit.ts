import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { useWriteGovernanceDeposit } from "~/generated";
import { useContractAddresses } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  amount: bigint;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useDeposit = ({ amount, enabled = true, onSuccess }: Props) => {
  const contractAddresses = useContractAddresses();
  const deposit = useWriteGovernanceDeposit();
  const depositReceipt = useWaitForTransactionReceipt({
    hash: deposit.data,
  });

  const { isSuccess } = deposit;

  useToast({
    title: "Deposit MAGIC",
    isLoading: deposit.isPending || depositReceipt.isLoading,
    isSuccess,
    isError: depositReceipt.isError,
    errorDescription: deposit.error?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    deposit: () => {
      if (!enabled) {
        return;
      }

      return deposit.writeContractAsync({
        address: contractAddresses.Governance,
        args: [amount],
      });
    },
  };
};
