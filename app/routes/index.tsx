import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from "@heroicons/react/24/outline";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import type { ExecutionResult } from "graphql";
import { useCallback, useEffect, useRef, useState } from "react";
import Balancer from "react-wrap-balancer";
import { ClientOnly } from "remix-utils/client-only";
import { twMerge } from "tailwind-merge";
import { formatEther, parseEther, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import MagicTokenImg from "~/assets/magic.webp";
import { CurrencyInput } from "~/components/CurrencyInput";
import { APP_DESCRIPTION, APP_TITLE } from "~/const";
import { useReadMagicAllowance, useReadMagicBalanceOf } from "~/generated";
import { useApproveToken } from "~/hooks/useApproveToken";
import { useContractAddresses } from "~/hooks/useContractAddress";
import { useDeposit } from "~/hooks/useDeposit";
import { useDeposits } from "~/hooks/useDeposits";
import { useWithdraw } from "~/hooks/useWithdraw";
import { formatAmount } from "~/lib/number";
import {
  GetProposalsDocument,
  type GetProposalsQuery,
  execute,
} from ".graphclient";

export const loader = async () => {
  const { data } = (await execute(
    GetProposalsDocument,
    {},
  )) as ExecutionResult<GetProposalsQuery>;
  return json({
    latestProposal: data?.proposals?.[0],
  });
};

export default function Index() {
  const { latestProposal } = useLoaderData<typeof loader>();
  const contractAddresses = useContractAddresses();
  const [amount, setAmount] = useState("0");
  const { address, chain, isConnected } = useAccount();
  const { deposits, refetch: refetchDeposits } = useDeposits();
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const amountBI = parseEther(amount);

  const { data: balance = 0n, refetch: refetchBalance } = useReadMagicBalanceOf(
    {
      address: contractAddresses.MAGIC,
      args: [address ?? zeroAddress],
      query: {
        enabled: !!address,
      },
    },
  );

  const hasAmount = amountBI > 0;
  const hasBalance = balance >= amountBI;

  const { data: allowance = 0n, refetch: refetchAllowance } =
    useReadMagicAllowance({
      address: contractAddresses.MAGIC,
      args: [address ?? zeroAddress, contractAddresses.Governance],
      query: {
        enabled: !!address && hasAmount && hasBalance,
      },
    });

  const isApproved = allowance >= amountBI;

  const refetch = useCallback(async () => {
    refetchBalance();
    refetchAllowance();
    refetchDeposits();
  }, [refetchBalance, refetchAllowance, refetchDeposits]);

  const { approve } = useApproveToken({
    operator: contractAddresses.Governance,
    token: contractAddresses.MAGIC,
    tokenSymbol: "MAGIC",
    amount: 0n,
    onSuccess: refetch,
    enabled: !isApproved && hasAmount && hasBalance,
  });

  const { deposit } = useDeposit({
    amount: amountBI,
    enabled: hasAmount && isApproved,
    onSuccess: refetch,
  });

  const { withdraw } = useWithdraw({
    enabled: isConnected,
  });

  return (
    <div className="relative flex grow flex-col justify-center px-6 py-4 sm:py-0 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h2 className="mt-8 text-center font-bold text-honey-200 text-xl tracking-tight sm:mt-0 sm:text-3xl">
          <Balancer>{APP_TITLE}</Balancer>
        </h2>
        <p className="mt-1.5 text-center font-semibold text-night-500 text-xs">
          <Balancer>{APP_DESCRIPTION}</Balancer>
        </p>

        <p className="mt-4 flex items-center justify-center gap-1.5 font-semibold text-night-400 text-sm">
          <ClientOnly>
            {() => (
              <>
                <a
                  href={`${
                    chain?.blockExplorers?.default.url.replace(/\/$/, "") ??
                    "https://arbiscan.io"
                  }/address/${contractAddresses.Governance}`}
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
          <CurrencyInput value={amount} onChange={setAmount} />
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
                type="button"
                onClick={() => formatEther(balance)}
                className="text-night-400 text-xs hover:text-night-300"
              >
                Balance: {formatAmount(balance)}
              </button>
            )}
          </ClientOnly>
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-button border border-transparent bg-ruby-900 px-6.5 py-3 font-semibold text-sm text-white shadow-sm ring-offset-ruby-800 hover:bg-ruby-1000 focus:outline-none focus:ring-2 focus:ring-ruby-500 focus:ring-offset-2 disabled:opacity-50 sm:text-lg"
            disabled={!hasAmount || !hasBalance}
            onClick={() => {
              isApproved ? deposit?.() : approve?.();
            }}
          >
            {!isApproved
              ? "Approve"
              : hasAmount
                ? hasBalance
                  ? "Stake"
                  : "Insufficient Balance"
                : "Enter Amount"}
          </button>
        </div>
        {latestProposal ? (
          <div className="mt-4">
            <p className="font-semibold text-honey-400 text-sm sm:text-base">
              Latest Proposal
            </p>
            <a
              href={latestProposal.link ?? ""}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="mt-2 flex items-center justify-between font-medium text-night-100 leading-6">
                <span className="truncate text-sm sm:text-base">
                  {latestProposal.title}
                </span>
                <span
                  className={twMerge(
                    "ml-2 inline-flex items-center rounded-full bg-red-200 px-2.5 py-0.5 font-medium text-red-900 text-xs uppercase",
                    latestProposal.state === "active" &&
                      "bg-honey-100 text-amber-800",
                  )}
                >
                  {latestProposal.state === "active" ? "Active" : "Closed"}
                </span>
              </div>
              <p className="mt-1 truncate text-night-200 text-xs sm:text-xs">
                {latestProposal.body}
              </p>
            </a>
            <a
              href="https://snapshot.org/#/treasuregaming.eth"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 ml-auto block w-fit font-medium text-honey-500 text-xs underline underline-offset-2 accent-yellow-500"
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
              <div className="border-night-200 border-b-2 py-4 text-center font-medium">
                Your Deposits
              </div>
              <motion.ol
                className="p-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence initial={false}>
                  {deposits.map(
                    ({ depositId, amount, unlockTimestamp }, _i) => (
                      <Deposit
                        key={unlockTimestamp}
                        amount={amount}
                        unlockTimestamp={unlockTimestamp}
                        withdraw={() => withdraw?.({ depositId, amount })}
                      />
                    ),
                  )}
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
  amount: bigint;
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
              {Number.parseFloat(formatEther(amount))}
            </span>
            <span className="font-medium text-xs">MAGIC</span>
          </div>
          <div className="text-sm">
            locked until {new Date(timestamp).toLocaleString("en-US")}{" "}
          </div>
        </div>
        <button
          type="button"
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
