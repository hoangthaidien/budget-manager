# Budget Manager - Project Summary

## 📋 Project Overview

Budget Manager is a modern web application for managing personal finances, tracking income and expenses, and monitoring budgets. Built with a focus on user experience and data visualization, it follows the standards of popular budget management apps like Mint and YNAB. The platform now supports multi-user Family workspaces so households can collaborate on shared budgets, categories, and transactions with role-based permissions.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Neutral theme)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Charts**: Recharts (for data visualization)

### Backend & Services
- **Backend-as-a-Service**: Appwrite Cloud
  - Authentication
  - Database (TablesDB API)
  - Real-time updates
- **State Management**: TanStack Query (React Query) v5

### Development Tools
- **TypeScript**: ~5.9.3
- **ESLint**: v9 with React hooks plugin
- **PostCSS**: v8 with Autoprefixer

## 📁 Project Structure

```
budget-manager/
├── docs/                      # Documentation
│   └── PROJECT_SUMMARY.md     # This file
├── src/
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   └── ProtectedRoute.tsx # Route guard for auth
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context & provider
│   ├── lib/
│   │   ├── appwrite.ts        # Appwrite client configuration
│   │   └── utils.ts           # Utility functions (cn, etc.)
│   ├── pages/
│   │   ├── DashboardPage.tsx  # Main dashboard
│   │   ├── LoginPage.tsx      # Login form
│   │   └── SignupPage.tsx     # Registration form
│   ├── App.tsx                # Main app with routing logic
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles & Tailwind config
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment template
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies & scripts
```

## 🔐 Authentication System

### Features Implemented
- **User Registration**: Email/password signup with validation
- **User Login**: Secure session-based authentication
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Session Management**: Persistent login state
- **Logout**: Clean session termination

### Components
1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Provides `useAuth()` hook
   - Methods: `login()`, `signup()`, `logout()`
   - State: `user`, `loading`

2. **LoginPage** (`src/pages/LoginPage.tsx`)
   - Email/password form
   - Error handling
   - Link to signup

3. **SignupPage** (`src/pages/SignupPage.tsx`)
   - Registration form with name, email, password
   - Password confirmation
   - Validation (min 8 characters)

4. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - Guards authenticated routes
   - Shows loading spinner during auth check
   - Redirects to `/login` if not authenticated

## 🗄️ Database Schema (Appwrite)

### Collections

#### 1. Families
| Field     | Type   | Required | Description                                 |
|-----------|--------|----------|---------------------------------------------|
| name      | string | Yes      | Display name for the family workspace       |
| owner_id  | string | Yes      | Appwrite user ID of the family creator      |
| currency  | string | No       | Optional ISO currency code (defaults to USD)|

#### 2. Family Members
| Field      | Type     | Required | Description                                       |
|------------|----------|----------|---------------------------------------------------|
| family_id  | relation | Yes      | Link to the Families collection                   |
| user_id    | string   | Yes      | Appwrite user ID of the member                    |
| role       | string   | Yes      | 'owner' or 'member' (only owners can delete data) |

#### 3. Categories
| Field      | Type     | Required | Description                                    |
|------------|----------|----------|------------------------------------------------|
| name       | string   | Yes      | Category name                                  |
| type       | string   | Yes      | 'income' or 'expense'                          |
| icon       | string   | No       | Icon identifier                                |
| family_id  | relation | Yes      | Family workspace that owns the category        |
| created_by | string   | Yes      | User ID of the member who created the category |

#### 4. Transactions
| Field        | Type     | Required | Description                                          |
|--------------|----------|----------|------------------------------------------------------|
| amount       | double   | Yes      | Transaction amount                                   |
| type         | string   | Yes      | 'income' or 'expense'                                |
| category_id  | relation | Yes      | Link to Categories                                   |
| tags         | array    | No       | Optional list of tag IDs                             |
| date         | datetime | Yes      | Transaction date                                     |
| description  | string   | No       | Optional note                                        |
| family_id    | relation | Yes      | Family workspace where the transaction belongs       |
| created_by   | string   | Yes      | User ID of the member who created/edited the record  |

#### 5. Budgets
| Field       | Type     | Required | Description                                          |
|-------------|----------|----------|------------------------------------------------------|
| category_id | relation | Yes      | Link to Categories                                   |
| amount      | double   | Yes      | Budget limit                                         |
| period      | string   | Yes      | Default: 'monthly'                                   |
| family_id   | relation | Yes      | Family workspace that owns the budget                |
| created_by  | string   | Yes      | User ID of the member who created/managed the budget |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Appwrite Cloud account

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Appwrite Cloud**:
   - Create a project at https://cloud.appwrite.io
   - Create a Database
   - Create the three collections (Categories, Transactions, Budgets)
   - Configure attributes as per the schema above
   - Set up appropriate permissions (user-level access)

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Appwrite Project ID:
   ```
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_actual_project_id
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```
   
   Visit http://localhost:5173

