import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import HealthGoals from "./pages/HealthGoals";
import ExerciseLog from "./pages/ExerciseLog";
import FoodLog from "./pages/FoodLog";
import AIInsights from "./pages/AIInsights";
import Onboarding from "./pages/Onboarding";
import SleepLog from "./pages/SleepLog";
import WaterLog from "./pages/WaterLog";
import Notifications from "./pages/Notifications";
import Debug from "./pages/Debug";
import GradualBlurDemo from "./pages/GradualBlurDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OnboardingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo/gradual-blur" element={<GradualBlurDemo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-goals"
              element={
                <ProtectedRoute>
                  <HealthGoals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercise-log"
              element={
                <ProtectedRoute>
                  <ExerciseLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-log"
              element={
                <ProtectedRoute>
                  <FoodLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sleep-log"
              element={
                <ProtectedRoute>
                  <SleepLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/water-log"
              element={
                <ProtectedRoute>
                  <WaterLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-insights"
              element={
                <ProtectedRoute>
                  <AIInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/debug"
              element={
                <ProtectedRoute>
                  <Debug />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OnboardingProvider>
  </QueryClientProvider>
);

export default App;
