import React, { useEffect, useMemo, useState } from 'react';
import { getCurrencyRate } from '../utils/currency';

type Tab = 'home' | 'tools' | 'chess' | 'chat' | 'history';
type Tool = { id: string; title: string; icon: string; category: string; desc: string; converter?: boolean };

const T = (id: string, title: string, icon: string, category: string, desc: string, converter = false): Tool => ({
  id,
  title,
  icon,
  category,
  desc,
  converter,
});

const tools: Tool[] = [
  T('basic', 'Basic Calculator', '＋', 'Calculators', 'Normal calculator with memory, brackets, %, ± and history'),
  T('scientific', 'Scientific Calculator', 'π', 'Calculators', 'sin, cos, tan, log, ln, √ and powers'),
  T('advanced', 'Advanced Calculator', '∑', 'Calculators', 'Advanced expression calculator'),
  T('fraction', 'Fraction Calculator', '½', 'Calculators', 'Add, subtract, multiply and divide fractions'),
  T('percentage', 'Percentage Calculator', '%', 'Calculators', 'Percent of, increase, decrease and reverse'),
  T('ratio', 'Ratio Calculator', '∶', 'Calculators', 'Simplify and split ratios'),
  T('average', 'Average Calculator', 'x̄', 'Calculators', 'Mean, total, count and median'),
  T('random', 'Random Number Generator', '⚄', 'Calculators', 'Random integer between limits'),
  T('algebra', 'Algebra Calculator', 'x', 'Math', 'Solve a linear equation'),
  T('equation', 'Equation Solver', '=', 'Math', 'Solve ax+b=c'),
  T('quadratic', 'Quadratic Equation', 'x²', 'Math', 'Solve ax²+bx+c=0'),
  T('exponent', 'Exponent Calculator', 'xʸ', 'Math', 'Powers'),
  T('root', 'Root Calculator', '√', 'Math', 'Nth root'),
  T('logarithm', 'Logarithm Calculator', 'log', 'Math', 'Log base n'),
  T('gcdlcm', 'GCD & LCM Calculator', 'LC', 'Math', 'HCF/GCD and LCM'),
  T('prime', 'Prime Number Checker', 'P', 'Math', 'Prime test'),
  T('factorial', 'Factorial Calculator', 'n!', 'Math', 'Factorial'),
  T('permutation', 'Permutation & Combination', 'nCr', 'Math', 'nPr and nCr'),
  T('sequence', 'Sequence / Series Calculator', 'Σ', 'Math', 'Arithmetic/geometric sequence'),
  T('matrix', 'Matrix Calculator', '▦', 'Math', '2×2 matrix determinant'),
  T('emi', 'EMI Calculator', '₹', 'Finance', 'Monthly EMI, total payment and interest'),
  T('loan', 'Loan Calculator', '🏦', 'Finance', 'Loan payment summary'),
  T('mortgage', 'Mortgage Calculator', '⌂', 'Finance', 'Mortgage payment'),
  T('interest', 'Interest Calculator', '%', 'Finance', 'Simple and compound interest'),
  T('simpleInterest', 'Simple Interest', 'SI', 'Finance', 'Simple interest and maturity'),
  T('compoundInterest', 'Compound Interest', 'CI', 'Finance', 'Compound interest and maturity'),
  T('sip', 'SIP Calculator', 'SIP', 'Finance', 'Monthly investment projection'),
  T('lumpsum', 'Lumpsum Calculator', 'LS', 'Finance', 'One-time investment projection'),
  T('fd', 'FD Calculator', 'FD', 'Finance', 'Fixed deposit maturity'),
  T('rd', 'RD Calculator', 'RD', 'Finance', 'Recurring deposit maturity'),
  T('ppf', 'PPF Calculator', 'PPF', 'Finance', 'PPF projection'),
  T('gst', 'GST Calculator', 'GST', 'Finance', 'Add GST and remove GST'),
  T('incomeTax', 'Income Tax Calculator', 'IT', 'Finance', 'Tax estimate'),
  T('salary', 'Salary Calculator', '₹', 'Finance', 'Salary and deductions'),
  T('discount', 'Discount Calculator', '🏷', 'Finance', 'Discount and saving'),
  T('profit', 'Profit & Loss', '↗', 'Finance', 'Profit/loss, margin and markup'),
  T('markup', 'Markup Calculator', '↗', 'Finance', 'Cost plus markup'),
  T('inflation', 'Inflation Calculator', '📈', 'Finance', 'Future price after inflation'),
  T('currency', 'Currency Calculator', '¤', 'Finance', 'Currency conversion', true),
  T('bmi', 'BMI Calculator', '♥', 'Health & Fitness', 'BMI from weight and height'),
  T('bmr', 'BMR Calculator', '⚡', 'Health & Fitness', 'Mifflin-St Jeor BMR'),
  T('calorie', 'Calorie Calculator', '🔥', 'Health & Fitness', 'Daily calorie estimate'),
  T('bodyFat', 'Body Fat Calculator', '%', 'Health & Fitness', 'US Navy estimate'),
  T('idealWeight', 'Ideal Weight Calculator', '⚖', 'Health & Fitness', 'Devine estimate'),
  T('age', 'Age Calculator', '🎂', 'Health & Fitness', 'Exact age'),
  T('pregnancy', 'Pregnancy Calculator', '👶', 'Health & Fitness', 'Estimated due date from LMP'),
  T('water', 'Water Intake Calculator', '💧', 'Health & Fitness', 'Daily water estimate'),
  T('pace', 'Pace Calculator', '🏃', 'Health & Fitness', 'Pace from time and distance'),
  T('tdee', 'TDEE Calculator', 'TDEE', 'Health & Fitness', 'Daily energy estimate'),
  T('dateDiff', 'Date Difference', '▣', 'Date & Time', 'Calendar days between dates'),
  T('addDate', 'Add/Subtract Date', '＋', 'Date & Time', 'Add or subtract days'),
  T('timeDiff', 'Time Difference', '◴', 'Date & Time', 'Difference between times'),
  T('countdown', 'Countdown Calculator', '⏳', 'Date & Time', 'Days until target date'),
  T('workingDays', 'Working Days Calculator', '📅', 'Date & Time', 'Weekdays between dates'),
  T('daysBetween', 'Days Between Dates', '▤', 'Date & Time', 'Calendar-day difference'),
  T('timezone', 'Time Zone Calculator', '🌐', 'Date & Time', 'UTC offset helper'),
  T('area', 'Area Calculator', '▦', 'Construction / Engineering', 'Area from dimensions'),
  T('volume', 'Volume Calculator', '◉', 'Construction / Engineering', 'Volume from dimensions'),
  T('length', 'Length Calculator', '↔', 'Construction / Engineering', 'Length calculation'),
  T('concrete', 'Concrete Calculator', '▥', 'Construction / Engineering', 'Concrete volume'),
  T('brick', 'Brick Calculator', '▤', 'Construction / Engineering', 'Estimated brick count'),
  T('tile', 'Tile Calculator', '▦', 'Construction / Engineering', 'Tiles required'),
  T('paint', 'Paint Calculator', '🖌', 'Construction / Engineering', 'Wall area and paint'),
  T('flooring', 'Flooring Calculator', '▥', 'Construction / Engineering', 'Floor area'),
  T('roofing', 'Roofing Calculator', '⌂', 'Construction / Engineering', 'Roof area with pitch'),
  T('stair', 'Stair Calculator', '↗', 'Construction / Engineering', 'Steps and rise'),
  T('circle', 'Circle Calculator', '○', 'Construction / Engineering', 'Area and circumference'),
  T('triangle', 'Triangle Calculator', '△', 'Construction / Engineering', 'Triangle area'),
  T('rectangle', 'Rectangle Calculator', '▭', 'Construction / Engineering', 'Area and perimeter'),
  T('cylinder', 'Cylinder Calculator', '◯', 'Construction / Engineering', 'Volume and surface'),
  T('sphere', 'Sphere Calculator', '●', 'Construction / Engineering', 'Volume and surface'),
  T('electricalPower', 'Electrical Power Calculator', '⚡', 'Construction / Engineering', 'P=VI'),
  T('ohmsLaw', 'Ohm’s Law', 'Ω', 'Construction / Engineering', 'V=IR'),
  T('wattVoltAmp', 'Watt/Volt/Amp Calculator', 'W', 'Construction / Engineering', 'Power/current/voltage'),
  T('lengthConv', 'Length', '📏', 'Length', 'mm, cm, m, km, inch, feet, yard, mile, nautical mile', true),
  T('weightConv', 'Weight / Mass', '⚖', 'Weight / Mass', 'mg, g, kg, quintal, tonne, ounce, pound, stone, carat', true),
  T('temperatureConv', 'Temperature', '🌡', 'Temperature', 'Celsius, Fahrenheit, Kelvin, Rankine', true),
  T('volumeConv', 'Volume', '🧪', 'Volume', 'mL, L, m³, cm³, gallon, quart, pint, cup, tablespoon, teaspoon', true),
  T('areaConv', 'Area', '📐', 'Area', 'mm², cm², m², km², sq ft, sq yd, acre, hectare, bigha', true),
  T('speedConv', 'Speed', '🚗', 'Speed', 'km/h, m/s, mph, knot, Mach', true),
  T('timeConv', 'Time', '⏱', 'Time', 'nanosecond, microsecond, millisecond, second, minute, hour, day, week, month, year', true),
  T('dataConv', 'Digital Storage', '💾', 'Digital Storage', 'bit, Byte, KB, MB, GB, TB, PB, EB, KiB, MiB, GiB, TiB', true),
  T('binaryDecimal', 'Binary ↔ Decimal', '01', 'Computer / Data', 'Base 2 and base 10', true),
  T('binaryHex', 'Binary ↔ Hexadecimal', '0x', 'Computer / Data', 'Base 2 and base 16', true),
  T('binaryOctal', 'Binary ↔ Octal', '8', 'Computer / Data', 'Base 2 and base 8', true),
  T('decimalHex', 'Decimal ↔ Hexadecimal', '16', 'Computer / Data', 'Base 10 and base 16', true),
  T('decimalOctal', 'Decimal ↔ Octal', '8', 'Computer / Data', 'Base 10 and base 8', true),
  T('ascii', 'ASCII', 'A', 'Computer / Data', 'Text ↔ ASCII code'),
  T('unicode', 'Unicode', 'U+', 'Computer / Data', 'Text ↔ Unicode code point'),
  T('baseConverter', 'Base Converter', '#', 'Computer / Data', 'Convert bases 2–36', true),
  T('electricityConv', 'Electricity', '⚡', 'Electricity', 'Volt, Ampere, Watt, Ohm, Coulomb, Joule, kWh, VA, kVA', true),
  T('energyConv', 'Energy', 'J', 'Energy', 'Joule, kJ, calorie, kcal, Wh, kWh, BTU, eV', true),
  T('pressureConv', 'Pressure', 'Pa', 'Pressure', 'Pa, kPa, bar, PSI, atm, mmHg, Torr', true),
  T('powerConv', 'Power', 'W', 'Power', 'W, kW, MW, horsepower, BTU/hour', true),
  T('forceConv', 'Force', 'N', 'Force', 'Newton, kN, dyne, kgf, lbf', true),
  T('densityConv', 'Density', 'ρ', 'Density', 'kg/m³, g/cm³, g/mL, lb/ft³', true),
  T('currencyConv', 'Currency', '💱', 'Currency', 'INR, USD, EUR, GBP, AED, SAR, JPY, CNY, CAD, AUD, CHF and more', true),
  T('angleConv', 'Angle', '°', 'Other Useful Converters', 'degree, radian, gradian', true),
  T('frequencyConv', 'Frequency', 'Hz', 'Other Useful Converters', 'Hz, kHz, MHz, GHz', true),
  T('wavelength', 'Wavelength', 'λ', 'Other Useful Converters', 'Frequency/wavelength helper'),
  T('torqueConv', 'Torque', 'τ', 'Other Useful Converters', 'N·m, kgf·m, lbf·ft', true),
  T('accelerationConv', 'Acceleration', 'a', 'Other Useful Converters', 'm/s², ft/s², g', true),
  T('fuelConv', 'Fuel Economy', '⛽', 'Other Useful Converters', 'km/L, L/100km, mpg', true),
  T('dataRateConv', 'Data Transfer Rate', '⇄', 'Other Useful Converters', 'bps to MB/s', true),
  T('illuminanceConv', 'Illuminance', '☀', 'Other Useful Converters', 'lux, foot-candle', true),
  T('radiationConv', 'Radiation', '☢', 'Other Useful Converters', 'Gy, Sv, rad, rem', true),
  T('soundConv', 'Sound Level', 'dB', 'Other Useful Converters', 'dB ratio helper'),
  T('magneticConv', 'Magnetic Field', 'B', 'Other Useful Converters', 'Tesla, gauss', true),
  T('molarMass', 'Molar Mass', 'mol', 'Other Useful Converters', 'Mass / amount'),
  T('molarity', 'Molarity', 'M', 'Other Useful Converters', 'Moles per litre'),
  T('concentration', 'Concentration', '%', 'Other Useful Converters', 'Mass concentration'),
  T('cooking', 'Cooking Units', '🥄', 'Other Useful Converters', 'Cup, tablespoon, teaspoon, mL', true),
  T('shoeSize', 'Shoe Size', '👟', 'Other Useful Converters', 'Common size helper'),
  T('clothingSize', 'Clothing Size', '👕', 'Other Useful Converters', 'Common size helper'),
  T('numberSystem', 'Number System', '123', 'Other Useful Converters', 'Decimal, binary, octal, hexadecimal'),
  T('roundBarWeight', 'Round Bar Weight', '⚙', 'Construction / Engineering', 'Exact solid round-bar weight from OD, length and material density'),
  T('pipeWeight', 'Pipe Weight', '🧱', 'Construction / Engineering', 'Exact pipe weight from OD, wall thickness, length and density'),
  T('pipeSize', 'Pipe Size / ID', '📏', 'Construction / Engineering', 'Calculate pipe ID, cross-section and weight per metre'),
  T('sheetWeight', 'Sheet Weight', '▤', 'Construction / Engineering', 'Sheet weight from length, width, thickness and density'),
  T('metalDensity', 'Metal Density Helper', 'ρ', 'Construction / Engineering', 'Use standard material density for engineering calculations'),
];

