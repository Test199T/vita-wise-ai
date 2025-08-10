import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health-goals" element={<HealthGoals />} />
            <Route path="/exercise-log" element={<ExerciseLog />} />
            <Route path="/food-log" element={<FoodLog />} />
            <Route path="/sleep-log" element={<SleepLog />} />
            <Route path="/water-log" element={<WaterLog />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </OnboardingProvider>
  </QueryClientProvider>
);

export default App;
