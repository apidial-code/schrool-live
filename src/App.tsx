import React from 'react';
import { Route, Switch } from "wouter";
import EliteEnrollment from "./pages/EliteEnrollment";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";

function App() {
  return (
    <Switch>
      <Route path="/enroll/elite" component={EliteEnrollment} />
      <Route path="/enrollment/success" component={EnrollmentSuccess} />
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
              <a href="/enroll/elite" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#1e40af', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 'bold' }}>
                Go to Elite Enrollment
              </a>
            </div>
          </main>
        </div>
      </Route>
    </Switch>
  );
}
export default App;
