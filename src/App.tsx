import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import FamilyGuard from "@/components/FamilyGuard";

// Lazy load page components to reduce initial bundle size
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const BudgetsPage = lazy(() => import("@/pages/BudgetsPage"));
const FamilySettingsPage = lazy(() => import("@/pages/FamilySettingsPage"));

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignupPage />}
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <FamilyGuard>
                <DashboardPage />
              </FamilyGuard>
            }
          />
          <Route
            path="/transactions"
            element={
              <FamilyGuard>
                <TransactionsPage />
              </FamilyGuard>
            }
          />
          <Route
            path="/budgets"
            element={
              <FamilyGuard>
                <BudgetsPage />
              </FamilyGuard>
            }
          />
          <Route
            path="/categories"
            element={
              <FamilyGuard>
                <CategoriesPage />
              </FamilyGuard>
            }
          />
          <Route path="/settings/family" element={<FamilySettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
