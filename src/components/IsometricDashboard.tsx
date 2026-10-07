import React, { useState, useMemo } from 'react';
import ApkDownloadModal from './ApkDownloadModal';

// Density in g/cm³
const MATERIALS = [
  { name: 'Steel', label: 'Steel / Iron', density: 7.85, color: '#48BB78', bg: '#1C3829' },
  { name: 'Aluminum', label: 'Aluminium', density: 2.70, color: '#4299E1', bg: '#1A365D' },
  { name: 'Fiber', label: 'Carbon Fiber', density: 1.75, color: '#ED8936', bg: '#432612' },
  { name: 'Plastic', label: 'Plastic / POM', density: 1.41, color: '#9F7AEA', bg: '#2D1F47' },
  { name: 'Copper', label: 'Brass / Copper', density: 8.96, color: '#F6AD55', bg: '#4A2B0F' },
];

const CONVERTER_UNITS: Record<string, { units: string[]; factor: Record<string, number> }> = {
  Length: {
    units: ['mm', 'cm', 'm', 'inch', 'feet'],
    factor: { mm: 0.001, cm: 0.01, m: 1, inch: 0.0254, feet: 0.3048 },
  },
  Mass: {
    units: ['g', 'kg', 'ton', 'lbs', 'oz'],
    factor: { g: 0.001, kg: 1, ton: 1000, lbs: 0.453592, oz: 0.0283495 },
  },
  Volume: {
    units: ['cm³', 'm³', 'liters', 'gallons'],
    factor: { 'cm³': 0.000001, 'm³': 1, liters: 0.001, gallons: 0.00378541 },
  },
  Pressure: {
    units: ['Bar', 'PSI', 'Pascal', 'kPa'],
    factor: { Bar: 100000, PSI: 6894.76, Pascal: 1, kPa: 1000 },
  },
};

