# Heroicons v2 Icon Reference Guide

## Common Icon Name Changes from v1 to v2

This guide helps prevent import errors when using Heroicons v2 by documenting the correct icon names.

### Navigation & UI Icons
- ✅ `UserIcon` - Correct
- ✅ `HomeIcon` - Correct  
- ✅ `ChevronDownIcon` - Correct
- ✅ `ChevronUpIcon` - Correct
- ✅ `ChevronLeftIcon` - Correct
- ✅ `ChevronRightIcon` - Correct

### Action Icons
- ❌ `RefreshIcon` → ✅ `ArrowPathIcon`
- ❌ `ArrowRefreshIcon` → ✅ `ArrowPathIcon`
- ✅ `ArrowUpIcon` - Correct
- ✅ `ArrowDownIcon` - Correct
- ✅ `ArrowLeftIcon` - Correct
- ✅ `ArrowRightIcon` - Correct

### Trending & Analytics Icons
- ❌ `TrendingUpIcon` → ✅ `ArrowTrendingUpIcon`
- ❌ `TrendingDownIcon` → ✅ `ArrowTrendingDownIcon`
- ✅ `ChartBarIcon` - Correct
- ✅ `ChartLineIcon` - Correct

### E-commerce Icons
- ✅ `ShoppingCartIcon` - Correct
- ✅ `ShoppingBagIcon` - Correct
- ✅ `HeartIcon` - Correct
- ✅ `StarIcon` - Correct
- ✅ `TagIcon` - Correct
- ✅ `CurrencyDollarIcon` - Correct

### Search & Filter Icons
- ✅ `MagnifyingGlassIcon` - Correct (use instead of SearchIcon)
- ✅ `FunnelIcon` - Correct (use instead of FilterIcon)
- ✅ `AdjustmentsHorizontalIcon` - Correct
- ✅ `AdjustmentsVerticalIcon` - Correct

### Communication Icons
- ✅ `ChatBubbleLeftIcon` - Correct
- ✅ `ChatBubbleLeftRightIcon` - Correct
- ✅ `EnvelopeIcon` - Correct (use instead of MailIcon)
- ✅ `PhoneIcon` - Correct

### Status & Feedback Icons
- ✅ `CheckIcon` - Correct
- ✅ `XMarkIcon` - Correct (use instead of XIcon)
- ✅ `ExclamationTriangleIcon` - Correct
- ✅ `InformationCircleIcon` - Correct
- ✅ `CheckCircleIcon` - Correct

### Utility Icons
- ✅ `EyeIcon` - Correct
- ✅ `EyeSlashIcon` - Correct
- ✅ `ClockIcon` - Correct
- ✅ `CalendarIcon` - Correct
- ✅ `DocumentIcon` - Correct
- ✅ `FolderIcon` - Correct

### Social & Sharing Icons
- ✅ `ShareIcon` - Correct
- ✅ `LinkIcon` - Correct
- ✅ `UserGroupIcon` - Correct
- ✅ `UsersIcon` - Correct

## Import Statement Template

```jsx
import {
  // Navigation
  UserIcon,
  HomeIcon,
  ChevronDownIcon,
  
  // Actions
  ArrowPathIcon,           // Instead of RefreshIcon
  ArrowTrendingUpIcon,     // Instead of TrendingUpIcon
  ArrowUpIcon,
  ArrowDownIcon,
  
  // E-commerce
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  TagIcon,
  
  // Search & Filter
  MagnifyingGlassIcon,     // Instead of SearchIcon
  FunnelIcon,              // Instead of FilterIcon
  
  // Communication
  ChatBubbleLeftIcon,
  EnvelopeIcon,            // Instead of MailIcon
  
  // Status
  CheckIcon,
  XMarkIcon,               // Instead of XIcon
  ExclamationTriangleIcon,
  
  // Utility
  EyeIcon,
  ClockIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
```

## Best Practices

1. **Always check the official Heroicons documentation** when adding new icons
2. **Use outline icons** (`@heroicons/react/24/outline`) for most UI elements
3. **Use solid icons** (`@heroicons/react/24/solid`) for filled states or emphasis
4. **Test imports immediately** after adding new icons to catch naming errors early
5. **Keep this reference updated** when new icons are added to the project

## Common Patterns

### Icon with Animation
```jsx
<ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
```

### Conditional Icon Rendering
```jsx
{trend === 'rising' ? (
  <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />
) : (
  <ArrowTrendingDownIcon className="h-3 w-3 text-red-500" />
)}
```

### Icon Button
```jsx
<button className="flex items-center space-x-2">
  <ArrowPathIcon className="h-4 w-4" />
  <span>Refresh</span>
</button>
```

## Project Status

✅ **All Phase 7 components updated to use correct Heroicons v2 names**
- AdvancedSearchPage.jsx - Fixed `TrendingUpIcon` → `ArrowTrendingUpIcon`
- RecommendationDashboard.jsx - Fixed `TrendingUpIcon` → `ArrowTrendingUpIcon` and `ArrowRefreshIcon` → `ArrowPathIcon`
- AnalyticsDashboard.jsx - Fixed `TrendingUpIcon` → `ArrowTrendingUpIcon`

Last Updated: December 2024