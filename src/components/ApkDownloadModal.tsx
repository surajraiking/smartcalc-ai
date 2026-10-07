import React, { useState } from 'react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApkDownloadModal({ isOpen, onClose }: ApkDownloadModalProps) {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  if (!isOpen) return null;

  const sha256 = '0415fa0456e23b7d1efc98482eb232d70a9d544607c047b9d63222e60f6430cf';
  const downloadUrl = '/smartcalc-ai.apk';

  const handleDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'smartcalc-ai.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyChecksum = () => {
    navigator.clipboard.writeText(sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
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
        zIndex: 1000,
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
          maxWidth: 620,
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

        {/* Header with Android Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: '#132B66',
              border: '2px solid #3DDC84',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              boxShadow: '0 8px 24px rgba(61, 220, 132, 0.3)',
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                SmartCalc AI Android APK
              </h2>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  backgroundColor: '#0F4426',
                  color: '#3DDC84',
                  border: '1px solid #3DDC84',
                  padding: '2px 8px',
                  borderRadius: 10,
                }}
              >
                v1.0.0
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#9BB1DD', fontSize: 13 }}>
              Native Android package • 100% Offline Enabled • Universal APK
            </p>
          </div>
        </div>

        {/* Download Callout Card */}
        <div
          style={{
            backgroundColor: '#0E1F4F',
            border: '1.5px solid #20458C',
            borderRadius: 16,
            padding: 18,
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                smartcalc-ai.apk
              </div>
              <div style={{ fontSize: 12, color: '#7E9CD4', marginTop: 2 }}>
                Size: <strong style={{ color: '#62E9FF' }}>742 KB</strong> • Android 5.0 to 15+ • ARM64 / x86
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              style={{
                backgroundColor: '#3DDC84',
                color: '#062412',
                fontWeight: 900,
                fontSize: 14,
                padding: '12px 24px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 6px 20px rgba(61, 220, 132, 0.4)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>📥</span>
              <span>Download APK Now</span>
            </button>
          </div>

          {downloadStarted && (
            <div
              style={{
                backgroundColor: '#0F3826',
                border: '1px solid #107C41',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                color: '#6EEDB0',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>✓</span>
              <span>Download started! Check your browser's download manager.</span>
            </div>
          )}
        </div>

        {/* Step-by-Step Installation Guide */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#62E9FF', marginBottom: 12 }}>
            📋 How to Install on Any Android Device:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                step: '1',
                title: 'Download the APK',
                desc: 'Tap "Download APK Now". The file `smartcalc-ai.apk` will save in your device Downloads folder.',
              },
              {
                step: '2',
                title: 'Tap the Download Notification or File',
                desc: 'Swipe down your Android notification panel and tap `smartcalc-ai.apk` once complete.',
              },
              {
                step: '3',
                title: 'Allow Installation from Unknown Sources',
                desc: 'If Android displays "For your security, your phone is not allowed to install unknown apps", tap "Settings" and enable "Allow from this source".',
              },
              {
                step: '4',
                title: 'Tap Install & Launch',
                desc: 'Press "Install". Once finished, launch "SmartCalc AI" directly from your home screen or app drawer with instant full offline calculation!',
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  backgroundColor: '#0C1A42',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid #1E376E',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#1E40AF',
                    color: '#60A5FA',
                    fontSize: 12,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#E2E8F0' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#93A8D2', marginTop: 2, lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification & Security Specs */}
        <div
          style={{
            backgroundColor: '#08122D',
            padding: 14,
            borderRadius: 12,
            border: '1px solid #162B5A',
            fontSize: 11,
            color: '#8CA3CF',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Package Name:</span>
            <strong style={{ color: '#FFFFFF' }}>com.smartcalc.ai</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>Signatures:</span>
            <strong style={{ color: '#3DDC84' }}>V1 (JAR) + V2 (APK v2) + V3 (APK v3) Verified</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>SHA-256 Checksum:</span>
            <button
              type="button"
              onClick={copyChecksum}
              style={{
                background: 'none',
                border: 'none',
                color: '#62E9FF',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                textDecoration: 'underline',
              }}
            >
              {copiedSha ? 'Copied ✓' : 'Copy Hash'}
            </button>
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              color: '#62E9FF',
              backgroundColor: '#04091A',
              padding: '4px 8px',
              borderRadius: 6,
              marginTop: 4,
              wordBreak: 'break-all',
            }}
          >
            {sha256}
          </div>
        </div>
      </div>
    </div>
  );
}
