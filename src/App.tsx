import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DebtDashboardProvider } from "./context/DebtDashboardContext";
import RequireAuth from "./components/RequireAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { apiConfig } from "./config/apiConfig";
import { initOpenRouterService } from "./services/openRouterService";

const queryClient = new QueryClient();

// Initialize OpenRouter service with API key
const initializeServices = () => {
  if (apiConfig.openRouterApiKey) {
    initOpenRouterService(apiConfig.openRouterApiKey);
  }
};

// Call initialization function
initializeServices();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DebtDashboardProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Index />
                  </RequireAuth>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DebtDashboardProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
