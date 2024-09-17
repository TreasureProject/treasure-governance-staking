import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { useWriteGovernanceWithdraw } from "~/generated";
import { useContractAddresses } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useWithdraw = ({ enabled = true, onSuccess }: Props) => {
  const contractAddresses = useContractAddresses();
  const withdraw = useWriteGovernanceWithdraw();
  const withdrawReceipt = useWaitForTransactionReceipt({
    hash: withdraw.data,
  });

  const { isSuccess } = withdraw;

  useToast({
    title: "Withdraw MAGIC",
    isLoading: withdraw.isPending || withdrawReceipt.isLoading,
    isSuccess,
    isError: withdrawReceipt.isError,
    errorDescription: withdraw.error?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    withdraw: ({
      depositId,
      amount,
    }: { depositId: bigint; amount: bigint }) => {
      if (!enabled) {
        return;
      }

      return withdraw.writeContractAsync({
        address: contractAddresses.Governance,
        args: [depositId, amount],
      });
    },
  };
};
