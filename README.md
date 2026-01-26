# BudgetWise

A premium personal finance web application built with React and Vite.

![Status](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## Features

- 📊 **Dashboard** - Summary cards, spending charts, AI insights
- 💰 **Transactions** - Add, edit, delete with category suggestions
- 🎯 **Budgets** - Category limits with progress tracking
- 📸 **Receipt Capture** - Photo-to-transaction (mock)
- 🌙 **Dark Mode** - Full theme support
- ✨ **AI Insights** - Smart financial tips

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
src/
├── components/       # React components
│   ├── layout/       # AppLayout with sidebar/nav
│   ├── ui/           # Button, Modal, Toast
│   ├── Onboarding/   # First-time user setup
│   ├── Dashboard.jsx
│   ├── Transactions.jsx
│   ├── Budget.jsx
│   └── Settings.jsx
├── styles/           # Modular CSS
│   ├── tokens.css    # Design tokens
│   ├── animations.css
│   ├── dashboard.css
│   └── ...
└── utils/            # Helpers
    ├── storage.js    # localStorage CRUD
    ├── currency.js   # Formatting
    └── aiService.js  # AI mock responses
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 |
| Build | Vite 5.4 |
| Styling | Vanilla CSS |
| Charts | Recharts |
| Storage | localStorage |

## Design Tokens

```css
/* Colors */
--color-primary-500: #3b82f6  /* Blue */
--color-accent-500:  #8b5cf6  /* Purple */
--color-success:     #10b981  /* Green */
--color-danger:      #ef4444  /* Red */

/* Layout */
--sidebar-width: 260px
--bottom-nav-height: 72px
```

## Data Storage

All data persists in localStorage:

- `budgetwise-transactions` - Transaction array
- `budgetwise-budgets` - Budget limits
- `budgetwise-theme` - Light/Dark
- `budgetwise-currencies` - Selected currency

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build
```

## License

MIT
