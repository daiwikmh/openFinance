"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowDown, ArrowUp, DollarSign, Percent, TrendingUp } from "lucide-react"

export function PortfolioOverview() {
  const portfolioData = [
    { name: "ETH", amount: "45.2", value: "$89,234", change: "+5.2%", positive: true },
    { name: "USDC", amount: "25,000", value: "$25,000", change: "0%", positive: true },
    { name: "AAVE", amount: "150", value: "$8,543", change: "-2.1%", positive: false },
    { name: "UNI", amount: "500", value: "$4,766", change: "+8.7%", positive: true },
  ]

  const leveragePositions = [
    { protocol: "Aave", asset: "ETH", leverage: "2.5x", pnl: "+$2,543", health: 85 },
    { protocol: "Compound", asset: "USDC", leverage: "1.8x", pnl: "+$876", health: 92 },
    { protocol: "MakerDAO", asset: "ETH", leverage: "3.2x", pnl: "-$234", health: 78 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127,543.21</div>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              +12.4% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$3,247</div>
            <p className="text-xs text-muted-foreground">+2.6% today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 leveraged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Medium</div>
            <p className="text-xs text-muted-foreground">Score: 6.2/10</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.map((asset) => (
                <div key={asset.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium">{asset.name}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {asset.amount} {asset.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{asset.value}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${asset.positive ? "text-green-500" : "text-red-500"}`}>
                    {asset.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    <span className="text-sm font-medium">{asset.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leverage Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leveragePositions.map((position, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {position.protocol} - {position.asset}
                      </p>
                      <p className="text-sm text-muted-foreground">{position.leverage} leverage</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${position.pnl.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                        {position.pnl}
                      </p>
                      <p className="text-sm text-muted-foreground">Health: {position.health}%</p>
                    </div>
                  </div>
                  <Progress value={position.health} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
