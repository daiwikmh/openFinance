import { http, createConfig } from 'wagmi'
import { zeroG } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [zeroG],
  connectors: [metaMask()],
  transports: {
    [zeroG.id]: http(),
  },
})