"use client"

import React, { useState, ReactNode } from 'react';
import { DashboardHeader } from './dashboard-header';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  defaultTab?: string;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export function DashboardLayout({ 
  children, 
  defaultTab = "overview",
  currentTab,
  onTabChange,
  className 
}: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const currentActiveTab = currentTab || activeTab;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex h-[calc(100vh-4rem)]"> {/* Subtract header height */}
        <Sidebar 
          activeTab={currentActiveTab} 
          setActiveTab={handleTabChange} 
        />
        <main className={cn(
          "flex-1 overflow-auto",
          "p-6 bg-background",
          className
        )}>
          <div className="w-full max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrapper component for individual dashboard pages
interface DashboardPageProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function DashboardPage({ 
  children, 
  title, 
  description, 
  className 
}: DashboardPageProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}