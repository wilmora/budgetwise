# BudgetWise - Personal Finance Tracker

> **Smart budget tracking app with AI-powered categorization**  
> Cross-platform: Web (PWA) + Android (via Capacitor)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Architecture](#architecture)
6. [Known Issues & Areas Needing Work](#known-issues--areas-needing-work)
7. [Local Development](#local-development)
8. [Deployment](#deployment)

---

## Overview

BudgetWise is a personal finance/budget tracking application designed for everyday users who want to:
- Track income and expenses
- Set and monitor budget goals by category
- Import bank/credit card statements via CSV
- Get AI-powered insights and transaction categorization
- View spending trends with charts and analytics

The app uses a **neumorphic (soft UI) design** with light/dark theme support.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **Vite 5** | Build tool and dev server |
| **Recharts** | Charts and data visualization |
| **Capacitor 8** | Native Android wrapper |
| **vite-plugin-pwa** | Progressive Web App capabilities |
| **LocalStorage** | Data persistence (no backend) |

### Key Dependencies (package.json)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "recharts": "^2.10.3",
  "@capacitor/android": "^8.0.0",
  "@capacitor/core": "^8.0.0"
}
```

---

## Project Structure

```
budget-tracker/
├── src/
│   ├── App.jsx                 # Main app component (routing, theme, onboarding)
│   ├── main.jsx                # React entry point
│   ├── index.css               # Neumorphic design system (~1000 lines)
│   ├── components/
│   │   ├── Dashboard.jsx       # Overview with charts, insights, recent transactions
│   │   ├── Transactions.jsx    # Transaction list, add/edit, AI suggestions
│   │   ├── Budget.jsx          # Budget goals per category, weekly trends
│   │   ├── Settings.jsx        # Import/export CSV, theme, preferences
│   │   └── Onboarding/
│   │       ├── index.jsx       # Onboarding flow controller
│   │       ├── Welcome.jsx     # Currency selection
│   │       ├── Reminders.jsx   # Notification preferences
│   │       ├── Analytics.jsx   # Analytics opt-in
│   │       └── Tutorial.jsx    # How it works guide
│   └── utils/
│       ├── storage.js          # LocalStorage CRUD operations
│       ├── aiCategorizer.js    # Keyword + history-based categorization
│       └── csvHandler.js       # CSV parsing (bank & credit card support)
├── android/                    # Capacitor Android project
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration with PWA
├── capacitor.config.json       # Capacitor settings
└── package.json
```

---

## Features

### 1. Dashboard
- Summary cards: Income, Expenses, Balance, Savings Rate
- Spending by category (pie chart)
- Daily spending trend (area chart)
- Monthly spending projection
- Recent transactions list
- AI-generated insights (high spending alerts, savings tips)

### 2. Transactions
- Add/edit/delete transactions
- Filter by type (all/income/expense)
- Search by description or category
- AI-powered category suggestions with confidence scores
- Categories: Food, Transport, Shopping, Entertainment, Utilities, Health, Education, Travel, Subscriptions, Groceries, Salary, Freelance, Investments, Gifts, Other

### 3. Budget
- Set monthly budget limits per category
- Visual progress bars with status (success/warning/danger)
- Weekly income vs expense bar chart
- Budget alerts when over limit

### 4. Settings
- Import CSV (auto-detects bank statement formats)
- Export transactions to CSV
- Light/Dark theme toggle
- Reminder notifications toggle
- Analytics opt-in toggle
- Clear all data
- View/reset onboarding

### 5. Onboarding Flow
- Welcome screen with currency selection
- Reminder preferences (optional)
- Analytics consent (optional)
- Interactive tutorial ("How it works")

---

## Architecture

### State Management
- **React useState/useMemo** for component state
- **LocalStorage** for persistence (no backend/database)
- Keys: `budgetwise_transactions`, `budgetwise_budgets`, `budgetwise_settings`, etc.

### AI Categorization (`aiCategorizer.js`)
1. **History matching**: Finds similar past transactions by keyword overlap
2. **Keyword patterns**: Predefined lists for each category (e.g., "starbucks" → food)
3. **Default fallback**: Returns "other" with low confidence

### CSV Import (`csvHandler.js`)
- Supports both header-based and headerless CSVs
- Detects date, description, amount columns automatically
- Handles split debit/credit columns (credit card statements)
- Two import modes: "credit_card" and "bank"
- AI categorizes imported transactions automatically

### Design System (`index.css`)
- Neumorphic (soft UI) aesthetic
- CSS custom properties for theming
- Shadows: `--neu-shadow`, `--neu-shadow-pressed`
- Light/dark themes via `.dark-theme` class
- Responsive grid layouts

---

## Known Issues & Areas Needing Work

> **⚠️ IMPORTANT FOR REVIEWERS**: The following areas need improvement before the app is production-ready.

### 🔴 Critical Issues

1. **Currency Hardcoded to USD**
   - `formatCurrency()` in multiple files uses `currency: 'USD'` even though onboarding collects currency preference
   - Needs: Read from localStorage and use dynamic currency formatting

2. **No Data Validation**
   - Transaction amounts can be negative or zero
   - Dates have no bounds checking
   - Needs: Input validation and error messages

3. **LocalStorage Limitations**
   - No data backup/sync
   - ~5MB storage limit
   - Data lost if user clears browser data
   - Needs: Consider IndexedDB or cloud sync

### 🟡 Medium Priority

4. **Reminders Not Implemented**
   - Onboarding collects reminder preferences but they do nothing
   - Needs: Push notification integration (Web Push API, Capacitor LocalNotifications)

5. **Analytics Toggle Does Nothing**
   - UI shows analytics opt-in but no analytics tracking exists
   - Either implement or remove the option

6. **No Transaction Editing UX on Mobile**
   - Clicking a transaction opens edit modal, but no visual affordance
   - Needs: Swipe actions or edit icon

7. **AI Categorization Accuracy**
   - Keyword matching is very basic
   - Needs: More comprehensive keyword lists or ML integration

8. **CSV Import Edge Cases**
   - Date format detection can fail for non-US formats
   - Needs: User-selectable date format or better parsing

### 🟢 Low Priority / Polish

9. **No Loading States**
   - CSV import shows "Importing..." but UI doesn't block interaction
   - Needs: Proper loading spinners/skeleton screens

10. **Chart Tooltips Hardcoded Dark Theme**
    - Recharts tooltip styles don't adapt to light/dark theme
    - Needs: Dynamic tooltip styling

11. **Onboarding Can't Be Customized After Setup**
    - Currency can't be changed from Settings
    - "Edit in onboarding" is a workaround, not a solution

12. **No Recurring Transactions**
    - Users must manually add monthly bills
    - Needs: Recurring transaction feature

13. **No Account/Category Management**
    - Cannot add custom categories
    - Cannot track multiple accounts separately

### 📱 Android-Specific Issues

14. **Untested on Physical Devices**
    - Needs thorough testing on various Android versions
    - Status bar/navigation bar padding may need adjustment

15. **No Firebase Auth Integration**
    - Play Store submission may require user accounts
    - Currently data is device-local only

---

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Sync to Android (after build)
npx cap sync android

# Open Android Studio
npx cap open android
```

---

## Deployment

### Web (PWA)
1. `npm run build`
2. Deploy `dist/` folder to any static host (Vercel, Netlify, etc.)

### Android (Play Store)
1. `npm run build`
2. `npx cap sync android`
3. Open in Android Studio: `npx cap open android`
4. Generate signed AAB: Build → Generate Signed Bundle
5. Upload to Play Console

---

## For LLM Reviewers

If you're reviewing this codebase to suggest improvements, please focus on:

1. **Code quality**: Are there patterns that could be refactored?
2. **UX issues**: Any usability problems in the component logic?
3. **Performance**: Any unnecessary re-renders or optimizations needed?
4. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
5. **Security**: Any LocalStorage data exposure risks?
6. **Feature completeness**: Gaps between onboarding promises and actual features

The main goal is to make this app **ready for public beta testing** on Android.

---

## License

Personal project - not open source (yet)

---

*Last updated: January 2026*
