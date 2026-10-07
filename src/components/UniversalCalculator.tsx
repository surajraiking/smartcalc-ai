import React, { useEffect, useMemo, useState } from 'react';
import SalesPanel from './SalesPanel';

type Mode = 'smart' | 'convert' | 'motor' | 'sales' | 'tools';
type Result = { title: string; value: string; formula?: string; detail?: string };

const UNIT: Record<string, { base: string; factor: number }> = {
  mg: { base: 'g', factor: 0.001 },
  g: { base: 'g', factor: 1 },
  kg: { base: 'g', factor: 1000 },
  tonne: { base: 'g', factor: 1e6 },
  ton: { base: 'g', factor: 1e6 },
  quintal: { base: 'g', factor: 100000 },
  oz: { base: 'g', factor: 28.349523125 },
  lb: { base: 'g', factor: 453.59237 },
  mm: { base: 'm', factor: 0.001 },
  cm: { base: 'm', factor: 0.01 },
  m: { base: 'm', factor: 1 },
  km: { base: 'm', factor: 1000 },
  inch: { base: 'm', factor: 0.0254 },
  in: { base: 'm', factor: 0.0254 },
  ft: { base: 'm', factor: 0.3048 },
  feet: { base: 'm', factor: 0.3048 },
  yard: { base: 'm', factor: 0.9144 },
  yd: { base: 'm', factor: 0.9144 },
  mile: { base: 'm', factor: 1609.344 },
  ml: { base: 'l', factor: 0.001 },
  millilitre: { base: 'l', factor: 0.001 },
  l: { base: 'l', factor: 1 },
  litre: { base: 'l', factor: 1 },
  liter: { base: 'l', factor: 1 },
  gallon: { base: 'l', factor: 3.785411784 },
  c: { base: 'temp', factor: 1 },
  f: { base: 'temp', factor: 1 },
  k: { base: 'temp', factor: 1 },
  sec: { base: 's', factor: 1 },
  second: { base: 's', factor: 1 },
  min: { base: 's', factor: 60 },
  minute: { base: 's', factor: 60 },
  hour: { base: 's', factor: 3600 },
  day: { base: 's', factor: 86400 },
  kmh: { base: 'kmh', factor: 1 },
  mph: { base: 'kmh', factor: 1.609344 },
  mps: { base: 'kmh', factor: 3.6 },
  pa: { base: 'pa', factor: 1 },
  kpa: { base: 'pa', factor: 1000 },
  bar: { base: 'pa', factor: 100000 },
  psi: { base: 'pa', factor: 6894.757293168 },
  atm: { base: 'pa', factor: 101325 },
  w: { base: 'w', factor: 1 },
  kw: { base: 'w', factor: 1000 },
  mw: { base: 'w', factor: 1e6 },
  hp: { base: 'w', factor: 745.699871582 },
  j: { base: 'j', factor: 1 },
  kj: { base: 'j', factor: 1000 },
  wh: { base: 'j', factor: 3600 },
  kwh: { base: 'j', factor: 3600000 },
  kcal: { base: 'j', factor: 4184 },
};

const CURRENCIES = [
  'INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'JPY', 'CNY', 'CAD', 'AUD',
  'CHF', 'SGD', 'HKD', 'NZD', 'ZAR', 'BRL', 'MXN', 'KRW', 'THB', 'MYR',
  'IDR', 'TRY', 'NOK', 'SEK', 'DKK', 'RUB',
];