const categories = ['All', ...Array.from(new Set(tools.map((t) => t.category)))];

const unitDefs: Record<string, { units: string[]; factor: Record<string, number> }> = {
  lengthConv: {
    units: ['mm', 'cm', 'm', 'km', 'inch', 'ft', 'yd', 'mile', 'nmi'],
    factor: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, ft: 0.3048, yd: 0.9144, mile: 1609.344, nmi: 1852 },
  },
  weightConv: {
    units: ['mg', 'g', 'kg', 'quintal', 'tonne', 'oz', 'lb', 'stone', 'carat'],
    factor: { mg: 1e-6, g: 0.001, kg: 1, quintal: 100, tonne: 1000, oz: 0.028349523125, lb: 0.45359237, stone: 6.35029318, carat: 0.0002 },
  },
  volumeConv: {
    units: ['ml', 'L', 'm3', 'cm3', 'gallon', 'quart', 'pint', 'cup', 'tbsp', 'tsp'],
    factor: { ml: 1e-6, L: 0.001, m3: 1, cm3: 1e-6, gallon: 0.003785411784, quart: 0.000946352946, pint: 0.000473176473, cup: 0.0002365882365, tbsp: 0.0000147867648, tsp: 0.00000492892159 },
  },
  areaConv: {
    units: ['mm2', 'cm2', 'm2', 'km2', 'sqft', 'sqyd', 'acre', 'hectare', 'bigha'],
    factor: { mm2: 1e-6, cm2: 1e-4, m2: 1, km2: 1e6, sqft: 0.09290304, sqyd: 0.83612736, acre: 4046.8564224, hectare: 10000, bigha: 2529.285264 },
  },
  speedConv: {
    units: ['kmh', 'mps', 'mph', 'knot', 'mach'],
    factor: { kmh: 1, mps: 3.6, mph: 1.609344, knot: 1.852, mach: 1225.044 },
  },
  timeConv: {
    units: ['ns', 'us', 'ms', 's', 'min', 'hour', 'day', 'week', 'month', 'year'],
    factor: { ns: 1e-9, us: 1e-6, ms: 0.001, s: 1, min: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 },
  },
  dataConv: {
    units: ['bit', 'Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'KiB', 'MiB', 'GiB', 'TiB'],
    factor: { bit: 1, Byte: 8, KB: 8000, MB: 8000000, GB: 8000000000, TB: 8000000000000, PB: 8000000000000000, EB: 8000000000000000000, KiB: 8192, MiB: 8388608, GiB: 8589934592, TiB: 8796093022208 },
  },
  energyConv: {
    units: ['J', 'kJ', 'cal', 'kcal', 'Wh', 'kWh', 'BTU', 'eV'],
    factor: { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3600000, BTU: 1055.05585262, eV: 1.602176634e-19 },
  },
  pressureConv: {
    units: ['Pa', 'kPa', 'bar', 'PSI', 'atm', 'mmHg', 'Torr'],
    factor: { Pa: 1, kPa: 1000, bar: 100000, PSI: 6894.757293168, atm: 101325, mmHg: 133.322387415, Torr: 133.322368421 },
  },
  powerConv: {
    units: ['W', 'kW', 'MW', 'hp', 'BTUh'],
    factor: { W: 1, kW: 1000, MW: 1e6, hp: 745.699871582, BTUh: 0.29307107017 },
  },
  forceConv: {
    units: ['N', 'kN', 'dyne', 'kgf', 'lbf'],
    factor: { N: 1, kN: 1000, dyne: 1e-5, kgf: 9.80665, lbf: 4.4482216152605 },
  },
  densityConv: {
    units: ['kgm3', 'gcm3', 'gml', 'lbft3'],
    factor: { kgm3: 1, gcm3: 1000, gml: 1000, lbft3: 16.01846337 },
  },
  angleConv: {
    units: ['deg', 'rad', 'grad'],
    factor: { deg: 1, rad: 57.29577951308232, grad: 0.9 },
  },
  frequencyConv: {
    units: ['Hz', 'kHz', 'MHz', 'GHz'],
    factor: { Hz: 1, kHz: 1000, MHz: 1e6, GHz: 1e9 },
  },
  torqueConv: {
    units: ['Nm', 'kgfm', 'lbfft'],
    factor: { Nm: 1, kgfm: 9.80665, lbfft: 1.3558179483314 },
  },
  accelerationConv: {
    units: ['mps2', 'ftps2', 'g'],
    factor: { mps2: 1, ftps2: 0.3048, g: 9.80665 },
  },
  dataRateConv: {
    units: ['bps', 'Kbps', 'Mbps', 'Gbps', 'MBps'],
    factor: { bps: 1, Kbps: 1000, Mbps: 1e6, Gbps: 1e9, MBps: 8e6 },
  },
  illuminanceConv: {
    units: ['lux', 'footcandle'],
    factor: { lux: 1, footcandle: 10.7639104167 },
  },
  radiationConv: {
    units: ['Gy', 'Sv', 'rad', 'rem'],
    factor: { Gy: 1, Sv: 1, rad: 0.01, rem: 0.01 },
  },
  magneticConv: {
    units: ['tesla', 'gauss'],
    factor: { tesla: 1, gauss: 1e-4 },
  },
  cooking: {
    units: ['ml', 'L', 'cup', 'tbsp', 'tsp'],
    factor: { ml: 1, L: 1000, cup: 236.5882365, tbsp: 14.7867648, tsp: 4.92892159 },
  },
  electricityConv: {
    units: ['V', 'A', 'W', 'Ohm', 'C', 'J', 'kWh', 'VA', 'kVA'],
    factor: { V: 1, A: 1, W: 1, Ohm: 1, C: 1, J: 1, kWh: 1, VA: 1, kVA: 1000 },
  },
};

