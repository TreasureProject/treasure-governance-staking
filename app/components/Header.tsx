import { ConnectKitButton } from "connectkit";
import { zeroAddress } from "viem";

import LogoImg from "~/assets/logo.webp";
import { useReadGovernanceBalanceOf } from "~/generated";
import { useContractAddresses } from "~/hooks/useContractAddress";
import { useIsConnected } from "~/hooks/useIsConnected";
import { formatAmount } from "~/lib/number";

export const Header = () => {
  const { isConnected, address } = useIsConnected();
  const contractAddresses = useContractAddresses();

  const { data: balance = 0n } = useReadGovernanceBalanceOf({
    address: contractAddresses.Governance,
    args: [address ?? zeroAddress],
    query: {
      enabled: !!address,
    },
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
          <div className="rounded-lg bg-[#1A1B1F] p-3 font-semibold text-white text-xs sm:p-2 sm:text-base">
            gMAGIC Voting Power: {formatAmount(balance, { type: "compact" })}
          </div>
        )}
        <ConnectKitButton />
      </div>
    </div>
  );
};
