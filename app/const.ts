import { arbitrum, arbitrumSepolia } from "wagmi/chains";

export const APP_TITLE = "TreasureDAO Governance Staking";
export const APP_DESCRIPTION =
  "Stake your MAGIC with a 7-day lockup period to earn gMAGIC voting power.";

export const CONTRACT_ADDRESSES = {
  [arbitrum.id]: {
    MAGIC: "0x539bde0d7dbd336b79148aa742883198bbf60342",
    Governance: "0xc0e641c7ea263166a238285556ff61fdf37a4c79",
  },
  [arbitrumSepolia.id]: {
    MAGIC: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
    Governance: "0x85c0038d11cdfb3d61a30b332de4ee913bcb2d29",
  },
} as const;
