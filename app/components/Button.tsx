import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import type { ButtonHTMLAttributes, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";
import { useNetwork } from "wagmi";
import { useIsConnected } from "~/hooks/useIsConnected";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  requiresConnect?: boolean;
};

export const Button = ({
  className,
  onClick,
  children,
  disabled,
  ...buttonProps
}: Props) => {
  const { chain } = useNetwork();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();

  const { isConnected } = useIsConnected();
  const unsupported = chain?.unsupported ?? false;
  const isConnectButton = !isConnected || unsupported;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (isConnectButton) {
      if (unsupported) {
        openChainModal?.();
      } else {
        openConnectModal?.();
      }
    } else {
      onClick?.(e);
    }
  };

  return (
    <button
      className={twMerge(
        "inline-flex w-full items-center justify-center rounded-button border border-transparent bg-ruby-900 px-6.5 py-3 text-sm font-semibold text-white shadow-sm ring-offset-ruby-800 hover:bg-ruby-1000 focus:outline-none focus:ring-2 focus:ring-ruby-500 focus:ring-offset-2 disabled:opacity-50 sm:text-lg",
        className
      )}
      disabled={disabled && !isConnectButton}
      onClick={handleClick}
      {...buttonProps}
    >
      {isConnectButton
        ? unsupported
          ? "Wrong Network"
          : "Connect Wallet"
        : children}
    </button>
  );
};
