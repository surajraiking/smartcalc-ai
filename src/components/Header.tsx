import React, { useState } from 'react';
import ApkDownloadModal from './ApkDownloadModal';
import SettingsModal from './SettingsModal';

export default function Header({
  view,
  onSelectView,
}: {
  view: 'isometric' | 'chat' | 'universal' | 'smart';
  onSelectView: (v: 'isometric' | 'chat' | 'universal' | 'smart') => void;
}) {
  const [showApkModal, setShowApkModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
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
            maxWidth: 1300,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
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

          {/* Right Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* View Switcher */}
            <div style={{ display: 'flex', gap: 6, backgroundColor: '#0F214D', padding: 4, borderRadius: 14 }}>
              <button
                type="button"
                onClick={() => onSelectView('isometric')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  backgroundColor: view === 'isometric' ? '#FF6B00' : 'transparent',
                  color: view === 'isometric' ? '#FFF' : '#A8B7D8',
                  fontSize: 11,
                  fontWeight: 900,
                  boxShadow: view === 'isometric' ? '0 4px 12px rgba(255, 107, 0, 0.4)' : 'none',
                }}
              >
                📐 3D Workstation
              </button>
              <button
                type="button"
                onClick={() => onSelectView('chat')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  backgroundColor: view === 'chat' ? '#2563EB' : 'transparent',
                  color: view === 'chat' ? '#FFF' : '#60A5FA',
                  fontSize: 11,
                  fontWeight: 900,
                  boxShadow: view === 'chat' ? '0 4px 12px rgba(37, 99, 235, 0.4)' : 'none',
                  border: '1px solid #3B82F6',
                }}
              >
                🌐 Gemini AI & Search
              </button>
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

            {/* Android APK Download Action Button */}
            <button
              type="button"
              onClick={() => setShowApkModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                backgroundColor: '#133522',
                color: '#3DDC84',
                border: '1.5px solid #3DDC84',
                padding: '6px 14px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(61, 220, 132, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3DDC84';
                e.currentTarget.style.color = '#052112';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#133522';
                e.currentTarget.style.color = '#3DDC84';
              }}
            >
              <span style={{ fontSize: 14 }}>🤖</span>
              <span>Download APK</span>
              <span
                style={{
                  fontSize: 9,
                  backgroundColor: '#0F2618',
                  padding: '1px 5px',
                  borderRadius: 6,
                  color: '#A8FFCA',
                  border: '1px solid #238A4B',
                }}
              >
                742 KB
              </span>
            </button>

            {/* Engine Settings Modal Action Button */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              title="Engine Settings & Optional API Key"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#122557',
                color: '#8EB5FF',
                border: '1.5px solid #2B4E99',
                padding: '6px 12px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1B3782';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#122557';
                e.currentTarget.style.color = '#8EB5FF';
              }}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* APK Modal */}
      <ApkDownloadModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />

      {/* Engine & API Key Settings Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
}
