import React from 'react';

export default function Header({
  view,
  onSelectView,
}: {
  view: 'universal' | 'smart';
  onSelectView: (v: 'universal' | 'smart') => void;
}) {
  return (
    <header
      style={{
        backgroundColor: '#071230',
        borderBottom: '1px solid #142754',
        padding: '12px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 840,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              backgroundColor: '#101D48',
              border: '1.5px solid #62E9FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(45, 124, 255, 0.4)',
              color: '#62E9FF',
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            SC
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 900, letterSpacing: '0.2px' }}>
              SmartCalc <span style={{ color: '#62E9FF' }}>AI</span>
            </div>
            <div style={{ color: '#A8B7D8', fontSize: 9, fontWeight: 700, marginTop: 1 }}>
              by Suraj Rai · Calculate Anything
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: 6, backgroundColor: '#0F214D', padding: 4, borderRadius: 14 }}>
          <button
            type="button"
            onClick={() => onSelectView('universal')}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              backgroundColor: view === 'universal' ? '#176CFF' : 'transparent',
              color: view === 'universal' ? '#FFF' : '#A8B7D8',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            Universal Engine
          </button>
          <button
            type="button"
            onClick={() => onSelectView('smart')}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              backgroundColor: view === 'smart' ? '#176CFF' : 'transparent',
              color: view === 'smart' ? '#FFF' : '#A8B7D8',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            100+ Tools & Chess
          </button>
        </div>
      </div>
    </header>
  );
}
