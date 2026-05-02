# ExpenseManagement

A full-stack personal finance tracking application built with **ASP.NET Core** on the backend and **React + TypeScript** on the frontend. It allows users to track daily expenses, manage categories, visualise spending trends, and receive smart budget alerts — all behind a secure JWT authentication system with real-time updates via SignalR.

---

## Tech Stack

### Backend
- **ASP.NET Core Web API** — RESTful API
- **Entity Framework Core** — ORM with SQL Server
- **ASP.NET Core Identity** — user management
- **JWT + Refresh Tokens** — stateless authentication
- **SignalR** — real-time notifications

### Frontend
- **React 19 + TypeScript** — UI layer
- **TanStack Router** — file-based routing with type safety
- **TanStack Query v5** — server state management and caching
- **React Hook Form** — form validation
- **Tailwind CSS + shadcn/ui** — styling and components
- **Recharts** — data visualisation

---

## Features

- **Authentication** — register, login, logout, email confirmation, JWT refresh token flow
- **Expense Management** — create, read, update, delete expenses with category assignment
- **Category Management** — full CRUD for spending categories with monthly budget limits
- **Dashboard**
  - Monthly and yearly spending summaries
  - Percentage change vs previous month
  - Top 5 spending categories with share percentages
  - Monthly and yearly chart data (last 6 months)
  - Recent expenses (today and yesterday)
  - Smart alerts (spending spikes, budget dominance, positive streaks)
- **Real-time updates** via SignalR — expense changes reflect instantly across sessions
- **Savings Goals** — track progress toward financial targets

---

## Project Structure

```
├── ExpenseManagement.API/          # ASP.NET Core backend
│   ├── Controllers/                # API endpoints
│   ├── DTOs/                       # Data transfer objects
│   ├── Data/                       # DbContext and migrations
│   └── Services/                   # Business logic
│
└── expense-management-client/      # React frontend
    └── src/
        ├── api/                    # Axios API calls
        ├── components/             # Reusable UI components
        ├── context/                # AuthContext (global auth state)
        ├── hooks/                  # Custom hooks
        │   ├── useAuthActions.ts   # login · logout · register · email
        │   ├── useExpenses.ts      # fetch · create · update
        │   ├── useCategories.ts    # fetch · create · update · delete
        │   └── useDashboard.ts     # dashboard · savings · realtime
        ├── routes/                 # TanStack Router pages
        └── Types/                  # Shared TypeScript types
```

---

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- SQL Server

### Backend

```bash
cd ExpenseManagement.API
# Update connection string in appsettings.json
dotnet ef database update
dotnet run
```

### Frontend

```bash
cd expense-management-client
npm install
npm run dev
```

---

## API Overview

| Method | Endpoint           | Description |
|--------|--------------------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/logout` | Logout and invalidate token |
| POST | `/api/auth/refresh-token` | Refresh access token |
| GET | `/api/expenses` | Get all user expenses |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/dashboard` | Full dashboard data |

---

## Architecture Decisions

**Consolidated hooks** — instead of one file per API operation, related operations are grouped into a single hook (`useCategories`, `useExpenses`, `useAuthActions`). This reduces imports, co-locates invalidation logic, and shares error handling across mutations.

**Optimistic query invalidation** — all mutations invalidate their related query key on success, keeping the UI in sync without manual state management.

**Auth flow** — access tokens are stored in memory (not localStorage) and refreshed via an HttpOnly cookie on app load, preventing XSS token theft.