const labels: Record<string, string> = {
  mm: 'mm', cm: 'cm', m: 'm', km: 'km', inch: 'inch', ft: 'feet', yd: 'yard', mile: 'mile', nmi: 'nautical mile',
  mg: 'mg', g: 'g', kg: 'kg', quintal: 'quintal', tonne: 'tonne', oz: 'ounce', lb: 'pound', stone: 'stone', carat: 'carat',
  ml: 'mL', L: 'L', m3: 'm³', cm3: 'cm³', gallon: 'gallon', quart: 'quart', pint: 'pint', cup: 'cup', tbsp: 'tablespoon', tsp: 'teaspoon',
  mm2: 'mm²', cm2: 'cm²', m2: 'm²', km2: 'km²', sqft: 'sq ft', sqyd: 'sq yd', acre: 'acre', hectare: 'hectare', bigha: 'bigha',
  kmh: 'km/h', mps: 'm/s', mph: 'mph', knot: 'knot', mach: 'Mach',
  ns: 'nanosecond', us: 'microsecond', ms: 'millisecond', s: 'second', min: 'minute', hour: 'hour', day: 'day', week: 'week', month: 'month', year: 'year',
  bit: 'bit', Byte: 'Byte', KB: 'KB', MB: 'MB', GB: 'GB', TB: 'TB', PB: 'PB', EB: 'EB', KiB: 'KiB', MiB: 'MiB', GiB: 'GiB', TiB: 'TiB',
  J: 'Joule', kJ: 'kilojoule', cal: 'calorie', kcal: 'kilocalorie', Wh: 'watt-hour', kWh: 'kWh', BTU: 'BTU', eV: 'electronvolt',
  Pa: 'Pascal', kPa: 'kPa', PSI: 'PSI', atm: 'atm', mmHg: 'mmHg', Torr: 'Torr',
  W: 'Watt', kW: 'kilowatt', MW: 'megawatt', hp: 'horsepower', BTUh: 'BTU/hour',
  N: 'Newton', kN: 'kilonewton', dyne: 'dyne', kgf: 'kg-force', lbf: 'lb-force',
  kgm3: 'kg/m³', gcm3: 'g/cm³', gml: 'g/mL', lbft3: 'lb/ft³',
  deg: 'degree', rad: 'radian', grad: 'gradian',
  Hz: 'Hz', kHz: 'kHz', MHz: 'MHz', GHz: 'GHz',
  Nm: 'N·m', kgfm: 'kgf·m', lbfft: 'lbf·ft',
  mps2: 'm/s²', ftps2: 'ft/s²',
  bps: 'bps', Kbps: 'Kbps', Mbps: 'Mbps', Gbps: 'Gbps', MBps: 'MB/s',
  lux: 'lux', footcandle: 'foot-candle',
  Gy: 'Gy', Sv: 'Sv', rem: 'rem',
  tesla: 'Tesla', gauss: 'Gauss',
  V: 'Volt', A: 'Ampere', Ohm: 'Ohm', C: 'Coulomb', VA: 'VA', kVA: 'kVA',
};

const fmt = (x: number) =>
  Number.isFinite(x) ? x.toLocaleString('en-IN', { maximumFractionDigits: 10 }) : 'Error';
const num = (s: string) => {
  const x = Number(String(s).replace(/,/g, ''));
  return Number.isFinite(x) ? x : 0;
};
const money = (x: number) => `₹${fmt(x)}`;
const gcd = (a: number, b: number) => {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a || 1;
};

function evalExpr(s: string): number | null {
  const x = s.replace(/,/g, '').replace(/×/g, '*').replace(/÷/g, '/').trim();
  if (!x || !/^[0-9+\-*/().%\s]+$/.test(x)) return null;
  const ts = x.match(/\d*\.?\d+|[()+\-*/%]/g);
  if (!ts) return null;
  const v: number[] = [],
    o: string[] = [];
  const p: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
  const apply = () => {
    const q = o.pop(),
      b = v.pop(),
      a = v.pop();
    if (q == null || a == null || b == null) throw 0;
    if (q === '+') v.push(a + b);
    else if (q === '-') v.push(a - b);
    else if (q === '*') v.push(a * b);
    else if (q === '/') {
      if (b === 0) throw 0;
      v.push(a / b);
    } else v.push(a % b);
  };
  try {
    let prev = 'o';
    for (const t of ts) {
      if (/^\d/.test(t)) {
        v.push(Number(t));
        prev = 'n';
      } else if (t === '(') {
        o.push(t);
        prev = 'o';
      } else if (t === ')') {
        while (o.length && o[o.length - 1] !== '(') apply();
        if (o.pop() !== '(') return null;
        prev = 'n';
      } else {
        if (t === '-' && prev === 'o') v.push(0);
        while (o.length && o[o.length - 1] !== '(' && p[o[o.length - 1]] >= p[t]) apply();
        o.push(t);
        prev = 'o';
      }
    }
    while (o.length) apply();
    return v.length === 1 ? v[0] : null;
  } catch {
    return null;
  }
}

