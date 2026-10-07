import React, { useState } from 'react';
import Header from './components/Header';
import IsometricDashboard from './components/IsometricDashboard';
import GeminiChatbot from './components/GeminiChatbot';
import UniversalCalculator from './components/UniversalCalculator';
import SmartCalc from './components/SmartCalc';

export default function App() {
  const [view, setView] = useState<'isometric' | 'chat' | 'universal' | 'smart'>('isometric');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: view === 'isometric' || view === 'chat' ? '#070F26' : '#F4F8FF',
      }}
    >
      <Header view={view} onSelectView={setView} />
      <main style={{ flex: 1 }}>
        {view === 'isometric' ? (
          <IsometricDashboard />
        ) : view === 'chat' ? (
          <GeminiChatbot />
        ) : view === 'universal' ? (
          <UniversalCalculator onOpenSmart={() => setView('smart')} />
        ) : (
          <SmartCalc onBackToUniversal={() => setView('universal')} />
        )}
      </main>
    </div>
  );
}
