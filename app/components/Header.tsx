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

const NUMBER_ABBREVIATION_LOOKUP = [
  { value: 1, symbol: "" },
  { value: 1e3, symbol: "K" },
  { value: 1e6, symbol: "M" },
  { value: 1e9, symbol: "G" },
  { value: 1e12, symbol: "T" },
  { value: 1e15, symbol: "P" },
  { value: 1e18, symbol: "E" },
];

const abbreviateNumber = (value: number, digits = 1): string => {
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = NUMBER_ABBREVIATION_LOOKUP.slice()
    .reverse()
    .find((item) => value >= item.value);
  return item
    ? (value / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
};

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
      <img
        src={LogoImg}
        className="h-6 w-auto sm:h-12"
        alt="TreasureDAO Logo"
      />
      <div className="flex items-center gap-1">
        {isConnected && (
          <div className="rounded-lg bg-[#1A1B1F] p-3 text-xs font-semibold text-white sm:p-2 sm:text-base">
            gMAGIC Voting Power:{" "}
            {abbreviateNumber(parseFloat(formatEther(balance)))}
          </div>
        )}
        <ConnectButton
          showBalance={false}
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
          chainStatus={{
            largeScreen: "none",
            smallScreen: "none",
          }}
        />
      </div>
    </div>
  );
};
