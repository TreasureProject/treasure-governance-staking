import { useChainId } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "~/const";

export const useContractAddresses = () => {
  const chainId = useChainId();
  return CONTRACT_ADDRESSES[
    chainId === arbitrumSepolia.id ? arbitrumSepolia.id : arbitrum.id
  ];
};
