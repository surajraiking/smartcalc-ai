import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyUpdated?: (hasKey: boolean) => void;
}

export default function SettingsModal({ isOpen, onClose, onApiKeyUpdated }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('GEMINI_API_KEY') || '';
      setApiKey(stored);
      if (stored) {
        setValidationStatus('valid');
        setValidationMessage('Key currently saved in local storage.');
      } else {
        setValidationStatus('idle');
        setValidationMessage('');
      }
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setValidationStatus('invalid');
      setValidationMessage('Please enter an API key to test.');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');
    setValidationMessage('');

    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setValidationStatus('valid');
        setValidationMessage('✓ Valid API Key! Successfully verified with Gemini.');
      } else {
        setValidationStatus('invalid');
        setValidationMessage(data.error || 'API key is not valid. Please check and try again.');
      }
    } catch {
      setValidationStatus('invalid');
      setValidationMessage('Connection error while validating key.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      localStorage.setItem('GEMINI_API_KEY', trimmed);
      onApiKeyUpdated?.(true);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
      onApiKeyUpdated?.(false);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleRemove = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    setValidationStatus('idle');
    setValidationMessage('API Key removed. App is running in 100% Free Built-in Mode.');
    onApiKeyUpdated?.(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 9, 24, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          backgroundColor: '#0A173B',
          borderRadius: 20,
          border: '1.5px solid #2A4888',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(45, 124, 255, 0.25)',
          padding: 28,
          color: '#FFFFFF',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: '#16285A',
            border: '1px solid #335499',
            color: '#A8B7D8',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: '#132B66',
              border: '1.5px solid #3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            ⚙️
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: '#FFFFFF' }}>
              Engine Settings & API Key
            </h2>
            <p style={{ margin: '3px 0 0 0', color: '#8EA7DA', fontSize: 13 }}>
              Configure your computation engine or use your personal free Gemini key
            </p>
          </div>
        </div>

        {/* Free Offline Engine Mode Banner */}
        <div
          style={{
            backgroundColor: '#0A2518',
            border: '1.5px solid #107C41',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22 }}>🛡️</span>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: '#B3F0D0' }}>
            <strong style={{ color: '#3DDC84', display: 'block', marginBottom: 2 }}>
              100% Free & No Paid Subscription Required
            </strong>
            SmartCalc AI includes a built-in zero-error precision mathematics engine, geometry solver, unit converter, and 100+ tools that work completely free without any paid API keys or external charges.
          </div>
        </div>

        {/* Custom API Key Section */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 6 }}>
            Personal Gemini API Key (Optional)
          </label>
          <p style={{ margin: '0 0 10px 0', fontSize: 12, color: '#7E9CD4' }}>
            If you have a free API key from Google AI Studio, you can paste it below to enable live search grounding and real-time Gemini generation. It is saved only to your local browser storage.
          </p>

          <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setValidationStatus('idle');
                setValidationMessage('');
              }}
              placeholder="AIzaSy..."
              style={{
                flex: 1,
                backgroundColor: '#071333',
                border: `1.5px solid ${
                  validationStatus === 'valid'
                    ? '#10B981'
                    : validationStatus === 'invalid'
                    ? '#EF4444'
                    : '#20458C'
                }`,
                borderRadius: 10,
                padding: '10px 14px',
                color: '#FFFFFF',
                fontSize: 13,
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                backgroundColor: '#122557',
                border: '1px solid #2B4E99',
                borderRadius: 10,
                padding: '0 12px',
                color: '#93B3F2',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isValidating || !apiKey.trim()}
              style={{
                backgroundColor: isValidating ? '#1B2E5E' : '#2563EB',
                border: 'none',
                borderRadius: 10,
                padding: '0 16px',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 800,
                cursor: isValidating || !apiKey.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {isValidating ? 'Testing...' : 'Test Key'}
            </button>
          </div>

          {validationMessage && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: validationStatus === 'valid' ? '#34D399' : '#F87171',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{validationStatus === 'valid' ? '✓' : '⚠️'}</span>
              <span>{validationMessage}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 14, borderTop: '1px solid #1A3673' }}>
          <div>
            {apiKey && (
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #EF4444',
                  color: '#F87171',
                  borderRadius: 8,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Remove Saved Key
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#122557',
                border: '1px solid #2B4E99',
                borderRadius: 10,
                padding: '10px 18px',
                color: '#CBD5E1',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                backgroundColor: saveSuccess ? '#059669' : '#3DDC84',
                color: '#062412',
                border: 'none',
                borderRadius: 10,
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {saveSuccess ? '✓ Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
