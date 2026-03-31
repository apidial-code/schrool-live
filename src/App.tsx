import React from 'react';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem', fontFamily: 'sans-serif' }}>
      <header style={{ maxWidth: '64rem', margin: '0 auto 2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e3a8a' }}>SCHROOL Platform</h1>
        <p style={{ color: '#4b5563' }}>Educational Mathematics Platform - Live Deployment</p>
      </header>
      
      <main style={{ maxWidth: '64rem', margin: '0 auto', backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1e40af', marginBottom: '1rem' }}>Deployment Successful!</h2>
          <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '2rem' }}>The SCHROOL platform is now live and connected to the database.</p>
          <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #dbeafe', display: 'inline-block' }}>
            <p style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem' }}>Fraction Display Test:</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '1.5rem' }}>
              <span>3</span>
              <div style={{ width: '2rem', height: '2px', backgroundColor: 'black', margin: '2px 0' }}></div>
              <span>4</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

