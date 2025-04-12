import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import QuizzesPage from "@/pages/quizzes-page";
import QuizPage from "@/pages/quiz-page";
import ResultsPage from "@/pages/results-page";
import ProfilePage from "@/pages/profile-page";
import AttemptsPage from "@/pages/attempts-page";
import RewardsPage from "@/pages/rewards-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/quizzes" component={QuizzesPage} />
      <ProtectedRoute path="/quiz/:id" component={QuizPage} />
      <ProtectedRoute path="/results/:attemptId" component={ResultsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/attempts" component={AttemptsPage} />
      <ProtectedRoute path="/rewards" component={RewardsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
