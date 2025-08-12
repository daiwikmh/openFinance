"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownLeft, Search } from "lucide-react"

export function TransactionHistory() {
  const transactions = [
    {
      id: "0x1234...5678",
      type: "swap",
      from: "ETH",
      to: "USDC",
      amount: "2.5 ETH",
      value: "$7,118.30",
      status: "completed",
      timestamp: "2 hours ago",
      gas: "$12.45",
    },
    {
      id: "0x2345...6789",
      type: "leverage",
      from: "USDC",
      to: "ETH",
      amount: "10,000 USDC",
      value: "$10,000.00",
      status: "completed",
      timestamp: "5 hours ago",
      gas: "$18.32",
    },
    {
      id: "0x3456...7890",
      type: "deposit",
      from: "Wallet",
      to: "Aave",
      amount: "5,000 USDC",
      value: "$5,000.00",
      status: "completed",
      timestamp: "1 day ago",
      gas: "$8.76",
    },
    {
      id: "0x4567...8901",
      type: "withdraw",
      from: "Compound",
      to: "Wallet",
      amount: "1.2 ETH",
      value: "$3,416.78",
      status: "pending",
      timestamp: "2 days ago",
      gas: "$15.23",
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "leverage":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "withdraw":
      case "swap":
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />
      default:
        return <ArrowUpRight className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-500">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500/20 text-red-500">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transactions..." className="pl-10 w-64" />
          </div>
          <Select>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="swap">Swaps</SelectItem>
              <SelectItem value="leverage">Leverage</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdraw">Withdrawals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                    {getTypeIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize">{tx.type}</p>
                      {getStatusBadge(tx.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tx.from} → {tx.to}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium">{tx.amount}</p>
                  <p className="text-sm text-muted-foreground">{tx.value}</p>
                  <p className="text-xs text-muted-foreground">Gas: {tx.gas}</p>
                </div>

                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
