import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { erc20Abi } from "viem";

import { governanceAbi } from "./artifacts/governance";

export default defineConfig({
  out: "app/generated.ts",
  contracts: [
    {
      name: "Magic",
      abi: erc20Abi,
    },
    {
      name: "Governance",
      abi: governanceAbi,
    },
  ],
  plugins: [react()],
});
