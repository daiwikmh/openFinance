"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, Bot, History, Home, Shield, TrendingUp, ChevronLeft, Menu, Brain } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "risk", label: "Risk Management", icon: Shield },
    { id: "bots", label: "Trading Bots", icon: Bot },
    { id: "ai-leverage", label: "AI Leverage Monitor", icon: Brain },
    { id: "history", label: "History", icon: History },
  ]

  return (
    <aside
      className={cn(
        "border-r border-border bg-card/30 backdrop-blur-sm transition-all duration-300 ease-in-out flex flex-col",
        "min-h-full h-full sticky top-0",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && <h2 className="text-lg font-semibold text-foreground">Menu</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 hover:bg-accent"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                isCollapsed && "justify-center",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer section when expanded */}
      {!isCollapsed && (
        <div className="p-4 mt-auto">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="text-xs text-muted-foreground mb-1">Trading Platform</div>
            <div className="text-sm font-medium text-foreground">Status: Active</div>
            <div className="text-xs text-blue-500">Version: 1.0.0</div>
          </div>
        </div>
      )}
    </aside>
  )
}
