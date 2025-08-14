# Dashboard Components

This directory contains dashboard components with a consistent layout system.

## Layout Components

### DashboardLayout
Main layout wrapper that includes header and sidebar.

```tsx
import { DashboardLayout } from './dashboard-layout';

<DashboardLayout currentTab="overview" onTabChange={setTab}>
  <YourContent />
</DashboardLayout>
```

### DashboardPage
Page wrapper with consistent spacing and optional title/description.

```tsx
import { DashboardPage } from './dashboard-layout';

<DashboardPage 
  title="Page Title"
  description="Page description"
>
  <YourPageContent />
</DashboardPage>
```

### Sidebar
Collapsible navigation sidebar with consistent styling.

- Fixed width: 64px (collapsed) / 256px (expanded)
- Smooth animations
- Tooltips when collapsed
- Active state highlighting

## Usage Patterns

### 1. Complete Dashboard with Navigation
```tsx
// pages/dashboard.tsx
import { DashboardLayout, DashboardPage } from '../components/dashboard';

const [activeTab, setActiveTab] = useState("overview");

return (
  <DashboardLayout currentTab={activeTab} onTabChange={setActiveTab}>
    <DashboardPage title="Portfolio Overview">
      <PortfolioOverview />
    </DashboardPage>
  </DashboardLayout>
);
```

### 2. Individual Pages with Fixed Sidebar
```tsx
// pages/trading-page.tsx
import { DashboardLayout, DashboardPage } from '../components/dashboard';

return (
  <DashboardLayout defaultTab="trading">
    <DashboardPage title="Trading Interface">
      <TradingInterface />
    </DashboardPage>
  </DashboardLayout>
);
```

## Benefits

- **Consistent UI**: Same sidebar, spacing, and layout across all pages
- **Responsive**: Collapsible sidebar for smaller screens
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Performant**: Efficient re-renders and smooth animations
- **Maintainable**: Single source of truth for layout logic

## File Structure

```
dashboard/
├── dashboard-layout.tsx    # Main layout components
├── sidebar.tsx            # Navigation sidebar
├── dashboard-header.tsx   # Top header
├── portfolio-overview.tsx # Individual page components
├── trading-interface.tsx
├── market-analytics.tsx
├── risk-management.tsx
├── trading-bots.tsx
├── transaction-history.tsx
└── index.ts              # Exports
```