function inputMeta(t: Tool): [string, string][] {
  const id = t.id;
  if (['age', 'dateDiff', 'daysBetween', 'addDate', 'countdown', 'workingDays'].includes(id))
    return [['DATE 1', 'DD/MM/YYYY'], ['DATE 2 / TARGET', 'DD/MM/YYYY'], ['EXTRA DAYS', '0']];
  if (id === 'average') return [['NUMBERS', '10,20,30,40'], ['—', ''], ['—', '']];
  if (id === 'scientific') return [['OPERATION', 'sin / cos / tan / sqrt / log / ln / power'], ['VALUE / ANGLE', '45'], ['POWER (for power)', '2']];
  if (['emi', 'loan', 'mortgage'].includes(id))
    return [['LOAN AMOUNT', '500000'], ['ANNUAL INTEREST RATE %', '8.5'], ['TENURE (YEARS)', '5']];
  if (['simpleInterest', 'compoundInterest', 'lumpsum', 'inflation'].includes(id))
    return [['PRINCIPAL / AMOUNT', '100000'], ['ANNUAL RATE %', '8'], ['TIME (YEARS)', '5']];
  if (id === 'sip')
    return [['MONTHLY INVESTMENT', '5000'], ['EXPECTED ANNUAL RETURN %', '12'], ['TIME (YEARS)', '10']];
  if (['fd', 'rd'].includes(id))
    return id === 'fd'
      ? [['DEPOSIT', '100000'], ['ANNUAL RATE %', '7'], ['TIME (YEARS)', '5']]
      : [['MONTHLY DEPOSIT', '5000'], ['ANNUAL RATE %', '7'], ['TIME (YEARS)', '5']];
  if (id === 'gst') return [['AMOUNT', '25000'], ['GST RATE %', '18'], ['—', '']];
  if (id === 'bmi') return [['WEIGHT (kg)', '70'], ['HEIGHT (cm)', '170'], ['—', '']];
  if (['bmr', 'calorie', 'tdee'].includes(id))
    return [['WEIGHT (kg)', '70'], ['HEIGHT (cm)', '170'], ['AGE (years)', '30']];
  if (id === 'bodyFat') return [['WAIST (cm)', '85'], ['NECK (cm)', '38'], ['HEIGHT (cm)', '170']];
  if (id === 'idealWeight') return [['HEIGHT (cm)', '170'], ['—', ''], ['—', '']];
  if (id === 'water') return [['WEIGHT (kg)', '70'], ['—', ''], ['—', '']];
  if (id === 'pace') return [['TIME (minutes)', '60'], ['DISTANCE (km)', '10'], ['—', '']];
  if (['circle'].includes(id)) return [['RADIUS', '10'], ['—', ''], ['—', '']];
  if (['triangle'].includes(id)) return [['BASE', '10'], ['HEIGHT', '5'], ['—', '']];
  if (['rectangle', 'area', 'flooring', 'concrete', 'volume'].includes(id))
    return [['LENGTH', '10'], ['WIDTH', '5'], ['HEIGHT / DEPTH', '3']];
  if (id === 'roofing') return [['LENGTH', '10'], ['WIDTH', '5'], ['PITCH (degrees)', '20']];
  if (id === 'stair') return [['TOTAL RISE', '300'], ['MAX RISE / STEP', '18'], ['—', '']];
  if (id === 'cylinder') return [['RADIUS', '10'], ['HEIGHT', '20'], ['—', '']];
  if (id === 'sphere') return [['RADIUS', '10'], ['—', ''], ['—', '']];
  if (id === 'electricalPower') return [['VOLTAGE (V)', '230'], ['CURRENT (A)', '5'], ['—', '']];
  if (id === 'ohmsLaw') return [['CURRENT (A)', '5'], ['RESISTANCE (Ω)', '46'], ['—', '']];
  if (id === 'wattVoltAmp') return [['VOLTAGE (V)', '230'], ['CURRENT (A)', '5'], ['—', '']];
  if (id === 'roundBarWeight')
    return [['बाहरी व्यास / OD (mm)', '20'], ['लंबाई (metre)', '6'], ['धातु की Density (kg/m³)', '7850']];
  if (id === 'pipeWeight')
    return [['बाहरी व्यास / OD (mm)', '50'], ['Wall Thickness (mm)', '2'], ['लंबाई (metre)', '6'], ['Density (kg/m³)', '7850']];
  if (id === 'pipeSize')
    return [['बाहरी व्यास / OD (mm)', '50'], ['Wall Thickness (mm)', '2'], ['लंबाई (metre)', '1'], ['Density (kg/m³)', '7850']];
  if (id === 'sheetWeight')
    return [['लंबाई (metre)', '2'], ['चौड़ाई (metre)', '1'], ['Thickness (mm)', '1'], ['Density (kg/m³)', '7850']];
  if (id === 'metalDensity') return [['Material (density kg/m³)', '7850'], ['—', ''], ['—', '']];
  if (id === 'percentage') return [['AMOUNT', '480'], ['PERCENT %', '25'], ['—', '']];
  if (id === 'discount') return [['ORIGINAL PRICE', '1000'], ['DISCOUNT %', '10'], ['—', '']];
  if (id === 'profit') return [['COST PRICE', '800'], ['SELLING PRICE', '1000'], ['—', '']];
  if (id === 'markup') return [['COST PRICE', '800'], ['MARKUP %', '20'], ['—', '']];
  if (id === 'quadratic') return [['a = x² का गुणांक', '1'], ['b = x का गुणांक', '-5'], ['c = स्थिर संख्या', '6']];
  if (id === 'equation') return [['a = x का गुणांक', '2'], ['b = स्थिर संख्या', '3'], ['c = बराबर वाला अंक', '11']];
  if (id === 'exponent') return [['BASE', '2'], ['EXPONENT', '10'], ['—', '']];
  if (id === 'root') return [['NUMBER', '256'], ['ROOT DEGREE', '4'], ['—', '']];
  if (id === 'logarithm') return [['NUMBER', '1000'], ['BASE', '10'], ['—', '']];
  if (id === 'gcdlcm') return [['FIRST INTEGER', '48'], ['SECOND INTEGER', '18'], ['—', '']];
  if (id === 'permutation') return [['कुल वस्तुएँ (n)', '10'], ['चुननी हैं (r)', '3'], ['—', '']];
  if (id === 'prime' || id === 'factorial' || id === 'random')
    return id === 'random' ? [['MIN', '1'], ['MAX', '100'], ['—', '']] : [['NUMBER', id === 'factorial' ? '5' : '97'], ['—', ''], ['—', '']];
  return [['VALUE / INPUT', '10000'], ['SECOND VALUE / RATE', '18'], ['THIRD VALUE / TIME', '5']];
}

