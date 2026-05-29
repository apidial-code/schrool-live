import React from 'react';
import { Route, Switch } from "wouter";
import EliteEnrollment from "./pages/EliteEnrollment";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Switch>
      <Route path="/enroll/elite" component={EliteEnrollment} />
      <Route path="/enrollment/success" component={EnrollmentSuccess} />
      <Route path="/student" component={StudentDashboard} />
      <Route path="/parent" component={ParentDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/">
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem', fontFamily: 'sans-serif' }}>
          <header style={{ maxWidth: '64rem', margin: '0 auto 2rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e3a8a' }}>SCHROOL Platform</h1>
            <p style={{ color: '#4b5563' }}>Educational Mathematics Platform - Live Deployment</p>
          </header>
          <main style={{ maxWidth: '64rem', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#1e40af', marginBottom: '1rem' }}>Welcome to SCHROOL</h2>
              <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '2rem' }}>Please select an option below to continue.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                <a href="/enroll/elite" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#1e40af', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}>
                  Go to Elite Enrollment
                </a>
                <a href="/student" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}>
                  Student Dashboard
                </a>
              </div>
            </div>
          </main>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
// Temporary comment to trigger rebuild
