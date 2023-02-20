import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils.js";
import { useContractRead } from "wagmi";
import { governanceABI } from "~/artifacts/governance";
import LogoImg from "~/assets/logo.webp";
import { AppContract } from "~/const";
import { useContractAddress } from "~/hooks/useContractAddress";
import { useIsConnected } from "~/hooks/useIsConnected";
import { formatNumber } from "~/hooks/useNumberInput";
export const Header = () => {
  const { isConnected, address } = useIsConnected();
  const contractAddress = useContractAddress(AppContract.Governance);
  const { data: balance = BigNumber.from(0) } = useContractRead({
    address: contractAddress,
    abi: governanceABI,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
    enabled: !!address,
    keepPreviousData: true,
  });

  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-2 lg:px-8">
      <img src={LogoImg} className="h-12 w-auto" alt="TreasureDAO Logo" />
      <div className="flex flex-col-reverse items-end gap-1 sm:flex-row sm:items-center">
        {isConnected && (
          <div className="rounded-lg bg-[#1A1B1F] p-2.5 text-sm font-semibold text-white sm:text-base">
            gMAGIC Voting Power:{" "}
            {formatNumber(parseFloat(formatEther(balance)))}
          </div>
        )}
        <ConnectButton
          showBalance={false}
          chainStatus={{
            largeScreen: "none",
            smallScreen: "none",
          }}
        />
      </div>
    </div>
  );
};
