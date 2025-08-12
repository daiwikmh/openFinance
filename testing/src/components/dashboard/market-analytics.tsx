import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MarketAnalytics() {
  const topGainers = [
    { name: "SOL", price: "$98.45", change: "+15.2%" },
    { name: "AVAX", price: "$34.21", change: "+12.8%" },
    { name: "MATIC", price: "$0.87", change: "+9.4%" },
  ]

  const topLosers = [
    { name: "LUNA", price: "$0.0001", change: "-23.4%" },
    { name: "FTT", price: "$1.23", change: "-18.7%" },
    { name: "SRM", price: "$0.45", change: "-15.2%" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.2T</div>
            <p className="text-xs text-green-500">+2.4% (24h)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DeFi TVL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45.6B</div>
            <p className="text-xs text-red-500">-1.2% (24h)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fear & Greed Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72</div>
            <p className="text-xs text-muted-foreground">Greed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gainers" className="w-full">
            <TabsList>
              <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
              <TabsTrigger value="losers">Top Losers</TabsTrigger>
              <TabsTrigger value="volume">High Volume</TabsTrigger>
            </TabsList>

            <TabsContent value="gainers">
              <div className="space-y-4">
                {topGainers.map((token) => (
                  <div key={token.name} className="flex items-center justify-between p-3 rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium">{token.name}</span>
                      </div>
                      <span className="font-medium">{token.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.price}</p>
                      <p className="text-sm text-green-500">{token.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="losers">
              <div className="space-y-4">
                {topLosers.map((token) => (
                  <div key={token.name} className="flex items-center justify-between p-3 rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium">{token.name}</span>
                      </div>
                      <span className="font-medium">{token.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{token.price}</p>
                      <p className="text-sm text-red-500">{token.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
