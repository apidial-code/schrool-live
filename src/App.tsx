import React from 'react';
import { FractionDisplay } from './components/FractionDisplay';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-blue-900">SCHROOL Platform</h1>
        <p className="text-gray-600">Educational Mathematics Platform</p>
      </header>
      
      <main className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Fraction Renderer Test</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Vertical Format:</p>
              <FractionDisplay numerator={3} denominator={4} />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Mixed Number:</p>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold">2</span>
                <FractionDisplay numerator={1} denominator={2} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-lg text-gray-700 mb-4">The platform is being updated with the latest lesson fixes.</p>
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Lessons
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
