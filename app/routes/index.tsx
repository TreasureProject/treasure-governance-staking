import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import { useState } from "react";
import { erc20ABI, useAccount, usePrepareContractWrite } from "wagmi";
import { governanceABI } from "~/artifacts/governance";
import { AppContract } from "~/const";
import { useContractAddresses } from "~/hooks/useContractAddress";
import { useDeposits } from "~/hooks/useDeposits";
import { useIsMagicApproved } from "~/hooks/useIsMagicApproved";
import { useMagicBalance } from "~/hooks/useMagicBalance";
import { useNumberInput } from "~/hooks/useNumberInput";
import MagicTokenImg from "~/assets/magic.webp";
import { Button } from "~/components/Button";
import { useContractWrite } from "~/hooks/useContractWrite";
import { AnimatePresence, motion } from "framer-motion";
import { format, isAfter } from "date-fns";
import Balancer from "react-wrap-balancer";

export default function Index() {
  const contractAddresses = useContractAddresses();
  const [amount, setAmount] = useState(0);
  const { balance, refetch: refetchMagicBalance } = useMagicBalance();
  const { isApproved, refetch: refetchIsApproved } = useIsMagicApproved();
  const { deposits, refetch: refetchDeposits } = useDeposits();

  const { write: approve, isLoading: isApproveLoading } = useContractWrite(
    {
      statusHeader: "Approving...",
      onChange: async () => {
        await refetchIsApproved();
      },
    },
    {
      mode: "recklesslyUnprepared",
      address: contractAddresses[AppContract.MAGIC],
      abi: erc20ABI,
      functionName: "approve",
      args: [
        contractAddresses[AppContract.Governance],
        BigNumber.from("123456789012345678901234567890"),
      ],
    }
  );

  const { inputValue, parsedValue, handleChange } = useNumberInput({
    value: amount,
    onChange: setAmount,
  });

  const governanceContract = {
    address: contractAddresses[AppContract.Governance],
    abi: governanceABI,
  };

  const { write: deposit } = useContractWrite(
    {
      statusHeader: "Depositing...",
      onChange: async () => {
        await refetchDeposits();
        await refetchMagicBalance();
        setAmount(0);
      },
    },
    {
      ...governanceContract,
      functionName: "deposit",
      args: [parseEther(inputValue || "0")],
      mode: "recklesslyUnprepared",
    }
  );

  const { write: withdraw } = useContractWrite(
    {
      statusHeader: "Withdrawing...",
      onChange: async () => {
        await refetchDeposits();
        await refetchMagicBalance();
      },
    },
    {
      ...governanceContract,
      functionName: "withdraw",
      mode: "recklesslyUnprepared",
    }
  );

  const insufficientBalance = balance < parsedValue;

  const empty = parsedValue === 0;

  console.log(deposits);
  // const { config: withdrawAllConfig } = usePrepareContractWrite({
  //   ...governanceContract,
  //   functionName: "withdrawAll",
  //   enabled: deposits.length > 0,
  // });
  // const { write: withdrawAll } = useContractWrite(withdrawAllConfig);

  return (
    // <div className="max-w-6xl px-6 py-4">
    //   <header className="flex items-center justify-between">
    //     TreasureDAO
    //     {isConnected ? <div>{balance} MAGIC</div> : <ConnectButton />}
    //   </header>
    //   <div>
    //     <div>
    //       <inpu/t
    //         className="rounded border border-ruby-500"
    //         type="text"
    //         value={amount}
    //         onChange={(e) => setAmount(e.target.value)}
    //       />
    //       <button onClick={() => (isApproved ? deposit?.() : approve?.())}>
    //         Stake
    //       </button>
    //     </div>
    //     {deposits.length > 0 && (
    //       <ol>
    //         {deposits.map(({ depositId, amount, unlockTimestamp }, i) => (
    //           <li key={depositId.toNumber()}>
    //             {parseFloat(formatEther(amount))} MAGIC locked until{" "}
    //             {unlockTimestamp} &bull;{" "}
    //             <button
    //               onClick={() =>
    //                 withdraw?.({
    //                   recklesslySetUnpreparedArgs: [depositId, amount],
    //                 })
    //               }
    //             >
    //               Withdraw
    //             </button>
    //           </li>
    //         ))}
    //       </ol>
    //     )}
    //   </div>
    // </div>
    <div className="relative flex min-h-full flex-col justify-center py-48 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-honey-200">
          Governance Staking
        </h2>
        <p className="mt-1.5 text-center text-sm font-semibold text-night-500">
          <Balancer>
            Stake your MAGIC here for gMagic. Your MAGIC will be locked for 2
            weeks.
          </Balancer>
        </p>
      </div>
      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative p-3">
          <label htmlFor="magicAmount" className="sr-only">
            MAGIC Amount
          </label>
          <div className="flex items-center gap-1">
            <input
              id="magicAmount"
              type="text"
              placeholder="0.00"
              className="w-full truncate border-none bg-transparent pr-10 text-left text-3xl font-medium text-night-100 focus:outline-none focus:ring-0"
              value={inputValue}
              onChange={handleChange}
            />
          </div>
          <div className="absolute top-5 right-0 pr-3">
            <img
              src={MagicTokenImg}
              alt="MAGIC"
              className="h-6 w-6 rounded-lg"
            />
          </div>
          <button
            onClick={() => setAmount(balance)}
            className="text-xs text-night-400 hover:text-night-300"
          >
            Balance: {balance}
          </button>
        </div>
        <div className="mt-4">
          <Button
            disabled={insufficientBalance || isApproveLoading || empty}
            onClick={() => {
              isApproved ? deposit?.() : approve?.();
            }}
          >
            {!isApproved
              ? isApproveLoading
                ? "Approving..."
                : "Approve"
              : empty
              ? "Enter Amount"
              : insufficientBalance
              ? "Insufficient Balance"
              : "Stake"}
          </Button>
        </div>
      </div>
      {deposits.length > 0 && (
        <div className="mt-6 rounded-lg border-2 border-night-800 bg-night-100 p-2.5 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="border-b-2 border-night-200 py-6 text-center">
            1.1M gMAGIC
          </div>
          <motion.ol initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnimatePresence initial={false}>
              {deposits.map(({ depositId, amount, unlockTimestamp }, i) => (
                <Deposit
                  key={unlockTimestamp}
                  amount={amount}
                  unlockTimestamp={unlockTimestamp}
                  withdraw={() =>
                    withdraw?.({
                      recklesslySetUnpreparedArgs: [depositId, amount],
                    })
                  }
                />
              ))}
            </AnimatePresence>
          </motion.ol>
        </div>
      )}
    </div>
  );
}

const Deposit = ({
  amount,
  unlockTimestamp,
  withdraw,
}: {
  amount: BigNumber;
  unlockTimestamp: number;
  withdraw: () => void;
}) => {
  const timestamp = Number(unlockTimestamp * 1000);

  const isWithdrawable = () => {
    const today = new Date();
    const lockedUntilDate = new Date(timestamp);

    return isAfter(today, lockedUntilDate);
  };

  return (
    <motion.li
      key={unlockTimestamp}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{
        opacity: { duration: 0.2 },
      }}
    >
      <div className="flex items-baseline justify-between p-1.5">
        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1 font-bold text-night-900">
            <span className="block max-w-[8rem] truncate">
              {parseFloat(formatEther(amount))}
            </span>
            <span className="text-xs font-medium">MAGIC</span>
          </div>
          <div className="text-sm">
            locked until {format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss")}{" "}
          </div>
        </div>
        <button
          className="disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => withdraw()}
          disabled={!isWithdrawable()}
        >
          Withdraw
        </button>
      </div>
    </motion.li>
  );
};
