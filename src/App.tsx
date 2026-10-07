import React, { useState } from 'react';
import Header from './components/Header';
import UniversalCalculator from './components/UniversalCalculator';
import SmartCalc from './components/SmartCalc';

export default function App() {
  const [view, setView] = useState<'universal' | 'smart'>('universal');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F8FF' }}>
      <Header view={view} onSelectView={setView} />
      <main style={{ flex: 1 }}>
        {view === 'universal' ? (
          <UniversalCalculator onOpenSmart={() => setView('smart')} />
        ) : (
          <SmartCalc onBackToUniversal={() => setView('universal')} />
        )}
      </main>
    </div>
  );
}
