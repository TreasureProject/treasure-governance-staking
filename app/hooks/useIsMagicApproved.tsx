import { BigNumber } from "ethers";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { AppContract } from "~/const";
import { useContractAddresses } from "./useContractAddress";

export const useIsMagicApproved = (amount = BigNumber.from(0)) => {
  const { address: userAddress } = useAccount();
  const contractAddresses = useContractAddresses();
  const {
    data = BigNumber.from(0),
    isLoading,
    refetch,
  } = useContractRead({
    address: contractAddresses[AppContract.MAGIC],
    abi: erc20ABI,
    functionName: "allowance",
    args: [userAddress ?? "0x0", contractAddresses[AppContract.Governance]],
    enabled: !!userAddress,
  });
  return { isApproved: data.gt(amount), isLoading, refetch };
};
