import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { useWriteMagicApprove } from "~/generated";
import { useToast } from "./useToast";

type Props = {
  operator: `0x${string}`;
  token: `0x${string}`;
  tokenSymbol: string;
  amount: bigint;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useApproveToken = ({
  operator,
  token,
  tokenSymbol,
  amount,
  enabled = true,
  onSuccess,
}: Props) => {
  const approve = useWriteMagicApprove();
  const approveReceipt = useWaitForTransactionReceipt({
    hash: approve.data,
  });

  const { isSuccess } = approve;

  useToast({
    title: `Approve ${tokenSymbol}`,
    isLoading: approve.isPending || approveReceipt.isLoading,
    isSuccess,
    isError: approveReceipt.isError,
    errorDescription: approve.error?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    approve: () => {
      if (!enabled) {
        return;
      }

      return approve.writeContractAsync({
        address: token,
        args: [operator, amount],
      });
    },
  };
};
