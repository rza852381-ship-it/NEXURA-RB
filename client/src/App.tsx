import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter"; // موجود عندك
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// الصفحات الحالية
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SEO from "./pages/SEO";
import Campaigns from "./pages/Campaigns";
import Finance from "./pages/Finance";
import Stores from "./pages/Stores";
import SallaIntegration from "./pages/SallaIntegration";
import SallaConnect from "./pages/SallaConnect";

// الصفحات الجديدة
import Analytics from "./pages/Analytics";
import Social from "./pages/Social";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/seo"} component={SEO} />
      <Route path={"/campaigns"} component={Campaigns} />
      <Route path={"/finance"} component={Finance} />
      <Route path={"/stores"} component={Stores} />

      {/* الصفحات الجديدة */}
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/social"} component={Social} />

      <Route path={"/salla"} component={SallaIntegration} />
      <Route path={"/salla-connect"} component={SallaConnect} />

      {/* صفحة 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
