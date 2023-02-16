import { useNetwork } from "wagmi";
import { arbitrum } from "wagmi/chains";
import type { AppContract } from "~/const";
import { CONTRACT_ADDRESSES } from "~/const";

export const useContractAddresses = () => {
  const { chain } = useNetwork();
  const chainId = chain && !chain.unsupported ? chain.id : arbitrum.id;
  return CONTRACT_ADDRESSES[chainId];
};

export const useContractAddress = (contract: AppContract) =>
  useContractAddresses()[contract];
