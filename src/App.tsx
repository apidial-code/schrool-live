import React from "react";
import { Route, Switch } from "wouter";
import { trpc } from "./lib/trpc";
import EliteEnrollment from "./pages/EliteEnrollment";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SignIn from "./pages/SignIn.tsx";
function Notice({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main style={{
      maxWidth: 640,
      margin: "64px auto",
      padding: 24,
      fontFamily: "sans-serif",
    }}>
      <h1 style={{ color: "#1560B0" }}>{title}</h1>
      {children}
      <p><a href="/">Return to home</a></p>
    </main>
  );
}

function DashboardGate({ role, children }: {
  role: string;
  children: React.ReactNode;
}) {
  const session = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (session.isLoading) {
    return (
      <Notice title="Checking your session">
        <p>Please wait.</p>
      </Notice>
    );
  }

  if (session.error) {
    return (
      <Notice title="Unable to check your session">
        <p>Please try again.</p>
        <button onClick={() => session.refetch()}>
          Try again
        </button>
      </Notice>
    );
  }

  if (!session.data) {
    return (
      <Notice title="Please sign in">
        <p>You need a verified session to open this dashboard.</p>
        <p><a href="/login">Go to sign in</a></p>
      </Notice>
    );
  }

  if (session.data.role !== role) {
    return (
      <Notice title="Access restricted">
        <p>This dashboard is for a different account role.</p>
      </Notice>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Switch>
      <Route path="/login" component={SignIn} />

      <Route path="/enroll/elite" component={EliteEnrollment} />
      <Route path="/enrollment/success" component={EnrollmentSuccess} />

      <Route path="/student">
        <DashboardGate role="student">
          <StudentDashboard />
        </DashboardGate>
      </Route>

      <Route path="/parent">
        <DashboardGate role="parent">
          <ParentDashboard />
        </DashboardGate>
      </Route>

      <Route path="/teacher">
        <DashboardGate role="teacher">
          <TeacherDashboard />
        </DashboardGate>
      </Route>

      <Route path="/admin">
        <DashboardGate role="admin">
          <AdminDashboard />
        </DashboardGate>
      </Route>

      <Route path="/">
        <Notice title="SCHROOL Platform">
          <p>Staging environment for enrolment and account testing.</p>
          <p><a href="/login">Sign in</a></p>
          <p><a href="/student">Student dashboard</a></p>
        </Notice>
      </Route>

      <Route>
        <Notice title="Page not found">
          <p>Please return to home.</p>
        </Notice>
      </Route>
    </Switch>
  );
}
