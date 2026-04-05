import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/landing";
import Register from "@/pages/register";
import Test from "@/pages/test";
import Results from "@/pages/results";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/theme-provider";

function AppRouter() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/inschrijven" component={Register} />
        <Route path="/test/:participantId" component={Test} />
        <Route path="/resultaat/:resultId" component={Results} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
