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
import Rebalance from "./pages/rebalance";
import SharedPortfolio from "./pages/shared-portfolio";
import ComparePortfolios from "./pages/compare-portfolios";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/rebalance" component={Rebalance} />
      <Route path="/shared/:shareId" component={SharedPortfolio} />
      <Route path="/compare" component={ComparePortfolios} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PortfolioProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Router />
            </main>
          </div>
          <Toaster />
        </PortfolioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
