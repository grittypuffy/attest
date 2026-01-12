import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { foundry } from "wagmi/chains";

export const config = createConfig({
  chains: [foundry],
  connectors: [injected()],
  transports: {
    [foundry.id]: http(
      typeof window !== "undefined" ? "/rpc" : "http://127.0.0.1:8545",
    ),
  },
});
