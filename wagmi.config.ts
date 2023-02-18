import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";
import { arbitrum, arbitrumGoerli } from "wagmi/chains";

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "magic",
      abi: erc20ABI,
    },
  ],
  plugins: [
    etherscan({
      apiKey: process.env.PUBLIC_ALCHEMY_KEY!,
      chainId: arbitrumGoerli.id,
      contracts: [
        {
          name: "MagicGov",
          address: {
            [arbitrum.id]: "0x314159265dd8dbb310642f98f50c066173c1259b",
            [arbitrumGoerli.id]: "0xd77b9c429b9fdc9511088e6db584aa37352fa1f7",
          },
        },
      ],
    }),
    react(),
  ],
});
