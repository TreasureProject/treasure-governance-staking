import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import NProgress from "nprogress";
import { useEffect, useMemo, useState } from "react";
import { http, WagmiProvider, createConfig, fallback } from "wagmi";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";

import { ENV } from "./lib/env.server";
import { getDomainUrl } from "./lib/seo";
import "./styles/nprogress.css";
import "./styles/tailwind.css";
import { Header } from "./components/Header";
import { Toaster } from "./components/ui/Toast";
import { APP_DESCRIPTION, APP_TITLE } from "./const";

const queryClient = new QueryClient();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({
    requestInfo: {
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
    },
    env: {
      PUBLIC_ENABLE_TESTNETS: ENV.PUBLIC_ENABLE_TESTNETS,
      PUBLIC_THIRDWEB_CLIENT_ID: ENV.PUBLIC_THIRDWEB_CLIENT_ID,
      PUBLIC_WALLET_CONNECT_PROJECT_ID: ENV.PUBLIC_WALLET_CONNECT_PROJECT_ID,
    },
  });
};

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

export type RootLoader = typeof loader;

export default function App() {
  const { env } = useLoaderData<RootLoader>();

  const [client] = useState(() =>
    createConfig(
      getDefaultConfig({
        appName: APP_TITLE,
        transports: {
          [arbitrumSepolia.id]: fallback([
            http(
              `https://${arbitrumSepolia.id}.rpc.thirdweb.com/${env.PUBLIC_THIRDWEB_CLIENT_ID}`,
            ),
            http(),
          ]),
          [arbitrum.id]: fallback([
            http(
              `https://${arbitrum.id}.rpc.thirdweb.com/${env.PUBLIC_THIRDWEB_CLIENT_ID}`,
            ),
            http(),
          ]),
        },
        walletConnectProjectId: env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
        chains: env.PUBLIC_ENABLE_TESTNETS
          ? [arbitrumSepolia, arbitrum]
          : [arbitrum],
      }),
    ),
  );

  const transition = useNavigation();

  const fetchers = useFetchers();

  const state = useMemo<"idle" | "loading">(
    function getGlobalState() {
      const states = [
        transition.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) return "idle";
      return "loading";
    },
    [transition.state, fetchers],
  );

  // slim loading bars on top of the page, for page transitions
  useEffect(() => {
    if (state === "loading") NProgress.start();
    if (state === "idle") NProgress.done();
  }, [state]);

  return (
    <html lang="en" className="h-full">
      <head>
        <title>{APP_TITLE}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          property="og:url"
          content="https://governance-staking.treasure.lol"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={APP_TITLE} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta
          property="og:image"
          content="https://governance-staking.treasure.lol/banner.jpg"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:domain"
          content="governance-staking.treasure.lol"
        />
        <meta
          property="twitter:url"
          content="https://governance-staking.treasure.lol"
        />
        <meta name="twitter:title" content={APP_TITLE} />
        <meta name="twitter:description" content={APP_DESCRIPTION} />
        <meta
          name="twitter:image"
          content="https://governance-staking.treasure.lol/banner.jpg"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#ffc40d" />
        <meta name="theme-color" content="#ffffff" />
        <Meta />
        <Links />
      </head>
      <body className="h-full antialiased">
        <WagmiProvider config={client}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider theme="midnight">
              <Header />
              <Outlet />
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
        <Scripts />
        <ScrollRestoration />
        <Toaster />
      </body>
    </html>
  );
}
