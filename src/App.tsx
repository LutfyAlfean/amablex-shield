import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Tenants from "./pages/Tenants";
import UsersPage from "./pages/UsersPage";
import Tokens from "./pages/Tokens";
import Alerts from "./pages/Alerts";
import AuditLog from "./pages/AuditLog";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" theme="dark" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute><Analytics /></ProtectedRoute>
            } />
            <Route path="/tenants" element={
              <ProtectedRoute requireAdmin><Tenants /></ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requireAdmin><UsersPage /></ProtectedRoute>
            } />
            <Route path="/tokens" element={
              <ProtectedRoute requireAdmin><Tokens /></ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute requireAdmin><Alerts /></ProtectedRoute>
            } />
            <Route path="/audit" element={
              <ProtectedRoute requireAdmin><AuditLog /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requireAdmin><SettingsPage /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