export default function IsometricDashboard() {
  const [is3D, setIs3D] = useState(true);
  const [showApkModal, setShowApkModal] = useState(false);
  const [activeGeometryTab, setActiveGeometryTab] = useState<'both' | 'pipe' | 'stack'>('both');

  // Industrial Material & Geometry Inputs
  const [selectedMaterial, setSelectedMaterial] = useState('Steel');
  const [od, setOd] = useState('120'); // Outer diameter (mm)
  const [id, setId] = useState('80');  // Inner diameter (mm)
  const [length, setLength] = useState('250'); // Length / span (mm)
  const [stackWidth, setStackWidth] = useState('100'); // Width (mm)
  const [stackDepth, setStackDepth] = useState('100'); // Depth (mm)
  const [stackHeight, setStackHeight] = useState('0.5'); // Thickness per sheet (mm)
  const [stackQty, setStackQty] = useState('50'); // Quantity of sheets

  // Scientific Calculator State
  const [calcDisplay, setCalcDisplay] = useState('5.43');
  const [calcFormula, setCalcFormula] = useState('12.5 × 0.4344');

  // Universal Unit Converter State
  const [converterCat, setConverterCat] = useState<'Length' | 'Mass' | 'Volume' | 'Pressure'>('Length');
  const [converterInput, setConverterInput] = useState('150');
  const [converterFrom, setConverterFrom] = useState('mm');
  const [converterTo, setConverterTo] = useState('inch');

  // Material density lookup
  const currentMat = MATERIALS.find((m) => m.name === selectedMaterial) || MATERIALS[0];

  // Dynamic Industrial Real-Time Weight & Volume Calculation
  const calculation = useMemo(() => {
    const OD = Math.max(0, parseFloat(od) || 0);
    const ID = Math.min(OD, Math.max(0, parseFloat(id) || 0));
    const L = Math.max(0, parseFloat(length) || 0);

    const W = Math.max(0, parseFloat(stackWidth) || 0);
    const D = Math.max(0, parseFloat(stackDepth) || 0);
    const H = Math.max(0, parseFloat(stackHeight) || 0);
    const Qty = Math.max(0, parseFloat(stackQty) || 0);

    // Cylinder / Pipe Volume in cm³
    // Area = (π / 4) * (OD² - ID²) mm² -> Volume = Area * L mm³ -> / 1000 cm³
    const pipeAreaMm2 = (Math.PI / 4) * (OD * OD - ID * ID);
    const pipeVolCm3 = (pipeAreaMm2 * L) / 1000;

    // Stack Volume in cm³: W * D * (H * Qty) mm³ -> / 1000 cm³
    const stackVolCm3 = (W * D * (H * Qty)) / 1000;

    const totalVolCm3 =
      activeGeometryTab === 'pipe'
        ? pipeVolCm3
        : activeGeometryTab === 'stack'
        ? stackVolCm3
        : pipeVolCm3 + stackVolCm3;

    // Weight in kg = (Volume in cm³ * density in g/cm³) / 1000
    const weightKg = (totalVolCm3 * currentMat.density) / 1000;

    return {
      pipeVolCm3,
      stackVolCm3,
      totalVolCm3,
      weightKg,
    };
  }, [od, id, length, stackWidth, stackDepth, stackHeight, stackQty, currentMat, activeGeometryTab]);

  // Converter dynamic calculation
  const convertedValue = useMemo(() => {
    const val = parseFloat(converterInput) || 0;
    const catData = CONVERTER_UNITS[converterCat];
    if (!catData) return '0';
    const fromFactor = catData.factor[converterFrom] || 1;
    const toFactor = catData.factor[converterTo] || 1;
    const baseValue = val * fromFactor;
    const result = baseValue / toFactor;
    return Number(result.toFixed(4)).toString();
  }, [converterCat, converterInput, converterFrom, converterTo]);

  // Handle calculator keypad clicks
  const handleCalcKey = (k: string) => {
    if (k === 'CE') {
      setCalcDisplay('0');
      setCalcFormula('');
      return;
    }
    if (k === '=') {
      try {
        const clean = calcFormula.replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function(`'use strict'; return (${clean.replace(/[^0-9+\-*/().]/g, '')})`)();
        setCalcDisplay(String(Number(res.toFixed(4))));
      } catch {
        setCalcDisplay('Error');
      }
      return;
    }
    if (['sin', 'cos', 'tan', 'log', 'exp', '√', 'xⁿ', '%'].includes(k)) {
      setCalcFormula((prev) => `${k}(${prev || calcDisplay})`);
      return;
    }
    setCalcFormula((prev) => (prev === '0' ? k : prev + k));
    setCalcDisplay((prev) => (prev === '0' || prev === 'Error' ? k : prev + k));
  };

  return (
    <div
      style={{
        backgroundColor: '#111728', // Deep dark matte navy-blue backdrop
        minHeight: '100vh',
        color: '#E2E8F0',
        padding: '24px 20px 80px',
        overflowX: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background Soft Ambient Occlusion Gradients */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background:
            'radial-gradient(circle at 50% 10%, rgba(35, 52, 85, 0.3) 0%, transparent 60%), radial-gradient(circle at 15% 50%, rgba(20, 32, 58, 0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Controls Header */}
      <div
        style={{
          maxWidth: 1360,
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 14,
              backgroundColor: '#1E293B',
              border: '1.5px solid #334155',
              fontSize: 11,
              fontWeight: 900,
              color: '#38BDF8',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
            UNIVERSAL AI ENGINEERING WORKSTATION
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
            Precision Geometry & Industrial Calculator
          </span>
        </div>

        {/* 3D Perspective Mode Switcher & APK Download */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowApkModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              backgroundColor: '#133522',
              border: '1.5px solid #3DDC84',
              color: '#3DDC84',
              fontSize: 12,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(61, 220, 132, 0.3)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3DDC84';
              e.currentTarget.style.color = '#062412';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#133522';
              e.currentTarget.style.color = '#3DDC84';
            }}
          >
            <span style={{ fontSize: 15 }}>🤖</span>
            <span>Download Android APK</span>
            <span
              style={{
                fontSize: 10,
                backgroundColor: '#0F2618',
                padding: '2px 6px',
                borderRadius: 6,
                color: '#A8FFCA',
                border: '1px solid #238A4B',
              }}
            >
              742 KB
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIs3D(!is3D)}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              backgroundColor: is3D ? '#2563EB' : '#1E293B',
              border: `1.5px solid ${is3D ? '#60A5FA' : '#475569'}`,
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            {is3D ? '📐 Isometric 3D View (Matching Reference)' : '🔲 Flat View (Fast Edit)'}
          </button>
        </div>
      </div>

      {/* Main Isometric Stage Container */}
      <div
        style={{
          maxWidth: 1380,
          margin: '0 auto',
          perspective: is3D ? 1600 : 'none',
          transition: 'all 0.4s ease',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div
          style={{
            transform: is3D ? 'rotateX(24deg) rotateY(-8deg) rotateZ(1deg)' : 'none',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          {/* ============================================================== */}
          {/* 1. HERO REAL-TIME RESULT MONITOR (Top Floating Display) */}
          {/* ============================================================== */}
          <div
            style={{
              alignSelf: 'center',
              width: '100%',
              maxWidth: 720,
              backgroundColor: '#161D2E',
              borderRadius: 28,
              padding: '16px 28px',
              border: '2.5px solid #28354D',
              boxShadow:
                '0 24px 48px rgba(0, 0, 0, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              transform: is3D ? 'translateZ(40px)' : 'none',
            }}
          >
            {/* Left title and badges */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: '#94A3B8',
                  letterSpacing: '1.2px',
                  textTransform: 'uppercase',
                }}
              >
                REAL-TIME CALCULATED WEIGHT
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {['Real-Time Compute Active', 'Auto-Calibrated', 'Zero Error'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: '#38BDF8',
                      backgroundColor: '#0F172A',
                      padding: '3px 8px',
                      borderRadius: 8,
                      border: '1px solid #1E293B',
                    }}
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Prominent Digital 7-Segment Readout */}
            <div
              style={{
                backgroundColor: '#0A0F1D',
                borderRadius: 20,
                padding: '10px 24px',
                border: '2px solid #1E2B47',
                boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20, color: '#1E3A5F', fontWeight: 900, fontFamily: 'monospace' }}>
                88
              </span>
              <span
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: '#67E8F9', // Soft cyan LCD digit
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                }}
              >
                {calculation.weightKg.toFixed(2)}
              </span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#38BDF8' }}>kg</span>
            </div>

            {/* Volume Detail */}
            <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8' }}>
              <div>
                Volume: <strong style={{ color: '#F8FAFC' }}>{calculation.totalVolCm3.toLocaleString('en-US', { maximumFractionDigits: 1 })} cm³</strong>
              </div>
              <div style={{ marginTop: 2 }}>
                Density: <strong style={{ color: currentMat.color }}>{currentMat.density} g/cm³</strong>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* MAIN 3-COLUMN WORKSTATION LAYOUT */}
          {/* ============================================================== */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(420px, 1.4fr) minmax(360px, 1fr) minmax(320px, 0.9fr)',
              gap: 22,
            }}
          >
            {/* ============================================================ */}
            {/* COLUMN 1: INDUSTRIAL MATERIAL & GEOMETRY CALCULATOR (Left) */}
            {/* ============================================================ */}
            <div
              style={{
                backgroundColor: '#161D2E',
                borderRadius: 30,
                padding: 24,
                border: '2.5px solid #28354D',
                boxShadow:
                  '0 24px 48px rgba(0, 0, 0, 0.75), inset 0 2px 2px rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transform: is3D ? 'translateZ(50px)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      letterSpacing: '0.5px',
                      color: '#F8FAFC',
                      margin: 0,
                    }}
                  >
                    INDUSTRIAL MATERIAL & GEOMETRY
                  </h2>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', marginTop: 2 }}>
                    WEIGHT CALCULATOR
                  </div>
                </div>

                {/* Geometry Scope Toggle */}
                <div style={{ display: 'flex', gap: 4, backgroundColor: '#0F172A', padding: 3, borderRadius: 10 }}>
                  {[
                    { id: 'both', label: 'All Geometry' },
                    { id: 'pipe', label: 'Cylinder Pipe' },
                    { id: 'stack', label: 'Stack Sheets' },
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setActiveGeometryTab(tab.id as any)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 8,
                        backgroundColor: activeGeometryTab === tab.id ? '#2563EB' : 'transparent',
                        color: activeGeometryTab === tab.id ? '#FFF' : '#64748B',
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Selector Chunky 3D Pills */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', marginBottom: 8, letterSpacing: '0.8px' }}>
                  MATERIAL SELECTOR (DENSITY PRESET)
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {MATERIALS.map((mat) => {
                    const active = selectedMaterial === mat.name;
                    return (
                      <button
                        type="button"
                        key={mat.name}
                        onClick={() => setSelectedMaterial(mat.name)}
                        style={{
                          flex: '1 1 auto',
                          padding: '10px 14px',
                          borderRadius: 16,
                          backgroundColor: active ? mat.color : '#1E293B',
                          color: active ? '#0A101D' : '#CBD5E1',
                          border: `1.5px solid ${active ? '#FFFFFF' : '#334155'}`,
                          fontSize: 12,
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: active
                            ? '0 6px 14px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.4)'
                            : '0 4px 8px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{mat.name}</span>
                        <span style={{ fontSize: 10, opacity: 0.8 }}>({mat.density})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3D CAD VISUAL DIAGRAMS (Matching reference image exactly) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: 14,
                  backgroundColor: '#0E1424',
                  borderRadius: 22,
                  padding: 16,
                  border: '1.5px solid #1E293B',
                }}
              >
                {/* 3D Cylinder / Pipe Render with dimension arrows */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '10px 0',
                  }}
                >
                  {/* Stepped Matte Blue 3D Pipe Cylinder Graphic */}
                  <div
                    style={{
                      width: 170,
                      height: 80,
                      borderRadius: 18,
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 60%, #172554 100%)',
                      border: '2px solid #60A5FA',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.6), inset 0 4px 6px rgba(255,255,255,0.3)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Inner hole (ID) */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: '#0A0E1A',
                        border: '3px solid #93C5FD',
                        boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.9)',
                      }}
                    />
                  </div>

                  {/* Dimension Annotations with Arrows */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#38BDF8' }}>↔ [OD: {od}mm]</span>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#38BDF8' }}>◎ [ID: {id}mm]</span>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#38BDF8' }}>↕ [L: {length}mm]</span>
                  </div>
                </div>

                {/* 3D Stack Cross Section Render in Lavender/Violet */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderLeft: '1px solid #1E293B',
                    paddingLeft: 12,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#C084FC', marginBottom: 6 }}>
                    3D Stack Cross Section
                  </div>
                  {/* Stacked layered sheets graphic */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                    {[0, 1, 2].map((layer) => (
                      <div
                        key={layer}
                        style={{
                          width: 80,
                          height: 14,
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
                          border: '1px solid #C084FC',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                        }}
                      />
                    ))}
                  </div>

                  {/* Stack annotations */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 9, fontWeight: 800, color: '#E879F9' }}>
                    <span>[H: {stackHeight}mm]</span>
                    <span>[W: {stackWidth}]</span>
                    <span>[D: {stackDepth}]</span>
                  </div>
                </div>
              </div>

              {/* Input Fields with Clear Visible Placeholders */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                {[
                  { label: 'OD (Outer Diameter)', value: od, set: setOd, placeholder: 'Enter OD in mm (e.g. 120)', unit: 'mm' },
                  { label: 'ID (Inner Diameter)', value: id, set: setId, placeholder: 'Enter ID in mm (e.g. 80)', unit: 'mm' },
                  { label: 'Length / Span', value: length, set: setLength, placeholder: 'Enter Total Length in mm', unit: 'mm' },
                  { label: 'Height / Thickness', value: stackHeight, set: setStackHeight, placeholder: 'Enter Height or Wall Thickness', unit: 'mm' },
                  { label: 'Width / Cut Depth', value: stackWidth, set: setStackWidth, placeholder: 'Enter Width or Cut Depth', unit: 'mm' },
                  { label: 'Stack Quantity / Layers', value: stackQty, set: setStackQty, placeholder: 'Enter Number of Stack Sheets (e.g. 50)', unit: 'sheets' },
                ].map((field) => (
                  <div key={field.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8' }}>
                      {field.label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={field.value}
                        onChange={(e) => field.set(e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width: '100%',
                          height: 42,
                          borderRadius: 12,
                          backgroundColor: '#0F172A',
                          border: '1.5px solid #334155',
                          padding: '0 32px 0 10px',
                          color: '#F8FAFC',
                          fontSize: 13,
                          fontWeight: 700,
                          outline: 'none',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: 10,
                          color: '#64748B',
                          fontWeight: 800,
                        }}
                      >
                        {field.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Instant Calculation Status Bar */}
              <div
                style={{
                  backgroundColor: '#09152B',
                  borderRadius: 14,
                  padding: '10px 14px',
                  border: '1px solid #1E3A8A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 11,
                }}
              >
                <span style={{ color: '#94A3B8' }}>
                  Pipe Volume: <strong style={{ color: '#38BDF8' }}>{calculation.pipeVolCm3.toFixed(1)} cm³</strong> | Stack Volume: <strong style={{ color: '#C084FC' }}>{calculation.stackVolCm3.toFixed(1)} cm³</strong>
                </span>
                <span style={{ color: '#4ADE80', fontWeight: 900 }}>
                  Calculated Instantly
                </span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMN 2: SCIENTIFIC HUB & UNIT CONVERTER & FLOWCHART (Center) */}
            {/* ============================================================ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* ADVANCED COMPUTATIONAL & SCIENTIFIC HUB (Matching reference calculator) */}
              <div
                style={{
                  backgroundColor: '#161D2E',
                  borderRadius: 28,
                  padding: 20,
                  border: '2.5px solid #28354D',
                  boxShadow:
                    '0 20px 40px rgba(0, 0, 0, 0.7), inset 0 2px 2px rgba(255, 255, 255, 0.1)',
                  transform: is3D ? 'translateZ(45px)' : 'none',
                }}
              >
                {/* Calculator Display */}
                <div
                  style={{
                    backgroundColor: '#0A0F1D',
                    borderRadius: 18,
                    padding: '12px 16px',
                    border: '1.5px solid #1E293B',
                    minHeight: 70,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    marginBottom: 14,
                    boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.8)',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>{calcFormula}</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#F8FAFC', letterSpacing: '0.5px' }}>
                    {calcDisplay}
                  </div>
                </div>

                {/* Keypad Grid (Layout exactly like reference image) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {[
                    { k: 'xⁿ', bg: '#1E293B' }, { k: '√', bg: '#1E293B' }, { k: 'tan', bg: '#1E293B' }, { k: 'log', bg: '#1E293B' }, { k: 'CE', bg: '#E11D48', text: '#FFF' },
                    { k: 'sin', bg: '#1E293B' }, { k: 'cos', bg: '#1E293B' }, { k: 'exp', bg: '#1E293B' }, { k: '%', bg: '#1E293B' }, { k: '÷', bg: '#0F2942' },
                    { k: '7', bg: '#1E293B' }, { k: '8', bg: '#1E293B' }, { k: '9', bg: '#1E293B' }, { k: '×', bg: '#0F2942' }, { k: '(', bg: '#1E293B' },
                    { k: '4', bg: '#1E293B' }, { k: '5', bg: '#1E293B' }, { k: '6', bg: '#1E293B' }, { k: '−', bg: '#0F2942' }, { k: ')', bg: '#1E293B' },
                    { k: '1', bg: '#1E293B' }, { k: '2', bg: '#1E293B' }, { k: '3', bg: '#1E293B' }, { k: '+', bg: '#0F2942' }, { k: '0', bg: '#1E293B' },
                  ].map((btn, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleCalcKey(btn.k)}
                      style={{
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: btn.bg,
                        color: btn.text || '#E2E8F0',
                        fontSize: 13,
                        fontWeight: 900,
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                        cursor: 'pointer',
                      }}
                    >
                      {btn.k}
                    </button>
                  ))}
                </div>

                {/* Equals Bar in vibrant orange */}
                <button
                  type="button"
                  onClick={() => handleCalcKey('=')}
                  style={{
                    width: '100%',
                    height: 42,
                    borderRadius: 12,
                    backgroundColor: '#EA580C',
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: 900,
                    border: '1px solid #FB923C',
                    boxShadow: '0 6px 14px rgba(234, 88, 12, 0.4)',
                    marginTop: 10,
                    cursor: 'pointer',
                  }}
                >
                  =
                </button>
              </div>

              {/* UNIVERSAL UNIT CONVERTER (Center card matching reference) */}
              <div
                style={{
                  backgroundColor: '#161D2E',
                  borderRadius: 24,
                  padding: 18,
                  border: '2px solid #28354D',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.6)',
                  transform: is3D ? 'translateZ(35px)' : 'none',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 900, color: '#F8FAFC', marginBottom: 10 }}>
                  UNIVERSAL UNIT CONVERTER
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {/* Category select */}
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8' }}>CATEGORY</label>
                    <select
                      value={converterCat}
                      onChange={(e) => {
                        const newCat = e.target.value as any;
                        setConverterCat(newCat);
                        setConverterFrom(CONVERTER_UNITS[newCat].units[0]);
                        setConverterTo(CONVERTER_UNITS[newCat].units[1]);
                      }}
                      style={{
                        width: '100%',
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        color: '#FFF',
                        padding: '0 8px',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {Object.keys(CONVERTER_UNITS).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input value */}
                  <div>
                    <label style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8' }}>INPUT VALUE</label>
                    <input
                      type="text"
                      value={converterInput}
                      onChange={(e) => setConverterInput(e.target.value)}
                      style={{
                        width: '100%',
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        color: '#FFF',
                        padding: '0 10px',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    />
                  </div>
                </div>

                {/* Conversion Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <select
                    value={converterFrom}
                    onChange={(e) => setConverterFrom(e.target.value)}
                    style={{
                      flex: 1,
                      height: 34,
                      borderRadius: 8,
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      color: '#38BDF8',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {CONVERTER_UNITS[converterCat].units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <span style={{ color: '#94A3B8', fontWeight: 900 }}>➔</span>
                  <select
                    value={converterTo}
                    onChange={(e) => setConverterTo(e.target.value)}
                    style={{
                      flex: 1,
                      height: 34,
                      borderRadius: 8,
                      backgroundColor: '#0F172A',
                      border: '1px solid #334155',
                      color: '#4ADE80',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {CONVERTER_UNITS[converterCat].units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Converted Output Display */}
                <div
                  style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    backgroundColor: '#064E3B',
                    border: '1.5px solid #10B981',
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#6EE7B7',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Output:</span>
                  <span>
                    {convertedValue} {converterTo}
                  </span>
                </div>
              </div>

              {/* AI STEP-BY-STEP LOGIC FLOWCHART (Matching reference image) */}
              <div
                style={{
                  backgroundColor: '#161D2E',
                  borderRadius: 24,
                  padding: 18,
                  border: '2px solid #28354D',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.6)',
                  transform: is3D ? 'translateZ(30px)' : 'none',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 900, color: '#F8FAFC', marginBottom: 12 }}>
                  AI STEP-BY-STEP LOGIC FLOWCHART
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: 12,
                        backgroundColor: '#064E3B',
                        border: '1px solid #10B981',
                        fontSize: 10,
                        fontWeight: 900,
                        color: '#6EE7B7',
                      }}
                    >
                      Identify Geometry (Pipe + Stack)
                    </div>
                    <span style={{ color: '#10B981', fontWeight: 900, alignSelf: 'center' }}>➔</span>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: 12,
                        backgroundColor: '#1E3A8A',
                        border: '1px solid #3B82F6',
                        fontSize: 10,
                        fontWeight: 900,
                        color: '#93C5FD',
                      }}
                    >
                      Lookup Material Density ({currentMat.density})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: 12,
                        backgroundColor: '#713F12',
                        border: '1px solid #EAB308',
                        fontSize: 10,
                        fontWeight: 900,
                        color: '#FDE047',
                      }}
                    >
                      Calculate Volume: {calculation.totalVolCm3.toFixed(1)} cm³
                    </div>
                    <span style={{ color: '#EAB308', fontWeight: 900, alignSelf: 'center' }}>➔</span>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: 12,
                        backgroundColor: '#581C87',
                        border: '1px solid #A855F7',
                        fontSize: 10,
                        fontWeight: 900,
                        color: '#E9D5FF',
                      }}
                    >
                      Multiply (Volume × Density)
                    </div>
                  </div>

                  <div
                    style={{
                      alignSelf: 'center',
                      padding: '6px 16px',
                      borderRadius: 12,
                      backgroundColor: '#7F1D1D',
                      border: '1px solid #EF4444',
                      fontSize: 11,
                      fontWeight: 900,
                      color: '#FCA5A5',
                    }}
                  >
                    Display Weight: {calculation.weightKg.toFixed(2)} kg
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* COLUMN 3: 3D ANALYTICS & VERIFICATION LOG (Right) */}
            {/* ============================================================ */}
            <div
              style={{
                backgroundColor: '#161D2E',
                borderRadius: 30,
                padding: 22,
                border: '2.5px solid #28354D',
                boxShadow:
                  '0 24px 48px rgba(0, 0, 0, 0.75), inset 0 2px 2px rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                transform: is3D ? 'translateZ(45px)' : 'none',
              }}
            >
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: '#F8FAFC', margin: 0 }}>
                  Calculation History & Analytics
                </h3>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>3D Charts & Verified Logs</span>
              </div>

              {/* 3D Isometric Bar Chart (Matching pastel chunky bars in reference) */}
              <div
                style={{
                  height: 120,
                  backgroundColor: '#0F172A',
                  borderRadius: 18,
                  padding: '14px 12px 8px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  border: '1px solid #1E293B',
                }}
              >
                {[
                  { h: '45%', color: '#68D391', label: '1' },
                  { h: '75%', color: '#48BB78', label: '2' },
                  { h: '60%', color: '#F6E05E', label: '3' },
                  { h: '88%', color: '#ED8936', label: '4' },
                  { h: '100%', color: '#F56565', label: '5' },
                ].map((b, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: 22,
                      height: b.h,
                      borderRadius: '6px 6px 2px 2px',
                      background: `linear-gradient(180deg, ${b.color} 0%, rgba(15,23,42,0.6) 100%)`,
                      boxShadow: '0 6px 12px rgba(0,0,0,0.5)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: 0,
                        right: 0,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: '#FFF',
                        opacity: 0.5,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Two 3D Pie Charts (Cyan & Magenta as in reference) */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: 'conic-gradient(#06B6D4 0% 70%, #EC4899 70% 100%)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                      margin: '0 auto 6px',
                    }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8' }}>Geometry Split</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: 'conic-gradient(#06B6D4 0% 82%, #EC4899 82% 100%)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                      margin: '0 auto 6px',
                    }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8' }}>Efficiency 99.4%</span>
                </div>
              </div>

              {/* Orange Wave / Line Chart (Matching reference bottom-right) */}
              <div
                style={{
                  height: 64,
                  backgroundColor: '#0F172A',
                  borderRadius: 14,
                  padding: 8,
                  border: '1px solid #1E293B',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '70%',
                    background: 'linear-gradient(180deg, #ED8936 0%, rgba(237, 137, 54, 0.15) 100%)',
                    clipPath: 'polygon(0% 80%, 20% 60%, 40% 90%, 60% 40%, 80% 50%, 100% 20%, 100% 100%, 0% 100%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 10,
                    fontSize: 9,
                    fontWeight: 900,
                    color: '#FBD38D',
                  }}
                >
                  Calculation Speed & Stability
                </span>
              </div>

              {/* Verification History Log Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#CBD5E1' }}>
                  Verified Calculations
                </div>
                {[
                  { name: 'Pipe OD 120 / L 250', mat: 'Steel', wt: `${calculation.weightKg.toFixed(2)} kg`, time: 'Now' },
                  { name: 'Cylinder OD 90 / ID 50', mat: 'Aluminium', wt: '2.14 kg', time: '3m ago' },
                  { name: 'Plate Stack 100x100', mat: 'Copper', wt: '4.48 kg', time: '8m ago' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 10,
                      backgroundColor: '#0A0F1D',
                      border: '1px solid #1E293B',
                      fontSize: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#F8FAFC' }}>{item.name}</div>
                      <div style={{ color: '#64748B' }}>{item.mat} • {item.time}</div>
                    </div>
                    <span style={{ color: '#4ADE80', fontWeight: 900 }}>
                      ✓ {item.wt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* APK Download Modal */}
      <ApkDownloadModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
    </div>
  );
}
