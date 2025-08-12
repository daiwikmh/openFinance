"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function TradingInterface() {
  const [leverage, setLeverage] = useState([2])
  const [amount, setAmount] = useState("")
  const [orderType, setOrderType] = useState("market")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Trading Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="spot" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="spot">Spot</TabsTrigger>
                <TabsTrigger value="margin">Margin</TabsTrigger>
                <TabsTrigger value="leverage">Leverage</TabsTrigger>
              </TabsList>

              <TabsContent value="spot" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eth">ETH</SelectItem>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="dai">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eth">ETH</SelectItem>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="dai">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>

                <Button className="w-full">Swap</Button>
              </TabsContent>

              <TabsContent value="leverage" className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eth">ETH</SelectItem>
                      <SelectItem value="btc">BTC</SelectItem>
                      <SelectItem value="sol">SOL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Leverage: {leverage[0]}x</Label>
                  <Slider value={leverage} onValueChange={setLeverage} max={10} min={1} step={0.1} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label>Position Size</Label>
                  <Input placeholder="0.0" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="text-green-500 border-green-500 bg-transparent">
                    Long
                  </Button>
                  <Button variant="outline" className="text-red-500 border-red-500 bg-transparent">
                    Short
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ETH/USD</span>
                <span className="font-medium">$2,847.32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">24h Change</span>
                <span className="text-green-500">+3.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volume</span>
                <span className="font-medium">$1.2B</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium text-green-500">BUY Signal</p>
                <p className="text-xs text-muted-foreground">ETH showing strong momentum</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm font-medium text-yellow-500">HOLD Signal</p>
                <p className="text-xs text-muted-foreground">AAVE consolidating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
