"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, TrendingDown } from "lucide-react"

export function RiskManagement() {
  const riskMetrics = [
    { label: "Portfolio Risk Score", value: 6.2, max: 10, status: "medium" },
    { label: "Liquidation Risk", value: 15, max: 100, status: "low" },
    { label: "Concentration Risk", value: 35, max: 100, status: "medium" },
    { label: "Volatility Exposure", value: 72, max: 100, status: "high" },
  ]

  const alerts = [
    {
      type: "warning",
      message: "ETH position approaching liquidation threshold (78% health)",
      icon: AlertTriangle,
    },
    {
      type: "info",
      message: "Consider rebalancing - 65% allocation in volatile assets",
      icon: TrendingDown,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {riskMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      metric.status === "low"
                        ? "bg-green-500/20 text-green-500"
                        : metric.status === "medium"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {metric.status}
                  </div>
                </div>
                <Progress
                  value={(metric.value / metric.max) * 100}
                  className={`h-2 ${
                    metric.status === "low"
                      ? "[&>div]:bg-green-500"
                      : metric.status === "medium"
                        ? "[&>div]:bg-yellow-500"
                        : "[&>div]:bg-red-500"
                  }`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => {
                const Icon = alert.icon
                return (
                  <Alert
                    key={index}
                    className={
                      alert.type === "warning"
                        ? "border-yellow-500/50 bg-yellow-500/10"
                        : "border-blue-500/50 bg-blue-500/10"
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Mitigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h4 className="font-medium text-green-500 mb-2">Recommended Actions</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Reduce leverage on ETH position</li>
                  <li>• Add stablecoin allocation (20-30%)</li>
                  <li>• Set stop-loss at $2,650 for ETH</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-medium text-blue-500 mb-2">Auto-Protection</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Liquidation protection: Active</li>
                  <li>• Stop-loss orders: 3 active</li>
                  <li>• Rebalancing: Weekly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