const UNIT_GROUPS: Record<string, string[]> = {
  Mass: ['mg', 'g', 'kg', 'tonne', 'quintal', 'oz', 'lb'],
  Length: ['mm', 'cm', 'm', 'km', 'inch', 'ft', 'yard', 'mile'],
  Volume: ['ml', 'l', 'gallon'],
  Temperature: ['c', 'f', 'k'],
  Time: ['sec', 'min', 'hour', 'day'],
  Speed: ['kmh', 'mph', 'mps'],
  Pressure: ['pa', 'kpa', 'bar', 'psi', 'atm'],
  Power: ['w', 'kw', 'mw', 'hp'],
  Energy: ['j', 'kj', 'wh', 'kwh', 'kcal'],
};

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ flex: '1 1 120px', minWidth: 90 }}>
      <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          height: 48,
          borderRadius: 13,
          backgroundColor: '#FFF',
          border: '1px solid #CFE0F8',
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#142449',
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{value}</span>
        <span style={{ color: '#287BFF', marginLeft: 4 }}>▾</span>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(6, 18, 47, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              maxHeight: '75vh',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 16,
              border: '2px solid #71E8FF',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#142449', marginBottom: 12 }}>
              {label} चुनें
            </h3>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {options.map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  style={{
                    padding: 14,
                    borderRadius: 13,
                    backgroundColor: o === value ? '#DDF7FF' : '#F0F5FF',
                    border: '1px solid',
                    borderColor: o === value ? '#36B9ED' : '#DFE8F8',
                    textAlign: 'left',
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#142449',
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 10,
                height: 46,
                borderRadius: 14,
                backgroundColor: '#176CFF',
                color: '#FFF',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const n = (x: string) => {
  const v = Number(String(x).replace(/,/g, ''));
  return Number.isFinite(v) ? v : 0;
};
const f = (x: number) =>
  Number.isFinite(x) ? x.toLocaleString('en-IN', { maximumFractionDigits: 10 }) : 'Error';
const clean = (s: string) => s.toLowerCase().replace(/,/g, '').replace(/×/g, '*').replace(/÷/g, '/');

function arithmetic(s: string): number | null {
  const x = clean(s).replace(/\s+/g, '');
  if (!x || !/^[0-9+\-*/().%]+$/.test(x)) return null;
  const toks = x.match(/\d*\.?\d+|[()+\-*/%]/g);
  if (!toks) return null;
  const vals: number[] = [];
  const ops: string[] = [];
  const p: any = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
  const apply = () => {
    const op = ops.pop(),
      b = vals.pop(),
      a = vals.pop();
    if (op == null || a == null || b == null) throw 0;
    if (op === '+') vals.push(a + b);
    else if (op === '-') vals.push(a - b);
    else if (op === '*') vals.push(a * b);
    else if (op === '/') {
      if (b === 0) throw 0;
      vals.push(a / b);
    } else vals.push(a % b);
  };
  try {
    let prev = 'o';
    for (const t of toks) {
      if (/^\d/.test(t)) {
        vals.push(Number(t));
        prev = 'n';
      } else if (t === '(') {
        ops.push(t);
        prev = 'o';
      } else if (t === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') apply();
        if (ops.pop() !== '(') return null;
        prev = 'n';
      } else {
        if (t === '-' && prev === 'o') vals.push(0);
        while (ops.length && ops[ops.length - 1] !== '(' && p[ops[ops.length - 1]] >= p[t]) apply();
        ops.push(t);
        prev = 'o';
      }
    }
    while (ops.length) apply();
    return vals.length === 1 && Number.isFinite(vals[0]) ? vals[0] : null;
  } catch {
    return null;
  }
}

function natural(q: string): Result | null {
  const s = q.trim().toLowerCase();
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*([a-z²³]+)\s*(?:to|in|into|में|me|ko)\s*([a-z²³]+)/i);
  if (m) {
    const a = n(m[1]),
      u1 = m[2].replace('²', '2').replace('³', '3'),
      u2 = m[3].replace('²', '2').replace('³', '3');
    if (u1 === 'c' || u1 === 'f' || u1 === 'k') {
      if (u2 === 'c' || u2 === 'f' || u2 === 'k') {
        let c = u1 === 'c' ? a : u1 === 'f' ? ((a - 32) * 5) / 9 : a - 273.15;
        let out = u2 === 'c' ? c : u2 === 'f' ? (c * 9) / 5 + 32 : c + 273.15;
        return {
          title: 'Temperature conversion',
          value: f(out) + ' ' + u2,
          formula: u1.toUpperCase() + ' → ' + u2.toUpperCase(),
        };
      }
    }
    const x = UNIT[u1],
      y = UNIT[u2];
    if (x && y && x.base === y.base)
      return {
        title: 'Unit conversion',
        value: f((a * x.factor) / y.factor) + ' ' + u2,
        formula: a + ' ' + u1 + ' × ' + x.factor + '/' + y.factor,
      };
  }
  const gst = s.match(/(?:gst|tax)\s*(?:on)?\s*₹?\s*([\d,.]+)\s*(?:at|@|of)?\s*(\d+(?:\.\d+)?)\s*%/);
  if (gst) {
    const a = n(gst[1]),
      r = n(gst[2]),
      tax = (a * r) / 100;
    return {
      title: 'GST calculation',
      value: '₹' + f(a + tax),
      formula: 'GST = ₹' + f(tax) + ' | Rate = ' + r + '%',
      detail: 'Base ₹' + f(a) + ' + GST ₹' + f(tax),
    };
  }
  const pctMatch = s.match(/(?:what is|calculate)?\s*(\d+(?:\.\d+)?)\s*%\s*(?:of|का|ka)\s*([\d,.]+)/);
  if (pctMatch) {
    const r = n(pctMatch[1]),
      a = n(pctMatch[2]);
    return { title: 'Percentage', value: f((a * r) / 100), formula: r + '% of ' + f(a) };
  }
  const motors = s.match(/(\d[\d,]*)\s*(?:motor|motors|मोटर).*?(\d+(?:\.\d+)?)\s*kg/);
  if (motors) {
    const qCount = n(motors[1]),
      kg = n(motors[2]);
    return {
      title: 'Motor material requirement',
      value: f(qCount * kg) + ' kg',
      formula: qCount + ' motors × ' + kg + ' kg/motor',
      detail: 'Equivalent ' + f((qCount * kg) / 1000) + ' tonne',
    };
  }
  const boxes = s.match(/(\d[\d,]*)\s*(?:motor|motors).*?(?:4|four)\s*(?:per|in|के|ke).*?box/);
  if (boxes) {
    const qCount = n(boxes[1]);
    return {
      title: 'Packing',
      value: f(Math.ceil(qCount / 4)) + ' boxes',
      formula: 'CEILING(' + qCount + ' ÷ 4)',
    };
  }
  const rejection = s.match(/(\d[\d,]*)\s*(?:motor|motors).*?(\d+(?:\.\d+)?)\s*%\s*(?:reject|rejection)/);
  if (rejection) {
    const qCount = n(rejection[1]),
      r = n(rejection[2]);
    return {
      title: 'Production rejection',
      value: f((qCount * r) / 100) + ' rejected | ' + f(qCount * (1 - r / 100)) + ' good',
      formula: qCount + ' × ' + r + '%',
    };
  }
  const e = arithmetic(s);
  if (e !== null) return { title: 'Instant calculation', value: f(e), formula: q };
  return null;
}

function convert(value: string, from: string, to: string): Result | null {
  const a = n(value),
    u = from.toLowerCase(),
    v = to.toLowerCase();
  if (['c', 'f', 'k'].includes(u) && ['c', 'f', 'k'].includes(v)) {
    const c = u === 'c' ? a : u === 'f' ? ((a - 32) * 5) / 9 : a - 273.15;
    const out = v === 'c' ? c : v === 'f' ? (c * 9) / 5 + 32 : c + 273.15;
    return {
      title: 'Temperature conversion',
      value: f(out) + ' ' + to,
      formula: u.toUpperCase() + ' → ' + v.toUpperCase() + ' using exact temperature formulas',
    };
  }
  const x = UNIT[u],
    y = UNIT[v];
  if (!x || !y || x.base !== y.base) return null;
  return {
    title: 'Converter result',
    value: f((a * x.factor) / y.factor) + ' ' + to,
    formula: a + ' ' + from + ' × ' + x.factor + '/' + y.factor,
  };
}

function MotorPanel() {
  const [qty, setQty] = useState('500');
  const [kg, setKg] = useState('3.3');
  const [perBox, setPerBox] = useState('4');
  const [reject, setReject] = useState('2');
  const [cost, setCost] = useState('250');
  const [density, setDensity] = useState('7850');

  const q = n(qty),
    w = n(kg),
    b = Math.max(1, n(perBox)),
    r = n(reject),
    c = n(cost),
    good = q * (1 - r / 100);
  const material = q * w,
    boxes = Math.ceil(q / b),
    goodMaterial = good * w,
    total = c * q,
    materialVolume = n(density) > 0 ? material / n(density) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111B3C', marginBottom: 4 }}>
          ⚙️ Cooler Motor Manufacturing
        </h2>
        <p style={{ fontSize: 12, color: '#5D7192', lineHeight: '18px' }}>
          Production, material, packing, rejection and costing in one live panel.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          ['Motor Quantity', qty, setQty],
          ['Weight / Motor (kg)', kg, setKg],
          ['Motors / Box', perBox, setPerBox],
          ['Rejection %', reject, setReject],
          ['Cost / Motor ₹', cost, setCost],
          ['Density kg/m³', density, setDensity],
        ].map((x: any) => (
          <div key={x[0]} style={{ flex: '1 1 calc(50% - 8px)', minWidth: 140 }}>
            <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
              {x[0]}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={x[1]}
              onChange={(e) => x[2](e.target.value)}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 13,
                backgroundColor: '#FFF',
                border: '1px solid #CFE0F8',
                padding: '0 12px',
                color: '#142449',
                fontSize: 14,
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          ['Raw material', f(material) + ' kg'],
          ['Good motors', f(good)],
          ['Rejected', f(q - good)],
          ['Boxes', f(boxes)],
          ['Good material', f(goodMaterial) + ' kg'],
          ['Material volume', f(materialVolume) + ' m³'],
          ['Production value', '₹' + f(total)],
        ].map((x) => (
          <div
            key={x[0]}
            style={{
              flex: '1 1 calc(50% - 8px)',
              minWidth: 140,
              padding: 12,
              borderRadius: 16,
              backgroundColor: '#FFF',
              border: '1px solid #D7E6FA',
            }}
          >
            <div style={{ fontSize: 10, color: '#6680A3', fontWeight: 800 }}>{x[0]}</div>
            <div style={{ fontSize: 16, color: '#142449', fontWeight: 900, marginTop: 4 }}>{x[1]}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 900, color: '#111B3C', marginBottom: 8 }}>
          ⚡ Tap an example to calculate
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            [
              '500 motors · 3.3 kg · 4/box · 2% reject',
              () => {
                setQty('500');
                setKg('3.3');
                setPerBox('4');
                setReject('2');
              },
            ],
            [
              '1000 motors · 2.8 kg · 5/box · 1% reject',
              () => {
                setQty('1000');
                setKg('2.8');
                setPerBox('5');
                setReject('1');
              },
            ],
          ].map(([label, fn]: any) => (
            <button
              type="button"
              key={label}
              onClick={fn}
              style={{
                padding: 10,
                borderRadius: 14,
                backgroundColor: '#E7F1FF',
                border: '1px solid #C8DDFB',
                color: '#193762',
                fontSize: 11,
                fontWeight: 800,
                textAlign: 'left',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 11, color: '#49627F', lineHeight: '17px' }}>
        Volume = total material weight ÷ density. Confirm the actual material density for your alloy before production use.
      </p>
    </div>
  );
}

function SmartPanel() {
  const [q, setQ] = useState('');
  const result = useMemo(() => natural(q), [q]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111B3C', marginBottom: 4 }}>
          🧠 Conversational Calculator
        </h2>
        <p style={{ fontSize: 12, color: '#5D7192', lineHeight: '18px' }}>
          Type naturally. Result appears instantly while you type.
        </p>
      </div>

      {result && (
        <div
          style={{
            padding: 18,
            borderRadius: 20,
            backgroundColor: '#082F36',
            border: '1px solid #28B9B0',
            boxShadow: '0 8px 24px rgba(8, 47, 54, 0.25)',
          }}
        >
          <div style={{ fontSize: 10, color: '#67E8DE', fontWeight: 900, letterSpacing: '1.5px' }}>
            LIVE RESULT
          </div>
          <div style={{ fontSize: 30, color: '#FFF', fontWeight: 900, marginTop: 4 }}>{result.value}</div>
          <div style={{ fontSize: 13, color: '#B8FFF7', fontWeight: 800, marginTop: 4 }}>{result.title}</div>
          {result.formula && (
            <div style={{ fontSize: 12, color: '#D8FFF9', marginTop: 6, lineHeight: '18px' }}>
              {result.formula}
            </div>
          )}
          {result.detail && (
            <div style={{ fontSize: 11, color: '#A9C9C6', marginTop: 4 }}>{result.detail}</div>
          )}
        </div>
      )}

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try: 5 kg to g • ₹2500 at 18% GST • 500 motors 3.3 kg • 500 motors 2% rejection"
        style={{
          minHeight: 56,
          borderRadius: 18,
          backgroundColor: '#FFF',
          border: '1px solid #CFE0F8',
          padding: '0 16px',
          fontSize: 14,
          color: '#142449',
          outline: 'none',
          boxShadow: '0 2px 6px rgba(18, 60, 140, 0.08)',
        }}
      />

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 900, color: '#111B3C', marginBottom: 8 }}>
          ⚡ Quick examples
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            '5 kg to g',
            '2500 at 18% GST',
            '500 motors 3.3 kg',
            '500 motors 2% rejection',
            '1000 / 4',
            '(1250+750)*2',
          ].map((x) => (
            <button
              type="button"
              key={x}
              onClick={() => setQ(x)}
              style={{
                padding: '10px 14px',
                borderRadius: 14,
                backgroundColor: '#E7F1FF',
                border: '1px solid #C8DDFB',
                fontSize: 12,
                fontWeight: 800,
                color: '#193762',
              }}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConverterPanel() {
  const [v, setV] = useState('5');
  const [group, setGroup] = useState('Mass');
  const [from, setFrom] = useState('kg');
  const [to, setTo] = useState('g');
  const res = useMemo(() => convert(v, from, to), [v, from, to]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111B3C', marginBottom: 4 }}>
          🔄 Universal Converter
        </h2>
        <p style={{ fontSize: 12, color: '#5D7192', lineHeight: '18px' }}>
          Mass, length, volume, temperature, time, speed, pressure, power, energy and more.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 120px', minWidth: 90 }}>
          <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
            VALUE
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={v}
            onChange={(e) => setV(e.target.value)}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 13,
              backgroundColor: '#FFF',
              border: '1px solid #CFE0F8',
              padding: '0 12px',
              color: '#142449',
              fontSize: 14,
              fontWeight: 700,
              outline: 'none',
            }}
          />
        </div>
        <Dropdown
          label="CATEGORY"
          value={group}
          options={Object.keys(UNIT_GROUPS)}
          onChange={(g) => {
            setGroup(g);
            setFrom(UNIT_GROUPS[g][0]);
            setTo(UNIT_GROUPS[g][1] || UNIT_GROUPS[g][0]);
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Dropdown label="FROM UNIT" value={from} options={UNIT_GROUPS[group]} onChange={setFrom} />
        <Dropdown label="TO UNIT" value={to} options={UNIT_GROUPS[group]} onChange={setTo} />
      </div>

      {res && (
        <div
          style={{
            padding: 16,
            borderRadius: 20,
            backgroundColor: '#082F36',
            border: '1px solid #28B9B0',
          }}
        >
          <div style={{ fontSize: 10, color: '#67E8DE', fontWeight: 900, letterSpacing: '1.5px' }}>
            CONVERTED
          </div>
          <div style={{ fontSize: 28, color: '#FFF', fontWeight: 900, marginTop: 4 }}>{res.value}</div>
          <div style={{ fontSize: 12, color: '#D8FFF9', marginTop: 6 }}>{res.formula}</div>
        </div>
      )}

      <p style={{ fontSize: 11, color: '#647896', lineHeight: '18px' }}>
        Try: kg, g, mg, tonne • mm, cm, m, km, inch, ft, mile • mL, L, gallon • C, F, K • s, min, hour, day • kmh, mph, mps • Pa, bar, PSI • W, kW, hp • J, kWh, kcal
      </p>
    </div>
  );
}

function CurrencyPanel() {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [rate, setRate] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (from === to) {
      setRate(1);
      return;
    }
    setBusy(true);
    setRate(null);
    try {
      const r = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
      if (!r.ok) throw new Error('Rate unavailable');
      const j = await r.json();
      const rr = Number(j?.rates?.[to]);
      if (Number.isFinite(rr)) setRate(rr);
    } catch {
      setRate(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, [from, to]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111B3C', marginBottom: 4 }}>
          💱 World Currency
        </h2>
        <p style={{ fontSize: 12, color: '#5D7192', lineHeight: '18px' }}>
          Live-rate capable converter with a safe fallback rate.{' '}
          {busy ? 'Updating…' : 'Tap Update Rate for the latest available rate.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 120px', minWidth: 90 }}>
          <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
            AMOUNT
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 13,
              backgroundColor: '#FFF',
              border: '1px solid #CFE0F8',
              padding: '0 12px',
              color: '#142449',
              fontSize: 14,
              fontWeight: 700,
              outline: 'none',
            }}
          />
        </div>
        <Dropdown label="FROM" value={from} options={CURRENCIES} onChange={setFrom} />
        <Dropdown label="TO" value={to} options={CURRENCIES} onChange={setTo} />
      </div>

      <button
        type="button"
        onClick={load}
        disabled={busy}
        style={{
          height: 46,
          borderRadius: 14,
          backgroundColor: '#176CFF',
          color: '#FFF',
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        ↻ {busy ? 'FETCHING RATE…' : 'UPDATE LIVE RATE'}
      </button>

      <div
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: '#082F36',
          border: '1px solid #28B9B0',
        }}
      >
        <div style={{ fontSize: 10, color: '#67E8DE', fontWeight: 900, letterSpacing: '1.5px' }}>
          CURRENCY RESULT
        </div>
        <div style={{ fontSize: 26, color: '#FFF', fontWeight: 900, marginTop: 4 }}>
          {rate === null
            ? busy
              ? 'Fetching rate…'
              : 'Live rate unavailable — retry'
            : `${to} ${f(n(amount) * rate)}`}
        </div>
        {rate !== null && (
          <div style={{ fontSize: 11, color: '#D8FFF9', marginTop: 6 }}>
            1 {from} = {f(rate)} {to} • rate date: latest provider response
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 900, color: '#111B3C', marginBottom: 8 }}>
          ⚡ Quick examples
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            ['100 USD → INR', '100', 'USD', 'INR'],
            ['2500 INR → USD', '2500', 'INR', 'USD'],
            ['50 EUR → GBP', '50', 'EUR', 'GBP'],
          ].map(([label, a, fr, t]) => (
            <button
              type="button"
              key={label}
              onClick={() => {
                setAmount(a);
                setFrom(fr);
                setTo(t);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 14,
                backgroundColor: '#E7F1FF',
                border: '1px solid #C8DDFB',
                color: '#193762',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 11, color: '#647896', lineHeight: '18px' }}>
        Currency codes: {CURRENCIES.join(' • ')}. Rates depend on the latest provider data and can be unavailable for some currencies.
      </p>
    </div>
  );
}

export default function UniversalCalculator({ onOpenSmart }: { onOpenSmart: () => void }) {
  const [mode, setMode] = useState<Mode>('smart');

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '16px 16px 40px' }}>
      {/* Hero Banner matching original React Native app design */}
      <div
        style={{
          padding: 24,
          borderRadius: 28,
          backgroundColor: '#287BFF',
          border: '1px solid #63E5FF',
          boxShadow: '0 12px 28px rgba(23, 61, 155, 0.3)',
          color: '#FFF',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '8px 14px',
            borderRadius: 16,
            backgroundColor: '#09183D',
            border: '2px solid #FFE38A',
            boxShadow: '0 6px 12px rgba(3, 9, 27, 0.5)',
            transform: 'rotate(-4deg)',
            fontSize: 20,
            fontWeight: 900,
            marginBottom: 10,
          }}
        >
          ∑ <span style={{ color: '#FFE38A', marginLeft: 4 }}>AI</span> ✦
        </div>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#CFFBFF', letterSpacing: '1.2px' }}>
          SMARTCALC AI · UNIVERSAL ENGINE
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#FFF', marginTop: 6 }}>
          Calculate <span style={{ color: '#63E5FF' }}>Anything.</span>
        </h1>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#EAF5FF', lineHeight: '20px', marginTop: 6 }}>
          Calculator + Converter + Finance + Engineering + Cooler Motor Manufacturing
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, margin: '18px 0', flexWrap: 'wrap' }}>
        {[
          ['smart', '🧠 Smart'],
          ['convert', '🔄 Convert'],
          ['motor', '⚙️ Motor'],
          ['sales', '💰 Sales'],
          ['tools', '💱 Currency'],
        ].map(([id, label]) => {
          const active = mode === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => setMode(id as Mode)}
              style={{
                padding: '11px 16px',
                borderRadius: 17,
                backgroundColor: active ? '#176CFF' : '#FFF',
                border: `1px solid ${active ? '#5BB8FF' : '#D7E5FA'}`,
                color: active ? '#FFF' : '#274064',
                fontSize: 12,
                fontWeight: 900,
                boxShadow: active ? '0 4px 12px rgba(23, 108, 255, 0.25)' : 'none',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Panel contents */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 20,
          border: '1px solid #DCE7F7',
          boxShadow: '0 8px 24px rgba(23, 59, 130, 0.06)',
        }}
      >
        {mode === 'smart' && <SmartPanel />}
        {mode === 'convert' && <ConverterPanel />}
        {mode === 'motor' && <MotorPanel />}
        {mode === 'sales' && <SalesPanel />}
        {mode === 'tools' && <CurrencyPanel />}
      </div>

      {/* Preserve existing SmartCalc card */}
      <div
        style={{
          marginTop: 24,
          padding: 18,
          borderRadius: 20,
          backgroundColor: '#EAF7F4',
          border: '1px solid #A9E4D7',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 900, color: '#11685B', marginBottom: 4 }}>
          ✓ Full SmartCalc Suite Preserved
        </div>
        <p style={{ fontSize: 12, color: '#3A7067', lineHeight: '18px' }}>
          All 100+ specialized engineering & finance calculator tools, interactive 3D Chess, bilingual AI Chat, history and converters remain completely accessible.
        </p>
        <button
          type="button"
          onClick={onOpenSmart}
          style={{
            marginTop: 12,
            width: '100%',
            padding: 14,
            borderRadius: 14,
            backgroundColor: '#11685B',
            color: '#FFF',
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '0.5px',
          }}
        >
          OPEN FULL SMARTCALC SUITE (100+ TOOLS & CHESS) →
        </button>
      </div>
    </div>
  );
}
