import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import { useState } from "react";
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { governanceABI } from "~/artifacts/governance";
import { AppContract } from "~/const";
import { useContractAddresses } from "~/hooks/useContractAddress";
import { useDeposits } from "~/hooks/useDeposits";
import { useIsMagicApproved } from "~/hooks/useIsMagicApproved";
import { useMagicBalance } from "~/hooks/useMagicBalance";

export default function Index() {
  const { isConnected } = useAccount();
  const contractAddresses = useContractAddresses();
  const [amount, setAmount] = useState("");
  const { balance } = useMagicBalance();
  const { isApproved, refetch: refetchIsApproved } = useIsMagicApproved();
  const { deposits, refetch: refetchDeposits } = useDeposits();

  const { config: approveConfig } = usePrepareContractWrite({
    address: contractAddresses[AppContract.MAGIC],
    abi: erc20ABI,
    functionName: "approve",
    args: [
      contractAddresses[AppContract.Governance],
      BigNumber.from("123456789012345678901234567890"),
    ],
    enabled: !isApproved,
    onSuccess: async () => {
      await refetchIsApproved();
      deposit?.();
    },
  });
  const { write: approve } = useContractWrite(approveConfig);

  const governanceContract = {
    address: contractAddresses[AppContract.Governance],
    abi: governanceABI,
  };

  const { config: depositConfig } = usePrepareContractWrite({
    ...governanceContract,
    functionName: "deposit",
    args: [parseEther(amount || "0")],
    enabled: isApproved,
    onSuccess: () => {
      refetchDeposits();
    },
  });
  const { write: deposit } = useContractWrite(depositConfig);

  const { write: withdraw } = useContractWrite({
    ...governanceContract,
    functionName: "withdraw",
    mode: "recklesslyUnprepared",
  });

  // const { config: withdrawAllConfig } = usePrepareContractWrite({
  //   ...governanceContract,
  //   functionName: "withdrawAll",
  //   enabled: deposits.length > 0,
  // });
  // const { write: withdrawAll } = useContractWrite(withdrawAllConfig);

  return (
    <div className="max-w-6xl px-6 py-4">
      <header className="flex items-center justify-between">
        TreasureDAO
        {isConnected ? <div>{balance} MAGIC</div> : <ConnectButton />}
      </header>
      <div>
        <div>
          <input
            className="rounded border border-ruby-500"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={() => (isApproved ? deposit?.() : approve?.())}>
            Stake
          </button>
        </div>
        {deposits.length > 0 && (
          <ol>
            {deposits.map(({ depositId, amount, unlockTimestamp }, i) => (
              <li key={depositId.toNumber()}>
                {parseFloat(formatEther(amount))} MAGIC locked until{" "}
                {unlockTimestamp} &bull;{" "}
                <button
                  onClick={() =>
                    withdraw?.({
                      recklesslySetUnpreparedArgs: [depositId, amount],
                    })
                  }
                >
                  Withdraw
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
