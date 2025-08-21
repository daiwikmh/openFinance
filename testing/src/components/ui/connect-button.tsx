import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Copy, LogOut } from "lucide-react"

export const ConnectButton = () => {
  const { address } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const metamaskConnector = connectors.find(
    (c) => c.name.toLowerCase().includes("metamask")
  )

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  return (
    <div>
      {address ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="flex items-center gap-2">
              <span className="text-green-500">Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyAddress}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Address
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => disconnect()}>
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="space-y-2">
          {metamaskConnector && (
            <Button
              onClick={() => connect({ connector: metamaskConnector })}
              disabled={isPending}
              className="relative z-10 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 rounded-full font-medium text-base shadow-lg ring-1 ring-white/10"
            >
              {isPending ? "Connecting..." : "Connect MetaMask"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}