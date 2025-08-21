"use client"

import { Button } from "@/components/ui/button"
import { Bell, Settings, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAccount, useDisconnect } from "wagmi"
import { useNavigate } from "react-router"
import { ConnectButton } from "@/components/ui/connect-button"

export function DashboardHeader() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()

  const handleDisconnect = () => {
    disconnect()
    navigate("/")
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-foreground">OG-Finance</h1>
          <ConnectButton />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Portfolio Value:</span>
            <span className="font-semibold text-primary">$127,543.21</span>
            <span className="text-green-500 text-xs">+12.4%</span>
          </div>

          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              {isConnected && (
                <DropdownMenuItem onClick={handleDisconnect}>
                  Disconnect Wallet
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
