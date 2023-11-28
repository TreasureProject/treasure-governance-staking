import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import { useEffect, useRef, useState } from "react";
import { json } from "@remix-run/node";
import { erc20ABI, useNetwork } from "wagmi";
import { governanceABI } from "~/artifacts/governance";
import { AppContract } from "~/const";
import { useContractAddresses } from "~/hooks/useContractAddress";
import { useDeposits } from "~/hooks/useDeposits";
import { useIsMagicApproved } from "~/hooks/useIsMagicApproved";
import { useMagicBalance } from "~/hooks/useMagicBalance";
import { formatNumber, useNumberInput } from "~/hooks/useNumberInput";
import MagicTokenImg from "~/assets/magic.webp";
import { Button } from "~/components/Button";
import { useContractWrite } from "~/hooks/useContractWrite";
import { AnimatePresence, motion } from "framer-motion";
import Balancer from "react-wrap-balancer";
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from "@heroicons/react/24/outline";
import client from "~/lib/client";
import { useLoaderData } from "@remix-run/react";
import { ClientOnly } from "remix-utils";
import { twMerge } from "tailwind-merge";

export const loader = async () => {
  try {
    const data = await client.getProposals();
    const latestProposal = data.proposals?.filter(
      (proposal) => (proposal?.choices || []).length > 1
    );
    return json(latestProposal?.[0]);
  } catch (e) {
    return json(null);
  }
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const contractAddresses = useContractAddresses();
  const [amount, setAmount] = useState(0);
  const { chain } = useNetwork();
  const { balance, refetch: refetchMagicBalance } = useMagicBalance();
  const { isApproved, refetch: refetchIsApproved } = useIsMagicApproved();
  const { deposits, refetch: refetchDeposits } = useDeposits();
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

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

  // const { config: withdrawAllConfig } = usePrepareContractWrite({
  //   ...governanceContract,
  //   functionName: "withdrawAll",
  //   enabled: deposits.length > 0,
  // });
  // const { write: withdrawAll } = useContractWrite(withdrawAllConfig);

  return (
    <div className="relative flex grow flex-col justify-center px-6 py-4 sm:py-0 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="mt-8 text-center text-xl font-bold tracking-tight text-honey-200 sm:mt-0 sm:text-3xl">
          <Balancer>TreasureDAO Governance Staking</Balancer>
        </h2>
        <p className="mt-1.5 text-center text-xs font-semibold text-night-500">
          <Balancer>
            Stake your MAGIC with a 14-day lockup period to earn gMAGIC voting
            power.{" "}
          </Balancer>
        </p>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-night-400">
          <ClientOnly>
            {() => (
              <>
                <a
                  href={`${
                    chain?.blockExplorers?.default.url ?? "https://arbiscan.io"
                  }/address/${contractAddresses[AppContract.Governance]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 transition-colors hover:text-honey-200"
                >
                  Contract <ExternalLinkIcon className="h-3 w-3" />
                </a>
                &bull;
                <a
                  href="https://docs.treasure.lol/about-treasure/governance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 transition-colors hover:text-honey-200"
                >
                  Docs <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </>
            )}
          </ClientOnly>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative p-3">
          <label htmlFor="magicAmount" className="sr-only">
            MAGIC Amount
          </label>
          <div className="flex items-center gap-1">
            <input
              ref={ref}
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
          <ClientOnly>
            {() => (
              <button
                onClick={() => setAmount(balance)}
                className="text-xs text-night-400 hover:text-night-300"
              >
                Balance: {formatNumber(balance)}
              </button>
            )}
          </ClientOnly>
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
        {data ? (
          <div className="mt-4">
            <p className="text-sm font-semibold text-honey-400 sm:text-base">
              Latest Proposal
            </p>
            <a
              href={data?.link || ""}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="mt-2 flex items-center justify-between font-medium leading-6 text-night-100">
                <span className="truncate text-sm sm:text-base">
                  {data.title}
                </span>
                <span
                  className={twMerge(
                    "ml-2 inline-flex items-center rounded-full bg-red-200 px-2.5 py-0.5 text-xs font-medium uppercase text-red-900",
                    data.state === "active" && "bg-honey-100 text-amber-800"
                  )}
                >
                  {data.state === "active" ? "Active" : "Closed"}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-night-200 sm:text-xs">
                {data.body}
              </p>
            </a>
            <a
              href="https://snapshot.org/#/treasuregaming.eth"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 ml-auto block w-fit text-xs font-medium text-honey-500 underline underline-offset-2 accent-yellow-500"
            >
              View All Proposals
            </a>
          </div>
        ) : null}
      </div>
      <ClientOnly>
        {() =>
          deposits.length > 0 && (
            <div className="mt-6 rounded-lg border-2 border-night-800 bg-night-100 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="border-b-2 border-night-200 py-4 text-center font-medium">
                Your Deposits
              </div>
              <motion.ol
                className="p-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
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
          )
        }
      </ClientOnly>
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
  const isWithdrawable = timestamp < Date.now();

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
            locked until {new Date(timestamp).toLocaleString("en-US")}{" "}
          </div>
        </div>
        <button
          className="disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => withdraw()}
          disabled={!isWithdrawable}
        >
          Withdraw
        </button>
      </div>
    </motion.li>
  );
};
