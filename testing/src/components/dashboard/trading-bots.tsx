"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bot, Settings, TrendingUp } from "lucide-react"

export function TradingBots() {
  const [bots, setBots] = useState([
    {
      id: 1,
      name: "DCA ETH Bot",
      strategy: "Dollar Cost Average",
      status: "active",
      pnl: "+$2,543",
      trades: 47,
      winRate: "68%",
    },
    {
      id: 2,
      name: "Arbitrage Scanner",
      strategy: "Cross-DEX Arbitrage",
      status: "active",
      pnl: "+$876",
      trades: 23,
      winRate: "87%",
    },
    {
      id: 3,
      name: "Momentum Trader",
      strategy: "Trend Following",
      status: "paused",
      pnl: "-$234",
      trades: 15,
      winRate: "53%",
    },
  ])

  const toggleBot = (id: number) => {
    setBots(
      bots.map((bot) => (bot.id === id ? { ...bot, status: bot.status === "active" ? "paused" : "active" } : bot)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trading Bots</h2>
        <Button>
          <Bot className="h-4 w-4 mr-2" />
          Create New Bot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{bot.name}</CardTitle>
                <Badge variant={bot.status === "active" ? "default" : "secondary"}>{bot.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{bot.strategy}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">P&L</p>
                    <p className={`font-medium ${bot.pnl.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                      {bot.pnl}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trades</p>
                    <p className="font-medium">{bot.trades}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-medium">{bot.winRate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Switch checked={bot.status === "active"} onCheckedChange={() => toggleBot(bot.id)} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bot Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">+$3,185</div>
              <p className="text-sm text-muted-foreground">Total P&L</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">85</div>
              <p className="text-sm text-muted-foreground">Total Trades</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">69%</div>
              <p className="text-sm text-muted-foreground">Avg Win Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2</div>
              <p className="text-sm text-muted-foreground">Active Bots</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
