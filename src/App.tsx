import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ImpersonationProvider } from "./contexts/ImpersonationContext";
import ImpersonationBanner from "./components/ImpersonationBanner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RoleSelector from "./pages/RoleSelector";
import DemoRoleSelector from "./pages/DemoRoleSelector";
import DemoLanding from "./pages/DemoLanding";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Enrollment from "./pages/Enrollment";
import TeacherApplication from "./pages/TeacherApplication";
import TeacherAvailability from "./pages/TeacherAvailability";
import AdminTeachers from "./pages/AdminTeachers";
import EliteEnrollment from "./pages/EliteEnrollment";
import StandardEnrollment from "./pages/StandardEnrollment";
import TeacherApplicationNew from "./pages/TeacherApplicationNew";
import Enroll from "./pages/Enroll";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";
import { EnrollmentForm } from "./pages/EnrollmentForm";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import MagicLinkLogin from "./pages/MagicLinkLogin";
import Year56EliteEnrollmentPage from "./pages/Year56EliteEnrollmentPage";
import Year7EliteEnrollmentPage from "./pages/Year7EliteEnrollmentPage";
import Year8EliteEnrollmentPage from "./pages/Year8EliteEnrollmentPage";
import Year9EliteEnrollmentPage from "./pages/Year9EliteEnrollmentPage";

function Router() {
  return (
    <>
      <ImpersonationBanner />
      <Switch>
        <Route path={"/"} component={DemoLanding} />
        <Route path={"/home"} component={Home} />
        <Route path={"/login"} component={Login} />
        <Route path="/auth/magic-link" component={MagicLinkLogin} />
        <Route path={"/select-role"} component={RoleSelector} />
        <Route path={"/student"} component={StudentDashboard} />
        <Route path={"/parent"} component={ParentDashboard} />
        <Route path={"/teacher"} component={TeacherDashboard} />
        <Route path={"/admin"} component={AdminDashboard} />
          <Route path="/enroll" component={Enroll} />
          <Route path="/enroll-new" component={EnrollmentForm} />
          <Route path="/enrollment/success" component={EnrollmentSuccess} />
          <Route path="/enroll/elite" component={EliteEnrollment} />
          <Route path="/enroll/standard" component={StandardEnrollment} />
          <Route path="/enroll/year5-6-elite" component={Year56EliteEnrollmentPage} />
          <Route path="/enroll/year7-elite" component={Year7EliteEnrollmentPage} />
          <Route path="/enroll/year8-elite" component={Year8EliteEnrollmentPage} />
          <Route path="/enroll/year9-elite" component={Year9EliteEnrollmentPage} />
          <Route path="/enrollment/old" component={Enrollment} />
          <Route path="/teacher/apply-new" component={TeacherApplicationNew} />
          <Route path="/teacher/apply" component={TeacherApplication} />
          <Route path="/teacher/availability" component={TeacherAvailability} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/admin/teachers" component={AdminTeachers} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <ImpersonationProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ImpersonationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
