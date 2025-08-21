import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {zeroG} from "wagmi/chains"
import { http, WagmiProvider, createConfig } from "wagmi";
import { metaMask } from "wagmi/connectors";


const queryClient = new QueryClient();

const config = createConfig({
  ssr: true, // Make sure to enable this for server-side rendering (SSR) applications.
  chains: [zeroG],
  connectors: [
    metaMask({})],
  transports: {
    [zeroG.id]: http(),
   
  },
});

// Ensure root element exists (this was our main fix!)
setTimeout(() => {
  let rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.log("Creating root element...");
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);
  }

  createRoot(rootElement).render(
    <StrictMode>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  );
  
}, 100);