function BasicKeypad({ onResult }: { onResult: (x: string) => void }) {
  const [e, setE] = useState('');
  const [m, setM] = useState(0);
  const live = evalExpr(e);
  const keys = [
    'MC', 'MR', 'M+', '⌫', 'C',
    '(', ')', '%', '7', '8',
    '9', '÷', '4', '5', '6',
    '×', '1', '2', '3', '−',
    '0', '.', '±', '+'
  ];

  const tap = (k: string) => {
    if (k === 'C') return setE('');
    if (k === '⌫') return setE((x) => x.slice(0, -1));
    if (k === 'MC') return setM(0);
    if (k === 'MR') return setE(String(m));
    if (k === 'M+') {
      const r = evalExpr(e);
      if (r !== null) setM(m + r);
      return;
    }
    if (k === '±') return setE((x) => (x.startsWith('-') ? x.slice(1) : x ? '-' + x : '-'));
    if (k === '=') {
      const r = evalExpr(e);
      if (r !== null) {
        setE(String(r));
        onResult(fmt(r));
      }
      return;
    }
    setE((x) => x + k);
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 16,
        border: '1px solid #D7E5FA',
        boxShadow: '0 8px 24px rgba(23, 75, 154, 0.1)',
      }}
    >
      <div
        style={{
          minHeight: 80,
          borderRadius: 16,
          backgroundColor: '#10234A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-end',
          padding: '12px 16px',
        }}
      >
        <div style={{ color: '#7189aa', fontSize: 11, alignSelf: 'flex-start' }}>M {m !== 0 ? 'ON' : ''}</div>
        {e.trim() !== '' && live !== null && Number.isFinite(live) && (
          <div style={{ fontSize: 24, fontWeight: 900, color: '#62E9FF' }}>{fmt(live)}</div>
        )}
        <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, wordBreak: 'break-all' }}>{e || '0'}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
        {keys.map((k) => {
          const isAction = k === 'C' || k === '⌫' || k === 'MC' || k === 'MR' || k === 'M+';
          const isOp = k === '+' || k === '−' || k === '×' || k === '÷' || k === '%';
          return (
            <button
              type="button"
              key={k}
              onClick={() => tap(k)}
              style={{
                height: 48,
                borderRadius: 13,
                backgroundColor: isAction ? '#D8E7FA' : isOp ? '#CDE4FF' : '#E7F1FF',
                border: '1px solid #D0E3FF',
                color: isOp ? '#155FE8' : '#17294D',
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              {k}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => tap('=')}
        style={{
          width: '100%',
          height: 52,
          borderRadius: 14,
          backgroundColor: '#197cff',
          color: '#fff',
          fontWeight: 900,
          fontSize: 22,
          marginTop: 10,
        }}
      >
        =
      </button>
    </div>
  );
}

function ConverterModal({
  t,
  back,
  save,
}: {
  t: Tool;
  back: () => void;
  save: (q: string, r: string) => void;
}) {
  const def = unitDefs[t.id];
  const baseIds = ['binaryDecimal', 'binaryHex', 'binaryOctal', 'decimalHex', 'decimalOctal', 'baseConverter'];
  const basePairs: Record<string, string[] | undefined> = {
    binaryDecimal: ['2', '10'],
    binaryHex: ['2', '16'],
    binaryOctal: ['2', '8'],
    decimalHex: ['10', '16'],
    decimalOctal: ['10', '8'],
  };
  const baseUnits = t.id === 'baseConverter' ? Array.from({ length: 35 }, (_, i) => String(i + 2)) : basePairs[t.id] || [];
  const list = def?.units || [];
  const isCurrency = t.id === 'currencyConv' || t.id === 'currency';
  const [v, setV] = useState('1');
  const [from, setFrom] = useState(isCurrency ? 'EUR' : t.id === 'temperatureConv' ? 'C' : baseUnits[0] || list[0] || '');
  const [to, setTo] = useState(isCurrency ? 'USD' : t.id === 'temperatureConv' ? 'F' : baseUnits[1] || list[1] || list[0] || '');
  const [out, setOut] = useState('');
  const [rateInfo, setRateInfo] = useState<{ isLive: boolean; isCached: boolean; source: string; rate: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const units =
    t.id === 'fuelConv'
      ? ['km/L', 'L/100km', 'mpg (US)']
      : t.id === 'radiationConv'
      ? ['Gy', 'rad', 'Sv', 'rem']
      : isCurrency
      ? ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'SGD', 'HKD', 'NZD', 'ZAR', 'BRL', 'MXN', 'KRW', 'THB', 'MYR']
      : t.id === 'temperatureConv'
      ? ['C', 'F', 'K', 'R']
      : baseIds.includes(t.id)
      ? baseUnits
      : list;

  const calc = async () => {
    let r = '';
    try {
      if (baseIds.includes(t.id)) {
        const base = Number(from),
          target = Number(to),
          raw = v.trim().toUpperCase();
        if (!raw || !Number.isInteger(base) || !Number.isInteger(target) || base < 2 || base > 36 || target < 2 || target > 36 || !/^[0-9A-Z]+$/.test(raw) || [...raw].some((ch) => Number.parseInt(ch, 36) >= base))
          throw 0;
        const nVal = Number.parseInt(raw, base);
        if (!Number.isSafeInteger(nVal) || nVal < 0) throw 0;
        r = nVal.toString(target).toUpperCase();
      } else if (t.id === 'electricityConv') {
        const x = num(v);
        const compatible =
          (from === 'V' && to === 'V') ||
          (from === 'A' && to === 'A') ||
          (from === 'W' && to === 'W') ||
          (from === 'Ohm' && to === 'Ohm') ||
          (from === 'C' && to === 'C') ||
          (from === 'J' && to === 'J') ||
          (from === 'kWh' && to === 'kWh') ||
          (from === 'VA' && to === 'VA') ||
          (from === 'kVA' && to === 'kVA') ||
          (from === 'VA' && to === 'kVA') ||
          (from === 'kVA' && to === 'VA');
        if (!compatible) throw new Error('dimension');
        r = (from === to ? x : from === 'VA' ? x / 1000 : x * 1000).toString();
      } else if (t.id === 'radiationConv') {
        const x = num(v);
        const dose = ['Gy', 'rad'];
        const equivalent = ['Sv', 'rem'];
        if (dose.includes(from) && dose.includes(to)) {
          r = fmt(x * (from === 'Gy' && to === 'rad' ? 100 : from === 'rad' && to === 'Gy' ? 0.01 : 1));
        } else if (equivalent.includes(from) && equivalent.includes(to)) {
          r = fmt(x * (from === 'Sv' && to === 'rem' ? 100 : from === 'rem' && to === 'Sv' ? 0.01 : 1));
        } else throw new Error('dimension');
      } else if (t.id === 'fuelConv') {
        const x = num(v);
        if (x < 0) throw 0;
        const kmL = from === 'km/L' ? x : from === 'L/100km' ? 100 / x : from === 'mpg (US)' ? x / 2.35214583 : 0;
        r = fmt(to === 'km/L' ? kmL : to === 'L/100km' ? 100 / kmL : kmL * 2.35214583);
      } else if (t.id === 'temperatureConv') {
        const x = num(v);
        const c = from === 'C' ? x : from === 'F' ? ((x - 32) * 5) / 9 : from === 'K' ? x - 273.15 : ((x - 491.67) * 5) / 9;
        r = fmt(to === 'C' ? c : to === 'F' ? (c * 9) / 5 + 32 : to === 'K' ? c + 273.15 : (c * 9) / 5 + 491.67);
      } else if (isCurrency) {
        if (from === to) {
          r = fmt(num(v));
          setRateInfo({ isLive: true, isCached: false, source: 'Exact Identity', rate: 1 });
        } else {
          setBusy(true);
          const res = await getCurrencyRate(from, to);
          r = fmt(num(v) * res.rate);
          setRateInfo({ isLive: res.isLive, isCached: res.isCached, source: res.source, rate: res.rate });
        }
      } else if (def) {
        r = fmt((num(v) * (def.factor[from] || 1)) / (def.factor[to] || 1));
      } else if (t.id === 'electricityConv') {
        r = 'Electrical quantities (V, A, W, Ω) are different dimensions. Use Electrical Power / Ohm’s Law.';
      } else {
        r = 'Tool-specific calculation';
      }
      setOut(r);
      if (r && !r.startsWith('Electrical quantities')) {
        save(t.title, v + ' ' + (labels[from] || from) + ' = ' + r + ' ' + (labels[to] || to));
      }
    } catch {
      setOut(baseIds.includes(t.id) ? 'Invalid value for selected base' : 'Please check values and units.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    calc();
  }, [v, from, to]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={back}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: '#E4EEFF',
            color: '#17345F',
            fontSize: 24,
            fontWeight: 900,
          }}
        >
          ‹
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#142449' }}>{t.title}</h2>
      </div>

      <p style={{ fontSize: 12, color: '#5D7192' }}>{t.desc}</p>

      <div>
        <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
          VALUE TO CONVERT
        </label>
        <input
          type="text"
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="Enter number, e.g. 10"
          style={{
            width: '100%',
            height: 48,
            borderRadius: 14,
            backgroundColor: '#FFF',
            border: '1px solid #CFE0F8',
            padding: '0 14px',
            fontSize: 16,
            fontWeight: 700,
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
          FROM UNIT / BASE
        </label>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
          {units.map((u) => (
            <button
              type="button"
              key={u}
              onClick={() => setFrom(u)}
              style={{
                padding: '8px 12px',
                borderRadius: 14,
                backgroundColor: from === u ? '#176cff' : '#E7F0FF',
                color: from === u ? '#FFF' : '#1B3157',
                border: '1px solid',
                borderColor: from === u ? '#5bb8ff' : '#C8DDFB',
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {labels[u] || u}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
          TO UNIT / BASE
        </label>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
          {units.map((u) => (
            <button
              type="button"
              key={u}
              onClick={() => setTo(u)}
              style={{
                padding: '8px 12px',
                borderRadius: 14,
                backgroundColor: to === u ? '#176cff' : '#E7F0FF',
                color: to === u ? '#FFF' : '#1B3157',
                border: '1px solid',
                borderColor: to === u ? '#5bb8ff' : '#C8DDFB',
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {labels[u] || u}
            </button>
          ))}
        </div>
      </div>

      {out && (
        <div
          style={{
            padding: 16,
            borderRadius: 18,
            backgroundColor: '#092f36',
            border: '1px solid #21828b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, color: '#64ddd6', fontWeight: 900, letterSpacing: '1.4px' }}>
              ⚡ LIVE RESULT
            </div>
            {isCurrency && rateInfo && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 8,
                  backgroundColor: rateInfo.isLive
                    ? rateInfo.isCached
                      ? '#0D3325'
                      : '#064E3B'
                    : rateInfo.isCached
                    ? '#172554'
                    : '#3B2F04',
                  color: rateInfo.isLive
                    ? rateInfo.isCached
                      ? '#A7F3D0'
                      : '#6EE7B7'
                    : rateInfo.isCached
                    ? '#93C5FD'
                    : '#FDE047',
                  border: `1px solid ${
                    rateInfo.isLive ? '#10B981' : rateInfo.isCached ? '#3B82F6' : '#EAB308'
                  }`,
                }}
              >
                {rateInfo.isLive
                  ? rateInfo.isCached
                    ? '⚡ Live (Memory Cache)'
                    : '✓ Live Market Rate'
                  : rateInfo.isCached
                  ? '💾 Local Cache (Offline)'
                  : '🛡️ Calibrated Fallback Rate'}
              </span>
            )}
          </div>
          <div style={{ fontSize: 24, color: '#FFF', fontWeight: 900, marginTop: 4 }}>
            {out} {baseIds.includes(t.id) ? '' : labels[to] || to}
          </div>
          {isCurrency && rateInfo && (
            <div style={{ fontSize: 11, color: '#D8FFF9', marginTop: 6 }}>
              1 {from} = {fmt(rateInfo.rate)} {to} • Source: {rateInfo.source}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={calc}
        style={{
          height: 48,
          borderRadius: 14,
          backgroundColor: '#167cff',
          color: '#fff',
          fontWeight: 900,
          fontSize: 13,
        }}
      >
        {busy ? 'UPDATING…' : 'CONVERT NOW'}
      </button>
    </div>
  );
}

function ToolModal({
  t,
  back,
  save,
}: {
  t: Tool;
  back: () => void;
  save: (q: string, r: string) => void;
}) {
  const meta = inputMeta(t);
  const [a, setA] = useState(meta[0][1]);
  const [b, setB] = useState(meta[1][1]);
  const [cVal, setCVal] = useState(meta[2][1]);
  const [dVal, setDVal] = useState(meta[3]?.[1] || '');
  const [r, setR] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('M');

  const run = () => {
    const x = num(a),
      y = num(b),
      z = num(cVal),
      w = num(dVal);
    let q = '';
    try {
      switch (t.id) {
        case 'basic':
        case 'advanced':
          q = fmt(evalExpr(a) ?? NaN);
          break;
        case 'scientific': {
          const op = a.toLowerCase().trim();
          q =
            op === 'sin'
              ? fmt(Math.sin((y * Math.PI) / 180))
              : op === 'cos'
              ? fmt(Math.cos((y * Math.PI) / 180))
              : op === 'tan'
              ? fmt(Math.tan((y * Math.PI) / 180))
              : op === 'sqrt'
              ? fmt(Math.sqrt(y))
              : op === 'log'
              ? fmt(Math.log10(y))
              : op === 'ln'
              ? fmt(Math.log(y))
              : fmt(Math.pow(y, z));
          break;
        }
        case 'fraction': {
          const A = a.split('/').map(Number),
            B = b.split('/').map(Number);
          let den = A[1] * B[1];
          if (!Number.isFinite(A[0]) || !Number.isFinite(A[1]) || !Number.isFinite(B[0]) || !Number.isFinite(B[1]) || !A[1] || !B[1]) {
            q = 'Enter fractions like 1/2 and 3/4';
            break;
          }
          const numr = A[0] * B[1] + B[0] * A[1];
          const g = gcd(numr, den);
          q = `${numr / g}/${den / g}`;
          break;
        }
        case 'percentage':
          q = `${fmt((x * y) / 100)} (${y}% of ${x})`;
          break;
        case 'ratio': {
          const g = gcd(x, y);
          q = `${x / g}:${y / g}`;
          break;
        }
        case 'average': {
          const ar = a.split(',').map(Number).filter(Number.isFinite),
            sum = ar.reduce((p, v) => p + v, 0),
            sorted = [...ar].sort((p, v) => p - v);
          q = `Mean ${fmt(sum / ar.length)} | Median ${fmt(sorted[Math.floor((sorted.length - 1) / 2)])} | Total ${fmt(sum)}`;
          break;
        }
        case 'random':
          q = String(Math.floor(Math.random() * (y - x + 1)) + x);
          break;
        case 'algebra':
        case 'equation':
          q = `x = ${fmt((z - y) / x)}`;
          break;
        case 'quadratic': {
          const D = y * y - 4 * x * z;
          q = D < 0 ? 'No real roots' : `x₁=${fmt((-y + Math.sqrt(D)) / (2 * x))}, x₂=${fmt((-y - Math.sqrt(D)) / (2 * x))}`;
          break;
        }
        case 'exponent':
          q = fmt(Math.pow(x, y));
          break;
        case 'root':
          q = fmt(Math.pow(x, 1 / (y || 2)));
          break;
        case 'logarithm':
          q = fmt(Math.log(x) / Math.log(y || 10));
          break;
        case 'gcdlcm':
          q = `HCF ${gcd(x, y)} | LCM ${Math.abs(x * y) / gcd(x, y)}`;
          break;
        case 'prime': {
          let p = x > 1;
          for (let i = 2; i * i <= x; i++) if (x % i === 0) p = false;
          q = p ? 'PRIME' : 'NOT PRIME';
          break;
        }
        case 'factorial': {
          let fact = 1;
          for (let i = 2; i <= Math.floor(x); i++) fact *= i;
          q = fmt(fact);
          break;
        }
        case 'permutation': {
          let p = 1,
            cmb = 1;
          for (let i = 0; i < y; i++) p *= x - i;
          for (let i = 1; i <= y; i++) cmb *= i;
          q = `nPr ${fmt(p)} | nCr ${fmt(p / cmb)}`;
          break;
        }
        case 'sequence':
          q = `Next ${fmt(x + y)} | Difference ${fmt(y)}`;
          break;
        case 'matrix':
          q = `2×2 determinant: ${fmt(x * z - y * num(cVal))}`;
          break;
        case 'emi':
        case 'loan':
        case 'mortgage': {
          const m = y / 1200,
            N = z * 12,
            e = m ? (x * m * Math.pow(1 + m, N)) / (Math.pow(1 + m, N) - 1) : x / N;
          q = `EMI ${money(e)}/month | Total ${money(e * N)} | Interest ${money(e * N - x)}`;
          break;
        }
        case 'interest': {
          const si = (x * y * z) / 100,
            ci = x * (Math.pow(1 + y / 100, z) - 1);
          q = `Simple interest ${money(si)} | Compound interest ${money(ci)}`;
          break;
        }
        case 'simpleInterest': {
          const i = (x * y * z) / 100;
          q = `Interest ${money(i)} | Maturity ${money(x + i)}`;
          break;
        }
        case 'compoundInterest': {
          const v = x * Math.pow(1 + y / 100, z);
          q = `Maturity ${money(v)} | Interest ${money(v - x)}`;
          break;
        }
        case 'sip': {
          const m = y / 1200,
            N = z * 12,
            v = m ? x * ((Math.pow(1 + m, N) - 1) / m) * (1 + m) : x * N;
          q = `Future ${money(v)} | Invested ${money(x * N)} | Gain ${money(v - x * N)}`;
          break;
        }
        case 'lumpsum':
          q = `Future ${money(x * Math.pow(1 + y / 100, z))}`;
          break;
        case 'fd': {
          const v = x * Math.pow(1 + y / 400, z * 4);
          q = `Maturity ${money(v)} | Interest ${money(v - x)}`;
          break;
        }
        case 'rd': {
          const N = z * 12,
            m = y / 400,
            v = x * ((Math.pow(1 + m, N) - 1) / m) * (1 + m);
          q = `Maturity ${money(v)} | Deposited ${money(x * N)}`;
          break;
        }
        case 'ppf': {
          let v = 0;
          for (let i = 0; i < z; i++) v = (v + x) * (1 + y / 100);
          q = `Estimated value ${money(v)}`;
          break;
        }
        case 'gst': {
          const tax = (x * y) / 100;
          q = `GST ${money(tax)} | Total with GST ${money(x + tax)} | Base ${money(x)}`;
          break;
        }
        case 'incomeTax':
          q = `Taxable income ${money(Math.max(0, x - y))}. Verify current tax rules.`;
          break;
        case 'salary':
          q = `Monthly gross ${money(x / 12)} | After deduction ${money(Math.max(0, x / 12 - y))}`;
          break;
        case 'discount':
          q = `Saving ${money((x * y) / 100)} | Sale price ${money(x - (x * y) / 100)}`;
          break;
        case 'profit': {
          const p = y - x,
            margin = y ? (Math.abs(p) / y) * 100 : 0,
            markup = x ? (Math.abs(p) / x) * 100 : 0;
          q = `${p >= 0 ? 'Profit' : 'Loss'} ${money(Math.abs(p))} | Margin ${fmt(margin)}% | Markup ${fmt(markup)}%`;
          break;
        }
        case 'markup':
          q = `Selling price ${money(x * (1 + y / 100))}`;
          break;
        case 'inflation':
          q = `Future price ${money(x * Math.pow(1 + y / 100, z))}`;
          break;
        case 'bmi':
          q = `BMI ${fmt(x / Math.pow(y / 100, 2))}`;
          break;
        case 'bmr':
        case 'calorie':
        case 'tdee':
          q = `BMR ${fmt(sex === 'M' ? 10 * x + 6.25 * y - 5 * z + 5 : 10 * x + 6.25 * y - 5 * z - 161)} kcal/day`;
          break;
        case 'idealWeight':
          q = `Devine estimate ${fmt((sex === 'M' ? 50 : 45.5) + 2.3 * Math.max(0, (x - 152.4) / 2.54))} kg`;
          break;
        case 'water':
          q = `About ${fmt(x * 0.033)} L/day`;
          break;
        case 'pace':
          q = `${fmt(x / y)} min/km`;
          break;
        case 'roundBarWeight': {
          const d = x / 1000,
            L = y,
            rho = z;
          const vol = (Math.PI * d * d * L) / 4;
          q = `वजन ${fmt(vol * rho)} kg | Area ${fmt(((Math.PI * d * d) / 4) * 1e6)} mm² | Volume ${fmt(vol)} m³`;
          break;
        }
        case 'pipeWeight': {
          const D = x / 1000,
            tVal = y / 1000,
            L = z,
            rho = w || 7850;
          const di = D - 2 * tVal;
          if (di <= 0) {
            q = 'OD और wall thickness सही डालें';
            break;
          }
          const area = (Math.PI / 4) * (D * D - di * di);
          const vol = area * L;
          q = `Pipe ID ${fmt(di * 1000)} mm | वजन ${fmt(vol * rho)} kg | ${fmt(area * rho)} kg/m`;
          break;
        }
        default:
          q = 'Enter values and calculate.';
      }
    } catch {
      q = 'Please check values and try again.';
    }
    setR(q);
    save(t.title, q);
  };

  useEffect(() => {
    run();
  }, [a, b, cVal, dVal, sex, t.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={back}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: '#E4EEFF',
            color: '#17345F',
            fontSize: 24,
            fontWeight: 900,
          }}
        >
          ‹
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#142449' }}>{t.title}</h2>
      </div>

      <p style={{ fontSize: 12, color: '#5D7192' }}>{t.desc}</p>

      {['bmr', 'calorie', 'tdee', 'idealWeight', 'bodyFat'].includes(t.id) && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setSex('M')}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 12,
              backgroundColor: sex === 'M' ? '#176CFF' : '#10213a',
              color: '#fff',
              fontWeight: 800,
            }}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setSex('F')}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 12,
              backgroundColor: sex === 'F' ? '#176CFF' : '#10213a',
              color: '#fff',
              fontWeight: 800,
            }}
          >
            Female
          </button>
        </div>
      )}

      {meta.map(([lab, val], i) =>
        lab === '—' ? null : (
          <div key={lab}>
            <label style={{ display: 'block', fontSize: 10, color: '#5D7192', fontWeight: 900, marginBottom: 5 }}>
              {lab}
            </label>
            <input
              type="text"
              value={i === 0 ? a : i === 1 ? b : i === 2 ? cVal : dVal}
              onChange={(e) => {
                const v = e.target.value;
                if (i === 0) setA(v);
                else if (i === 1) setB(v);
                else if (i === 2) setCVal(v);
                else setDVal(v);
              }}
              placeholder={val}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 14,
                backgroundColor: '#FFF',
                border: '1px solid #CFE0F8',
                padding: '0 14px',
                fontSize: 14,
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>
        )
      )}

      {r && (
        <div
          style={{
            padding: 16,
            borderRadius: 18,
            backgroundColor: '#092f36',
            border: '1px solid #21828b',
          }}
        >
          <div style={{ fontSize: 10, color: '#64ddd6', fontWeight: 900, letterSpacing: '1.4px' }}>
            ⚡ LIVE RESULT
          </div>
          <div style={{ fontSize: 20, color: '#FFF', fontWeight: 900, marginTop: 4 }}>{r}</div>
        </div>
      )}

      <button
        type="button"
        onClick={run}
        style={{
          height: 48,
          borderRadius: 14,
          backgroundColor: '#167cff',
          color: '#fff',
          fontWeight: 900,
          fontSize: 13,
        }}
      >
        RECALCULATE
      </button>
    </div>
  );
}

/* 3D CHESS IMPLEMENTATION */
const START_CHESS = ['rnbqkbnr', 'pppppppp', '........', '........', '........', '........', 'PPPPPPPP', 'RNBQKBNR'];
const CHESS_GLYPH: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

function freshBoard() {
  return START_CHESS.map((r) => r.split(''));
}

function chessMoves(board: string[][], r: number, c: number): [number, number][] {
  const p = board[r][c];
  if (!p || p === '.') return [];
  const white = p === p.toUpperCase(),
    kind = p.toLowerCase(),
    out: [number, number][] = [],
    inside = (y: number, x: number) => y >= 0 && y < 8 && x >= 0 && x < 8,
    enemy = (y: number, x: number) =>
      inside(y, x) && board[y][x] !== '.' && (board[y][x] === board[y][x].toUpperCase()) !== white,
    empty = (y: number, x: number) => inside(y, x) && board[y][x] === '.',
    add = (y: number, x: number) => {
      if (empty(y, x)) out.push([y, x]);
      else if (enemy(y, x)) out.push([y, x]);
    };

  if (kind === 'p') {
    const d = white ? -1 : 1,
      start = white ? 6 : 1;
    if (empty(r + d, c)) {
      out.push([r + d, c]);
      if (r === start && empty(r + 2 * d, c)) out.push([r + 2 * d, c]);
    }
    for (const dx of [-1, 1]) if (enemy(r + d, c + dx)) out.push([r + d, c + dx]);
    return out;
  }
  if (kind === 'n') {
    for (const [dy, dx] of [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ])
      if (inside(r + dy, c + dx) && (empty(r + dy, c + dx) || enemy(r + dy, c + dx))) out.push([r + dy, c + dx]);
    return out;
  }
  const dirs: [number, number][] = [];
  if (['r', 'q'].includes(kind)) dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
  if (['b', 'q'].includes(kind)) dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  if (kind === 'k') {
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        if ((dy || dx) && inside(r + dy, c + dx) && (empty(r + dy, c + dx) || enemy(r + dy, c + dx)))
          out.push([r + dy, c + dx]);
    return out;
  }
  for (const [dy, dx] of dirs) {
    let y = r + dy,
      x = c + dx;
    while (inside(y, x)) {
      if (empty(y, x)) out.push([y, x]);
      else {
        if (enemy(y, x)) out.push([y, x]);
        break;
      }
      y += dy;
      x += dx;
    }
  }
  return out;
}

function ChessArena() {
  const [board, setBoard] = useState<string[][]>(() => freshBoard());
  const [whiteTurn, setWhiteTurn] = useState(true);
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState('White to move');
  const legal = sel ? chessMoves(board, sel[0], sel[1]) : [];

  const tap = (r: number, c: number) => {
    const p = board[r][c];
    if (sel) {
      if (legal.some(([y, x]) => y === r && x === c)) {
        const next = board.map((row) => row.slice());
        const piece = next[sel[0]][sel[1]];
        next[r][c] = piece;
        next[sel[0]][sel[1]] = '.';
        if (piece === 'P' && r === 0) next[r][c] = 'Q';
        if (piece === 'p' && r === 7) next[r][c] = 'q';
        setBoard(next);
        setWhiteTurn(!whiteTurn);
        setStatus(!whiteTurn ? 'White to move' : 'Black to move');
        setSel(null);
        return;
      }
      if (p !== '.' && (p === p.toUpperCase()) === whiteTurn) {
        setSel([r, c]);
        return;
      }
      setSel(null);
      return;
    }
    if (p !== '.' && (p === p.toUpperCase()) === whiteTurn) setSel([r, c]);
  };

  const reset = () => {
    setBoard(freshBoard());
    setWhiteTurn(true);
    setSel(null);
    setStatus('White to move');
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        border: '1px solid #D7E6FA',
        boxShadow: '0 8px 24px rgba(36, 82, 140, 0.12)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            backgroundColor: '#286FF0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            color: '#FFF',
          }}
        >
          ♞
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#142449' }}>3D Chess Arena</h2>
          <div style={{ fontSize: 11, color: '#617493' }}>Classic two-player chess • Pass & play</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 14,
          backgroundColor: '#EDF4FF',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: whiteTurn ? '#FFFFFF' : '#18264A',
            border: '2px solid #7185A7',
          }}
        />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: '#1A2D52' }}>{status}</span>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '6px 12px',
            borderRadius: 10,
            backgroundColor: '#D7E8FF',
            color: '#1769F5',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          ↻ Reset
        </button>
      </div>

      {/* Board */}
      <div
        style={{
          maxWidth: 440,
          margin: '0 auto',
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          overflow: 'hidden',
          border: '3px solid #17345F',
          boxShadow: '0 8px 24px rgba(23, 52, 95, 0.2)',
        }}
      >
        {board.map((row, r) => (
          <div key={r} style={{ flex: 1, display: 'flex' }}>
            {row.map((p, col) => {
              const selected = !!sel && sel[0] === r && sel[1] === col;
              const target = legal.some(([y, x]) => y === r && x === col);
              const isLight = (r + col) % 2 === 0;
              const isPiece = p !== '.';
              const isWhitePiece = isPiece && p === p.toUpperCase();

              return (
                <button
                  type="button"
                  key={col}
                  onClick={() => tap(r, col)}
                  style={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: selected ? '#F7D76A' : isLight ? '#E7F0FF' : '#6C91C7',
                    border: target ? '2px solid #32BFA3' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    fontWeight: 900,
                    userSelect: 'none',
                  }}
                >
                  <span
                    style={{
                      color: isWhitePiece ? '#FFFFFF' : '#17294D',
                      textShadow: isWhitePiece
                        ? '0 2px 4px rgba(24, 61, 115, 0.8), 0 0 2px #000'
                        : '0 1px 2px rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {isPiece ? CHESS_GLYPH[p] : ''}
                  </span>
                  {target && p === '.' && (
                    <span
                      style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: '#1BBA98',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: '#617493', marginTop: 12, textAlign: 'center' }}>
        Tap a piece, then tap a highlighted square. Pawns promote to queens automatically.
      </div>
    </div>
  );
}

function AIChat() {
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<{ q: string; a: string }[]>([
    {
      q: 'Calculate 25% of 480',
      a: '120 is 25% of 480.',
    },
  ]);

  const ask = () => {
    const text = q.trim();
    if (!text || busy) return;
    setQ('');
    setBusy(true);

    let answer = '';
    const nums = (text.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    const low = text.toLowerCase();

    if (/od/.test(low) && /length|लंब|मीटर|m\b/.test(low) && nums.length >= 2 && !/pipe|पाइप|wall|thickness|मोट/.test(low)) {
      const d = nums[0] / 1000,
        L = nums[1],
        rho = 7850;
      const kg = ((Math.PI * d * d) / 4) * L * rho;
      answer = `OD ${nums[0]} mm और length ${L} m को solid steel round bar मानकर exact theoretical weight = ${fmt(kg)} kg.`;
    } else if (/percent|%/.test(low) && nums.length >= 2) {
      answer = `${fmt((nums[0] * nums[1]) / 100)} is ${nums[1]}% of ${nums[0]}.`;
    } else if (/gst/.test(low) && nums.length >= 2) {
      answer = `GST ${nums[1]}% = ₹${fmt((nums[0] * nums[1]) / 100)}; total = ₹${fmt(nums[0] * (1 + nums[1] / 100))}.`;
    } else {
      const z = evalExpr(text);
      if (z !== null) {
        answer = `Result = ${fmt(z)}`;
      } else {
        answer = `SmartCalc AI: Calculation recognized. Type any arithmetic, percentage, GST or motor inquiry to compute instantly.`;
      }
    }

    setMsgs((m) => [...m, { q: text, a: answer }]);
    setBusy(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: '#DDEEFF',
          border: '1px solid #B7D9FF',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: '#176CFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#FFF',
          }}
        >
          ✦
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#142449' }}>SmartCalc AI Chat</h2>
          <div style={{ fontSize: 11, color: '#526888' }}>
            Hindi + English • calculations + step-by-step solutions
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: 16,
                backgroundColor: '#2877F6',
                color: '#FFF',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {m.q}
            </div>
            <div
              style={{
                alignSelf: 'flex-start',
                maxWidth: '90%',
                padding: '12px 14px',
                borderRadius: 16,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D7E6FA',
                color: '#142449',
                fontSize: 13,
                lineHeight: '20px',
              }}
            >
              {m.a}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Hindi ya English me kuch bhi puchho…"
          style={{
            flex: 1,
            height: 48,
            borderRadius: 14,
            backgroundColor: '#FFF',
            border: '1px solid #CFE0F8',
            padding: '0 14px',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={ask}
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: '#176cff',
            color: '#fff',
            fontSize: 18,
            fontWeight: 900,
          }}
        >
          {busy ? '…' : '➤'}
        </button>
      </div>
      <div style={{ fontSize: 11, color: '#718aaa' }}>
        Examples: “25% of 480” • “18% GST on 25000” • “1250 * 4 + 500”
      </div>
    </div>
  );
}

function CreatorProfile() {
  return (
    <div
      style={{
        marginTop: 20,
        padding: 18,
        borderRadius: 22,
        backgroundColor: '#091A3E',
        color: '#FFF',
        border: '1px solid #2B5797',
        boxShadow: '0 12px 28px rgba(9, 26, 62, 0.4)',
      }}
    >
      <div style={{ fontSize: 10, color: '#6FEFFF', fontWeight: 900, letterSpacing: '2px', marginBottom: 10 }}>
        CREATOR PROFILE
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: '#102957',
            border: '2px solid #69EFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 900,
            color: '#FFF',
          }}
        >
          SR
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '1px' }}>SURAJ RAI</div>
          <div style={{ fontSize: 11, color: '#A8B7D8' }}>Creator • Developer • SmartCalc AI</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#A8B7D8', lineHeight: '18px', marginTop: 12 }}>
        SmartCalc AI is designed, developed and maintained by Suraj Rai to solve real-world calculation, conversion, and manufacturing challenges.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {[
          ['YouTube', '▶', 'https://www.youtube.com/@SanatanMythologyTales'],
          ['Instagram', '◎', 'https://www.instagram.com/surajraiking'],
          ['Facebook', 'f', 'https://www.facebook.com/surajraiking21'],
        ].map(([name, icon, url]) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 12,
              backgroundColor: '#142E61',
              border: '1px solid #2C527A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            <span style={{ color: '#72EDFF', fontSize: 16 }}>{icon}</span>
            <span>{name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function SmartCalc({ onBackToUniversal }: { onBackToUniversal: () => void }) {
  const [tab, setTab] = useState<Tab>('home');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hist, setHist] = useState<{ q: string; r: string }[]>([]);

  const save = (q: string, r: string) => setHist((h) => [{ q, r }, ...h].slice(0, 100));

  const filteredTools = useMemo(
    () =>
      tools.filter(
        (t) =>
          (category === 'All' || t.category === category) &&
          `${t.title} ${t.desc} ${t.category}`.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [category, searchQuery]
  );

  const activeTool = selectedTool ? tools.find((t) => t.id === selectedTool) : null;

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '16px 16px 100px' }}>
      {/* Top bar with back to universal */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={onBackToUniversal}
          style={{
            padding: '8px 14px',
            borderRadius: 14,
            backgroundColor: '#E4EEFF',
            color: '#17345F',
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>‹</span> UNIVERSAL HUB
        </button>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => {
              setSelectedTool(null);
              setTab('tools');
              setCategory('All');
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 12,
              backgroundColor: '#E4EEFF',
              color: '#1769F5',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            ⌕ Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedTool(null);
              setTab('chess');
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 12,
              backgroundColor: '#D9F9EF',
              color: '#0E8569',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            ♞ Chess
          </button>
        </div>
      </div>

      {/* Render active tool if open */}
      {activeTool ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 20,
            border: '1px solid #DCE7F7',
            boxShadow: '0 8px 24px rgba(23, 59, 130, 0.06)',
          }}
        >
          {activeTool.converter ? (
            <ConverterModal t={activeTool} back={() => setSelectedTool(null)} save={save} />
          ) : (
            <ToolModal t={activeTool} back={() => setSelectedTool(null)} save={save} />
          )}
        </div>
      ) : (
        <>
          {/* TAB: HOME */}
          {tab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Hero Banner */}
              <div
                style={{
                  padding: 22,
                  borderRadius: 26,
                  backgroundColor: '#287BFF',
                  border: '1px solid #66E6FF',
                  color: '#FFF',
                  boxShadow: '0 10px 24px rgba(59, 86, 232, 0.3)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 900, color: '#CFFBFF', letterSpacing: '1px' }}>
                  ✦ SMARTCALC AI ENGINE
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Calculate Anything</h2>
                <p style={{ fontSize: 12, color: '#EAF5FF', marginTop: 4 }}>Fast • Accurate • Smart</p>
              </div>

              {/* Full Keypad Calculator */}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111B3C', marginBottom: 10 }}>
                  🧮 Interactive Calculator
                </h3>
                <BasicKeypad onResult={(res) => save('Calculator', res)} />
              </div>

              {/* Quick Categories */}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111B3C', marginBottom: 10 }}>
                  ▦ Categories
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {[
                    ['Calculators', '🧮', '#D8EEFF'],
                    ['Math', '📐', '#C8F8FF'],
                    ['Finance', '💰', '#F8D8FF'],
                    ['Health & Fitness', '❤️', '#D9FFD1'],
                    ['Date & Time', '🗓', '#FFE0D8'],
                    ['Construction / Engineering', '🏗', '#FFE6B7'],
                    ['Length', '📏', '#D7EDFF'],
                    ['Currency', '💱', '#E7D8FF'],
                  ].map(([cat, icon, bg]) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setTab('tools');
                      }}
                      style={{
                        padding: 14,
                        borderRadius: 18,
                        backgroundColor: bg,
                        border: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 6,
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color: '#111B3C' }}>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Chess Promo Banner */}
              <button
                type="button"
                onClick={() => setTab('chess')}
                style={{
                  padding: 16,
                  borderRadius: 22,
                  backgroundColor: '#EBDFFF',
                  border: '1px solid #C7A7FF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'left',
                  boxShadow: '0 8px 20px rgba(101, 65, 181, 0.15)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: '#7138E8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32,
                    color: '#FFF',
                  }}
                >
                  ♞
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#24104F' }}>3D Chess Arena</div>
                  <div style={{ fontSize: 11, color: '#614A8A', marginTop: 2 }}>
                    Classic two-player chess • Play right here
                  </div>
                </div>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#7138E8' }}>›</span>
              </button>

              {/* Quick Tools list */}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111B3C', marginBottom: 10 }}>
                  ⚡ Popular Tools
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                  {tools.slice(0, 12).map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setSelectedTool(t.id)}
                      style={{
                        padding: 12,
                        borderRadius: 18,
                        backgroundColor: '#FFF',
                        border: '1px solid #D7E6FA',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#142449' }}>{t.title}</span>
                      <span style={{ fontSize: 10, color: '#6680A3', marginTop: 4 }}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Profile */}
              <CreatorProfile />
            </div>
          )}

          {/* TAB: TOOLS / SEARCH */}
          {tab === 'tools' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search calculator, converter or engineering tool..."
                style={{
                  height: 50,
                  borderRadius: 16,
                  backgroundColor: '#FFF',
                  border: '1px solid #D5E4FA',
                  padding: '0 16px',
                  fontSize: 14,
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCategory(c)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 16,
                      backgroundColor: category === c ? '#176cff' : '#E7F0FF',
                      color: category === c ? '#FFF' : '#1B3157',
                      border: '1px solid',
                      borderColor: category === c ? '#5bb8ff' : '#C8DDFB',
                      fontSize: 11,
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: '#5D7192' }}>
                {filteredTools.length} tools available in {category}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {filteredTools.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTool(t.id)}
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      backgroundColor: '#FFF',
                      border: '1px solid #D7E6FA',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: '#2877F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontSize: 16,
                        marginBottom: 8,
                      }}
                    >
                      {t.icon}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#152448' }}>{t.title}</span>
                    <span style={{ fontSize: 11, color: '#526888', marginTop: 4, lineHeight: '16px' }}>{t.desc}</span>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#176cff', marginTop: 10 }}>
                      OPEN TOOL ›
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CHESS */}
          {tab === 'chess' && <ChessArena />}

          {/* TAB: AI CHAT */}
          {tab === 'chat' && <AIChat />}

          {/* TAB: HISTORY */}
          {tab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#142449' }}>Calculation History</h2>
                {hist.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHist([])}
                    style={{ fontSize: 12, fontWeight: 800, color: '#E11D48' }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              {hist.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#5D7192' }}>
                  <div style={{ fontSize: 40 }}>◷</div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 10 }}>No calculation history yet</div>
                </div>
              ) : (
                hist.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      backgroundColor: '#FFF',
                      border: '1px solid #D7E6FA',
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#526888' }}>{item.q}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#142449', marginTop: 4 }}>
                      {item.r}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Fixed bottom navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #DCE7F7',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 100,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
        }}
      >
        {[
          ['home', '⌂', 'Home'],
          ['tools', '⌕', 'Search'],
          ['chess', '♞', 'Chess'],
          ['chat', '✦', 'AI Chat'],
          ['history', '◷', 'History'],
        ].map(([id, ic, lab]) => {
          const active = tab === id && !selectedTool;
          return (
            <button
              type="button"
              key={id}
              onClick={() => {
                setSelectedTool(null);
                setTab(id as Tab);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                color: active ? '#1769F5' : '#7485A1',
              }}
            >
              <span style={{ fontSize: 20 }}>{ic}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{lab}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