5. **Build for production**:
   ```bash
   npm run build
   ```

## 📱 Application Routes

| Route     | Access  | Component       | Description                    |
|-----------|---------|-----------------|--------------------------------|
| `/login`        | Public  | LoginPage        | User login                     |
| `/signup`       | Public  | SignupPage       | User registration              |
| `/`             | Private | DashboardPage    | Main dashboard                 |
| `/categories`   | Private | CategoriesPage   | Manage income/expense categories |
| `/transactions` | Private | TransactionsPage | Log income and expenses        |
| `/budgets`      | Private | BudgetsPage      | Set and track spending limits  |

## ✨ Features Roadmap

### ✅ Completed
- [x] Project initialization with Vite + React + TypeScript
- [x] Tailwind CSS v4 setup
- [x] Shadcn UI integration
- [x] Appwrite SDK configuration
- [x] Appwrite database setup
- [x] React Query setup
- [x] Authentication system (login, signup, logout)
- [x] Protected routes
- [x] Basic dashboard layout
- [x] Category management (CRUD)
- [x] Transaction management (CRUD)
- [x] Budget tracking and alerts
- [x] Dashboard with summary cards (Real data)
- [x] Internationalization (i18n) - English & Vietnamese
- [x] Dynamic currency formatting ($ / đ)
- [x] Responsive mobile design

### 🚧 In Progress / Planned
- [x] Transaction filtering and search
- [ ] Income vs Expense charts
- [ ] Dark/Light theme toggle
- [ ] Data export functionality

## 🎨 Design Philosophy

### UI/UX Principles
- **Modern & Premium**: Gradient backgrounds, smooth animations, glassmorphism effects
- **Responsive**: Mobile-first design approach
- **Accessible**: Semantic HTML, proper ARIA labels
- **Consistent**: Shadcn UI component library for uniformity
- **Fast**: Optimized builds, lazy loading, React Query caching

### Color Scheme
- **Base**: Neutral (Shadcn UI)
- **Dark Mode**: Full support with `dark:` variants
- **Accents**: Customizable via CSS variables

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📦 Key Dependencies

| Package                    | Version | Purpose                        |
|----------------------------|---------|--------------------------------|
| react                      | ^19.2.0 | UI framework                   |
| react-router-dom           | ^7.9.6  | Client-side routing            |
| appwrite                   | ^21.4.0 | Backend services               |
| @tanstack/react-query      | ^5.90.11| Data fetching & caching        |
| tailwindcss                | ^4.1.17 | Utility-first CSS              |
| @tailwindcss/vite          | ^4.1.17 | Tailwind Vite plugin           |
| lucide-react               | ^0.554.0| Icon library                   |
| recharts                   | ^3.5.0  | Charts & data visualization    |
| i18next                    | latest  | Internationalization framework |
| react-i18next              | latest  | React bindings for i18next     |

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` to version control
- **Authentication**: Session-based auth via Appwrite
- **Data Access**: User-level permissions in Appwrite collections
- **Input Validation**: Client-side and server-side validation
- **HTTPS**: Always use HTTPS in production

## 📝 Environment Variables

| Variable                   | Description                    | Example                        |
|----------------------------|--------------------------------|--------------------------------|
| VITE_APPWRITE_ENDPOINT     | Appwrite API endpoint          | https://cloud.appwrite.io/v1   |
| VITE_APPWRITE_PROJECT_ID   | Your Appwrite project ID       | 507f1f77bcf86cd799439011       |

## 🤝 Contributing Guidelines

1. Follow the existing code style, always use shadcn UI components first.
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test authentication flows before committing
5. Update documentation for new features

## 📄 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules .vite dist && npm install`

### Authentication Issues
- Verify Appwrite project ID in `.env`
- Check Appwrite console for API errors
- Ensure collections have proper permissions

### Styling Issues
- Tailwind v4 uses `@import "tailwindcss"` syntax
- Ensure `@tailwindcss/vite` plugin is in `vite.config.ts`

## 📞 Support

For issues or questions, refer to:
- [Appwrite Documentation](https://appwrite.io/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Vite Documentation](https://vitejs.dev)
- [React Query Documentation](https://tanstack.com/query)

---

**Last Updated**: November 26, 2025  
**Version**: 0.2.0 (Core Features & i18n)
