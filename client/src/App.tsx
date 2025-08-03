import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortfolioProvider } from "./contexts/portfolio-context";
import { Header } from "./components/layout/header";
import { Navigation } from "./components/layout/navigation";
import Dashboard from "./pages/dashboard";
import Portfolio from "./pages/portfolio";
import Performance from "./pages/performance";
import Rebalance from "./pages/rebalance";
import NotFound from "./pages/not-found";
import ComparePortfolios from "./pages/compare-portfolios";
import SharedPortfolio from "./pages/shared-portfolio";
import { AuthProvider } from "./contexts/AuthContext"; 
import Register from "./components/auth/Register"
import Login from "./components/auth/Login"
import Verify from "./components/auth/VerifyOtp"
function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/performance" component={Performance} />
      <Route path="/rebalance" component={Rebalance} />
      <Route path="/shared/:shareId" component={SharedPortfolio} />
      <Route path="/compare" component={ComparePortfolios} />
      {/* ✅ เสริม Auth Route */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify" component={Verify} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PortfolioProvider>
          <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Router />
            </main>
          </div>
          <Toaster />
          </AuthProvider>
        </PortfolioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;