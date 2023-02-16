import { arbitrum, arbitrumGoerli } from "wagmi/chains";

export enum AppContract {
  MAGIC,
  Governance,
}

export const CONTRACT_ADDRESSES: Record<
  number,
  Record<AppContract, `0x${string}`>
> = {
  [arbitrum.id]: {
    [AppContract.MAGIC]: "0x539bde0d7dbd336b79148aa742883198bbf60342",
    [AppContract.Governance]: "0xc0e641c7ea263166a238285556ff61fdf37a4c79",
  },
  [arbitrumGoerli.id]: {
    [AppContract.MAGIC]: "0x88f9efb3a7f728fdb2b8872fe994c84b1d148f65",
    [AppContract.Governance]: "0xab7c19bcaf8eed1229777759d85d71b79f9429c7",
  },
};
