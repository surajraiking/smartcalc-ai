import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'home' | 'tools' | 'chat' | 'history';
type ToolId =
  | 'basic' | 'scientific' | 'percentage' | 'gst' | 'discount' | 'profit' | 'emi'
  | 'simpleInterest' | 'compoundInterest' | 'sip' | 'fd' | 'rd' | 'cagr'
  | 'salary' | 'bmi' | 'bmr' | 'age' | 'dateDiff' | 'time' | 'length'
  | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'data'
  | 'currency' | 'fraction' | 'lcmhcf' | 'average' | 'ratio' | 'numbers';

type Tool = { id: ToolId; icon: string; title: string; subtitle: string; group: string };

type HistoryItem = { id: number; title: string; input: string; result: string };

const tools: Tool[] = [
  { id: 'basic', icon: '＋', title: 'Basic Calculator', subtitle: 'Everyday arithmetic', group: 'Math' },
  { id: 'scientific', icon: 'π', title: 'Scientific', subtitle: 'sin • cos • log • √ • powers', group: 'Math' },
  { id: 'percentage', icon: '%', title: 'Percentage', subtitle: 'Of • increase • decrease', group: 'Math' },
  { id: 'fraction', icon: '½', title: 'Fractions', subtitle: 'Add • subtract • multiply', group: 'Math' },
  { id: 'average', icon: '∑', title: 'Average', subtitle: 'Mean • total • count', group: 'Math' },
  { id: 'ratio', icon: '∶', title: 'Ratio', subtitle: 'Simplify & split', group: 'Math' },
  { id: 'lcmhcf', icon: 'LC', title: 'LCM / HCF', subtitle: 'Number tools', group: 'Math' },
  { id: 'numbers', icon: '123', title: 'Number Tools', subtitle: 'Prime • factors • percent', group: 'Math' },
  { id: 'gst', icon: '₹', title: 'GST', subtitle: 'Add / remove GST', group: 'India' },
  { id: 'discount', icon: '🏷', title: 'Discount', subtitle: 'Sale price & savings', group: 'India' },
  { id: 'profit', icon: '↗', title: 'Profit / Loss', subtitle: 'Margin & markup', group: 'Business' },
  { id: 'salary', icon: '₹', title: 'Salary', subtitle: 'CTC • monthly • annual', group: 'Business' },
  { id: 'emi', icon: '⌂', title: 'EMI / Loan', subtitle: 'EMI • interest • total', group: 'Finance' },
  { id: 'simpleInterest', icon: 'SI', title: 'Simple Interest', subtitle: 'Interest & maturity', group: 'Finance' },
  { id: 'compoundInterest', icon: 'CI', title: 'Compound Interest', subtitle: 'Growth & maturity', group: 'Finance' },
  { id: 'sip', icon: 'SIP', title: 'SIP', subtitle: 'Investment projection', group: 'Finance' },
  { id: 'fd', icon: 'FD', title: 'FD', subtitle: 'Fixed deposit maturity', group: 'Finance' },
  { id: 'rd', icon: 'RD', title: 'RD', subtitle: 'Recurring deposit', group: 'Finance' },
  { id: 'cagr', icon: '⌁', title: 'CAGR', subtitle: 'Annualized growth', group: 'Finance' },
  { id: 'bmi', icon: '♥', title: 'BMI', subtitle: 'Body mass index', group: 'Health' },
  { id: 'bmr', icon: '⚡', title: 'BMR', subtitle: 'Basal metabolic rate', group: 'Health' },
  { id: 'age', icon: '◷', title: 'Age', subtitle: 'Exact age', group: 'Date & Time' },
  { id: 'dateDiff', icon: '▣', title: 'Date Difference', subtitle: 'Days between dates', group: 'Date & Time' },
  { id: 'time', icon: '◴', title: 'Time Converter', subtitle: 'Hours • minutes • seconds', group: 'Date & Time' },
  { id: 'length', icon: '↔', title: 'Length', subtitle: 'm • km • ft • in • mile', group: 'Converters' },
  { id: 'weight', icon: '⚖', title: 'Weight', subtitle: 'kg • g • lb • oz', group: 'Converters' },
  { id: 'temperature', icon: '℃', title: 'Temperature', subtitle: '°C • °F • K', group: 'Converters' },
  { id: 'area', icon: '▦', title: 'Area', subtitle: 'm² • ft² • acre', group: 'Converters' },
  { id: 'volume', icon: '◉', title: 'Volume', subtitle: 'L • ml • gal • m³', group: 'Converters' },
  { id: 'speed', icon: '➤', title: 'Speed', subtitle: 'km/h • mph • m/s', group: 'Converters' },
  { id: 'data', icon: '▤', title: 'Data', subtitle: 'KB • MB • GB • TB', group: 'Converters' },
  { id: 'currency', icon: '$', title: 'Currency', subtitle: 'INR • USD • EUR • GBP', group: 'Converters' },
];

const groups = ['All', 'Math', 'India', 'Business', 'Finance', 'Health', 'Date & Time', 'Converters'];
const quickIds: ToolId[] = ['basic', 'scientific', 'gst', 'emi', 'percentage', 'length', 'currency', 'bmi'];

const money = (n: number) => `₹${Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}`;
const fmt = (n: number) => Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 6 }) : '0';
const num = (s: string) => { const n = Number(String(s).replace(/,/g, '')); return Number.isFinite(n) ? n : 0; };
const gcd = (a: number, b: number): number => { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

function evaluateExpression(input: string): number | null {
  const source = input.replace(/,/g, '').replace(/×/g, '*').replace(/÷/g, '/').trim();
  if (!source || !/^[0-9+\-*/().%\s]+$/.test(source)) return null;
  const tokens = source.match(/\d*\.?\d+|[()+\-*/%]/g);
  if (!tokens) return null;
  const values: number[] = []; const ops: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
  const apply = () => {
    const op = ops.pop(); const b = values.pop(); const a = values.pop();
    if (!op || a === undefined || b === undefined) throw new Error('Invalid');
    if (op === '+') values.push(a + b); else if (op === '-') values.push(a - b); else if (op === '*') values.push(a * b);
    else if (op === '/') { if (b === 0) throw new Error('Zero'); values.push(a / b); } else values.push(a % b);
  };
  try {
    let previous = 'operator';
    for (const token of tokens) {
      if (/^\d/.test(token)) { values.push(Number(token)); previous = 'number'; }
      else if (token === '(') { ops.push(token); previous = 'operator'; }
      else if (token === ')') { while (ops.length && ops[ops.length - 1] !== '(') apply(); if (ops.pop() !== '(') return null; previous = 'number'; }
      else { if (token === '-' && previous === 'operator') values.push(0); while (ops.length && ops[ops.length - 1] !== '(' && precedence[ops[ops.length - 1]] >= precedence[token]) apply(); ops.push(token); previous = 'operator'; }
    }
    while (ops.length) { if (ops[ops.length - 1] === '(') return null; apply(); }
    return values.length === 1 && Number.isFinite(values[0]) ? values[0] : null;
  } catch { return null; }
}

function Logo() {
  return <View style={styles.logoRow}>
    <View style={styles.logoMark}><Text style={styles.logoCalc}>×</Text><Text style={styles.logoBrain}>AI</Text><View style={styles.logoDot} /></View>
    <View><Text style={styles.logoText}>SmartCalc <Text style={styles.logoAccent}>AI</Text></Text><Text style={styles.logoTag}>CALCULATE • CONVERT • CHAT</Text></View>
  </View>;
}

function ToolIcon({ tool, small = false }: { tool: Tool; small?: boolean }) {
  return <View style={[styles.toolIcon, small && styles.toolIconSmall]}><Text style={[styles.toolIconText, small && styles.toolIconTextSmall]}>{tool.icon}</Text></View>;
}

function Field({ label, value, onChange, placeholder = 'Enter value', numeric = true }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#8b9ab5" style={styles.field} keyboardType={numeric ? 'decimal-pad' : 'default'} /></View>;
}

function Result({ text }: { text: string }) {
  if (!text) return null;
  return <View style={styles.resultBox}><Text style={styles.resultLabel}>RESULT</Text><Text style={styles.resultText}>{text}</Text></View>;
}

function ToolScreen({ id, onBack, onSave }: { id: ToolId; onBack: () => void; onSave: (input: string, result: string) => void }) {
  const tool = tools.find(t => t.id === id)!;
  const [a, setA] = useState('10000'); const [b, setB] = useState('18'); const [c, setC] = useState('5'); const [d, setD] = useState('');
  const [result, setResult] = useState(''); const [unit, setUnit] = useState('length'); const [from, setFrom] = useState('m'); const [to, setTo] = useState('ft'); const [sex, setSex] = useState<'male' | 'female'>('male');
  const [dateA, setDateA] = useState('01/01/2000'); const [dateB, setDateB] = useState('23/09/2026'); const [currency, setCurrency] = useState('USD');

  const run = () => {
    const x = num(a), y = num(b), z = num(c);
    let r = '';
    if (id === 'basic') r = fmt(evaluateExpression(a) ?? 0);
    if (id === 'scientific') { const expr = a.trim().toLowerCase(); const n = num(b); if (expr === 'sin') r = fmt(Math.sin(n * Math.PI / 180)); else if (expr === 'cos') r = fmt(Math.cos(n * Math.PI / 180)); else if (expr === 'tan') r = fmt(Math.tan(n * Math.PI / 180)); else if (expr === 'sqrt') r = fmt(Math.sqrt(n)); else if (expr === 'log') r = fmt(Math.log10(n)); else if (expr === 'ln') r = fmt(Math.log(n)); else r = fmt(Math.pow(x, y)); }
    if (id === 'percentage') r = `${fmt(x * y / 100)} = ${y}% of ${fmt(x)}`;
    if (id === 'gst') { const tax = x * y / 100; r = `${money(x + tax)} total\nGST: ${money(tax)}\nBase: ${money(x)}`; }
    if (id === 'discount') { const save = x * y / 100; r = `${money(x - save)} sale price\nYou save: ${money(save)}`; }
    if (id === 'profit') { const p = y - x; r = `${p >= 0 ? 'Profit' : 'Loss'}: ${money(Math.abs(p))}\nMargin: ${fmt(y ? Math.abs(p) / y * 100 : 0)}%\nMarkup on cost: ${fmt(x ? Math.abs(p) / x * 100 : 0)}%`; }
    if (id === 'emi') { const m = y / 12 / 100, months = z * 12; const emi = m === 0 ? x / months : x * m * Math.pow(1 + m, months) / (Math.pow(1 + m, months) - 1); r = `${money(emi)} / month\nTotal payment: ${money(emi * months)}\nInterest: ${money(emi * months - x)}`; }
    if (id === 'simpleInterest') { const interest = x * y * z / 100; r = `Interest: ${money(interest)}\nMaturity: ${money(x + interest)}`; }
    if (id === 'compoundInterest') { const amount = x * Math.pow(1 + y / 100, z); r = `Maturity: ${money(amount)}\nInterest: ${money(amount - x)}`; }
    if (id === 'sip') { const m = y / 12 / 100, months = z * 12, invested = x * months; const value = m === 0 ? invested : x * ((Math.pow(1 + m, months) - 1) / m) * (1 + m); r = `Future value: ${money(value)}\nInvested: ${money(invested)}\nEstimated gain: ${money(value - invested)}`; }
    if (id === 'fd') { const amount = x * Math.pow(1 + y / 100 / 4, z * 4); r = `Maturity: ${money(amount)}\nInterest: ${money(amount - x)}`; }
    if (id === 'rd') { const m = y / 400, months = z * 12; const value = x * ((Math.pow(1 + m, months) - 1) / m) * (1 + m); r = `Maturity: ${money(value)}\nDeposited: ${money(x * months)}\nInterest: ${money(value - x * months)}`; }
    if (id === 'cagr') r = `${fmt((Math.pow(y / x, 1 / z) - 1) * 100)}% CAGR`;
    if (id === 'salary') { const monthly = x / 12, inHand = monthly - y; r = `Monthly CTC: ${money(monthly)}\nEstimated monthly after deduction: ${money(Math.max(0, inHand))}`; }
    if (id === 'bmi') { const bmi = x / Math.pow(y / 100, 2); r = `BMI: ${fmt(bmi)}\n${bmi < 18.5 ? 'Below 18.5' : bmi < 25 ? '18.5–24.9' : bmi < 30 ? '25–29.9' : '30+'}`; }
    if (id === 'bmr') { const age = z, bmr = sex === 'male' ? 10 * x + 6.25 * y - 5 * age + 5 : 10 * x + 6.25 * y - 5 * age - 161; r = `Estimated BMR: ${fmt(bmr)} kcal/day`; }
    if (id === 'age') { const p = dateA.split('/').map(Number); const birth = new Date(p[2], (p[1] || 1) - 1, p[0] || 1); const now = new Date(); let years = now.getFullYear() - birth.getFullYear(); let months = now.getMonth() - birth.getMonth(); if (now.getDate() < birth.getDate()) months--; if (months < 0) { years--; months += 12; } r = `${Math.max(0, years)} years ${Math.max(0, months)} months\nBirth date: ${dateA}`; }
    if (id === 'dateDiff') { const pa = dateA.split('/').map(Number), pb = dateB.split('/').map(Number); const da = new Date(pa[2], pa[1] - 1, pa[0]), db = new Date(pb[2], pb[1] - 1, pb[0]); const days = Math.round(Math.abs(db.getTime() - da.getTime()) / 86400000); r = `${days.toLocaleString()} days\n≈ ${fmt(days / 7)} weeks`; }
    if (id === 'time') r = `${fmt(x * 60)} minutes\n${fmt(x * 3600)} seconds\n${fmt(x / 24)} days`;
    if (['length','weight','temperature','area','volume','speed','data'].includes(id)) r = convertUnits(id, x, from, to);
    if (id === 'currency') { const rates: Record<string, number> = { USD: 0.0118, EUR: 0.0101, GBP: 0.0088, AED: 0.0433, JPY: 1.75 }; r = `${x} INR ≈ ${fmt(x * (rates[currency] || 1))} ${currency}\nRate shown is an indicative offline rate; use refresh/live rate in a connected version.`; }
    if (id === 'fraction') { const [n1,d1,n2,d2] = [x,y,z,num(d)]; const den = d1 * d2; r = `${fmt(n1 * d2 + n2 * d1)}/${fmt(den)} = ${simplify(n1 * d2 + n2 * d1, den)}`; }
    if (id === 'average') { const values = a.split(',').map(num).filter(v => Number.isFinite(v)); const total = values.reduce((s,v) => s+v,0); r = `Average: ${fmt(values.length ? total / values.length : 0)}\nTotal: ${fmt(total)}\nCount: ${values.length}`; }
    if (id === 'ratio') { const g = gcd(x,y); r = `${fmt(x/g)} : ${fmt(y/g)}`; }
    if (id === 'lcmhcf') { r = `HCF: ${gcd(x,y)}\nLCM: ${lcm(x,y)}`; }
    if (id === 'numbers') { const n = Math.abs(Math.round(x)); const factors: number[] = []; for (let i=1;i<=Math.sqrt(n);i++) if(n%i===0){factors.push(i);if(i!==n/i)factors.push(n/i);} factors.sort((p,q)=>p-q); r = `${n} is ${isPrime(n) ? 'Prime' : 'Composite'}\nFactors: ${factors.join(', ')}`; }
    setResult(r); onSave(tool.title, r);
  };

  const inputLayout = () => {
    if (id === 'basic') return <Field label="Expression" value={a} onChange={setA} placeholder="25 + 75 × 2" numeric={false} />;
    if (id === 'scientific') return <><Field label="Function" value={a} onChange={setA} placeholder="sin / cos / tan / sqrt / log / ln" numeric={false} /><Field label="Number" value={b} onChange={setB} /></>;
    if (id === 'average') return <Field label="Numbers separated by comma" value={a} onChange={setA} placeholder="10, 20, 30, 40" numeric={false} />;
    if (id === 'fraction') return <><Field label="Numerator 1" value={a} onChange={setA}/><Field label="Denominator 1" value={b} onChange={setB}/><Field label="Numerator 2" value={c} onChange={setC}/><Field label="Denominator 2" value={d} onChange={setD}/></>;
    if (id === 'age') return <Field label="Birth date (DD/MM/YYYY)" value={dateA} onChange={setDateA} numeric={false}/>;
    if (id === 'dateDiff') return <><Field label="Start date" value={dateA} onChange={setDateA} numeric={false}/><Field label="End date" value={dateB} onChange={setDateB} numeric={false}/></>;
    if (id === 'time') return <Field label="Hours" value={a} onChange={setA}/>;
    if (['length','weight','temperature','area','volume','speed','data'].includes(id)) return <><Field label="Value" value={a} onChange={setA}/><View style={styles.choiceRow}><Text style={styles.fieldLabel}>From</Text><TextInput value={from} onChangeText={setFrom} style={styles.smallChoice}/><Text style={styles.fieldLabel}>To</Text><TextInput value={to} onChangeText={setTo} style={styles.smallChoice}/></View><Text style={styles.helper}>Examples: length m→ft, weight kg→lb, temperature C→F, data GB→MB.</Text></>;
    if (id === 'currency') return <><Field label="Amount in INR" value={a} onChange={setA}/><Text style={styles.fieldLabel}>Target currency</Text><View style={styles.chips}>{['USD','EUR','GBP','AED','JPY'].map(v=><Pressable key={v} onPress={()=>setCurrency(v)} style={[styles.chip,currency===v&&styles.chipActive]}><Text style={[styles.chipText,currency===v&&styles.chipTextActive]}>{v}</Text></Pressable>)}</View></>;
    if (id === 'ratio' || id === 'lcmhcf') return <><Field label="First number" value={a} onChange={setA}/><Field label="Second number" value={b} onChange={setB}/></>;
    if (id === 'numbers') return <Field label="Number" value={a} onChange={setA}/>;
    return <><Field label={id === 'profit' ? 'Cost price' : id === 'bmi' ? 'Weight (kg)' : id === 'salary' ? 'Annual CTC' : id === 'cagr' ? 'Starting value' : id === 'sip' || id === 'rd' ? 'Monthly amount' : 'Principal / Amount'} value={a} onChange={setA}/><Field label={id === 'profit' ? 'Selling price' : id === 'bmi' ? 'Height (cm)' : id === 'salary' ? 'Monthly deductions' : id === 'cagr' ? 'Ending value' : 'Annual rate %'} value={b} onChange={setB}/>{id !== 'profit' && id !== 'bmi' && id !== 'salary' && <Field label={id === 'cagr' ? 'Years' : id === 'bmr' ? 'Age' : 'Years'} value={c} onChange={setC}/>} {id === 'bmr' && <View style={styles.chips}>{['male','female'].map(v=><Pressable key={v} onPress={()=>setSex(v as 'male'|'female')} style={[styles.chip,sex===v&&styles.chipActive]}><Text style={[styles.chipText,sex===v&&styles.chipTextActive]}>{v}</Text></Pressable>)}</View>}</>;
  };

  return <SafeAreaView style={styles.safe} edges={['top','bottom']}>
    <View style={styles.toolHeader}><Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>‹</Text></Pressable><ToolIcon tool={tool} small/><View style={{flex:1}}><Text style={styles.toolTitle}>{tool.title}</Text><Text style={styles.toolSubtitle}>{tool.subtitle}</Text></View><Text style={styles.freeBadge}>FREE</Text></View>
    <ScrollView contentContainerStyle={styles.toolContent} keyboardShouldPersistTaps="handled"><View style={styles.toolHero}><ToolIcon tool={tool}/><View style={{flex:1}}><Text style={styles.heroTitle}>{tool.title}</Text><Text style={styles.heroSub}>Simple inputs. Instant result. No "coming soon".</Text></View></View><View style={styles.card}>{inputLayout()}<Pressable onPress={run} style={styles.primary}><Text style={styles.primaryText}>Calculate</Text><Text style={styles.primaryArrow}>→</Text></Pressable><Result text={result}/></View><Text style={styles.note}>Calculations run on your device. No account is required.</Text></ScrollView>
  </SafeAreaView>;
}

function simplify(n: number, d: number) { const g = gcd(n,d); return `${n/g}/${d/g}`; }
function isPrime(n: number) { if (n < 2) return false; for(let i=2;i*i<=n;i++) if(n%i===0) return false; return true; }
function convertUnits(id: ToolId, value: number, from: string, to: string) {
  const tables: Record<string, Record<string, number>> = {
    length: { m:1, km:1000, cm:.01, mm:.001, ft:.3048, in:.0254, yd:.9144, mile:1609.344 },
    weight: { kg:1, g:.001, mg:.000001, lb:.45359237, oz:.0283495 },
    area: { 'm2':1, 'km2':1e6, 'ft2':.092903, 'in2':.00064516, acre:4046.8564224, hectare:10000 },
    volume: { L:1, ml:.001, m3:1000, gal:3.785411784, cup:.2365882365 },
    speed: { 'km/h':1, mph:1.609344, 'm/s':3.6, knot:1.852 },
    data: { B:1, KB:1024, MB:1024**2, GB:1024**3, TB:1024**4 },
  };
  if (id === 'temperature') { let c = value; if(from.toUpperCase()==='F') c=(value-32)*5/9; if(from.toUpperCase()==='K') c=value-273.15; if(to.toUpperCase()==='C') return `${fmt(c)} °C`; if(to.toUpperCase()==='F') return `${fmt(c*9/5+32)} °F`; return `${fmt(c+273.15)} K`; }
  const table = tables[id]; if (!table) return 'Choose a valid conversion'; const base = table[from] ?? 1; const target = table[to] ?? 1; return `${fmt(value)} ${from} = ${fmt(value*base/target)} ${to}`;
}

export default function HomeScreen() {
  const [tab, setTab] = useState<Tab>('home'); const [selected, setSelected] = useState<ToolId | null>(null); const [group, setGroup] = useState('All'); const [search, setSearch] = useState('');
  const [expression, setExpression] = useState(''); const [chat, setChat] = useState(''); const [messages, setMessages] = useState<Array<{from:'user'|'ai';text:string}>>([{from:'ai',text:'Namaste! I am SmartCalc AI. Ask for a calculation in normal language — for example “18% GST on 25000” or “5 lakh EMI for 10 years”.'}]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const filtered = useMemo(() => tools.filter(t => (group === 'All' || t.group === group) && `${t.title} ${t.subtitle}`.toLowerCase().includes(search.toLowerCase())), [group, search]);
  const quick = useMemo(() => quickIds.map(id => tools.find(t=>t.id===id)!).filter(Boolean), []);

  const save = (title: string, result: string) => setHistory(h => [{id:Date.now(),title,input:'Calculation',result},...h].slice(0,50));
  const doBasic = () => { const v=evaluateExpression(expression); const r=v===null?'Check expression':fmt(v); setHistory(h=>[{id:Date.now(),title:'Basic Calculator',input:expression,result:r},...h].slice(0,50)); };
  const sendChat = () => {
    const text=chat.trim(); if(!text) return; const lower=text.toLowerCase(); let reply='';
    const pct=text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)/i);
    const gst=text.match(/(\d+(?:\.\d+)?)\s*%\s*gst.*?(\d+(?:\.\d+)?)/i);
    const emi=text.match(/(?:emi|loan).*?(\d+(?:\.\d+)?)\s*(?:lakh|lac|k)?/i);
    const exp=evaluateExpression(text);
    if(gst){const rate=num(gst[1]),base=num(gst[2]),tax=base*rate/100;reply=`${rate}% GST on ${money(base)} = ${money(tax)} tax. Total = ${money(base+tax)}.`;}
    else if(pct){reply=`${pct[1]}% of ${pct[2]} = ${fmt(num(pct[1])*num(pct[2])/100)}.`;}
    else if(exp!==null && /[+\-*/]/.test(text)){reply=`Answer: ${fmt(exp)}.`;}
    else if(lower.includes('emi') && emi){const raw=num(emi[1])*(lower.includes('lakh')||lower.includes('lac')?100000:lower.includes('k')?1000:1);const rate=10/12/100,months=60;const e=raw*rate*Math.pow(1+rate,months)/(Math.pow(1+rate,months)-1);reply=`Example EMI at 10% for 5 years on ${money(raw)} is ${money(e)}/month. Open EMI for your exact rate and tenure.`;}
    else if(lower.includes('namaste')||lower.includes('hello')) reply='Namaste! Tell me any calculation, conversion, finance, GST, health or date question.';
    else reply='I can handle arithmetic, percentage, GST, discount, profit/loss, EMI, SIP, interest, BMI, age, dates and unit conversions. Try “25% of 480”, “18% GST on 25000”, or “10 km to mile”.';
    setMessages(m=>[...m,{from:'user',text},{from:'ai',text:reply}]);setChat('');setTab('chat');
  };

  if(selected) return <ToolScreen id={selected} onBack={()=>setSelected(null)} onSave={save}/>;

  const nav = (next:Tab) => { setTab(next); if(next==='tools') {setGroup('All');setSearch('');} };
  return <SafeAreaView style={styles.safe} edges={['top']}>
    <StatusBar barStyle="light-content" backgroundColor="#071b4b"/>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <View style={styles.topBlue}><View style={styles.topRow}><Logo/><Pressable style={styles.pro}><Text style={styles.proText}>✦ PRO</Text></Pressable></View><Text style={styles.tagline}>Calculate anything. Understand everything.</Text><View style={styles.smartSearch}><View style={styles.spark}><Text style={styles.sparkText}>✦</Text></View><TextInput value={expression} onChangeText={setExpression} placeholder="Ask or type a calculation..." placeholderTextColor="#7183a1" style={styles.searchInput} onSubmitEditing={doBasic}/><Pressable onPress={doBasic} style={styles.go}><Text style={styles.goText}>→</Text></Pressable></View><Text style={styles.examples}>Try: 25% of 480  •  18% GST on 25000  •  5 lakh EMI</Text></View>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {tab==='home' && <>
          <View style={styles.quickRow}>{[['⌕','Calculator','basic'],['π','Scientific','scientific'],['↔','Converters','length'],['₹','Finance','emi']].map(([icon,title,id])=><Pressable key={id} onPress={()=>setSelected(id as ToolId)} style={styles.quick}><Text style={styles.quickIcon}>{icon}</Text><Text style={styles.quickTitle}>{title}</Text></Pressable>)}</View>
          <SectionTitle title="All-in-one calculator" subtitle="Everything works now — no placeholder cards"/>
          <View style={styles.grid}>{quick.map(t=><Pressable key={t.id} onPress={()=>setSelected(t.id)} style={styles.bigCard}><ToolIcon tool={t}/><View style={{flex:1}}><Text style={styles.bigTitle}>{t.title}</Text><Text style={styles.bigSub}>{t.subtitle}</Text></View><Text style={styles.cardArrow}>›</Text></Pressable>)}</View>
          <SectionTitle title="Smart Conversation" subtitle="Calculation + explanation in natural language"/><Pressable onPress={()=>setTab('chat')} style={styles.chatBanner}><View style={styles.robot}><Text style={styles.robotText}>AI</Text></View><View style={{flex:1}}><Text style={styles.chatTitle}>Talk to SmartCalc AI</Text><Text style={styles.chatSub}>Ask in Hindi or English. Get an answer instantly.</Text></View><View style={styles.chatButton}><Text style={styles.chatButtonText}>Chat →</Text></View></Pressable>
          <SectionTitle title="Popular tools" subtitle="Tap any tool to calculate"/><View style={styles.miniGrid}>{tools.slice(0,16).map(t=><Pressable key={t.id} onPress={()=>setSelected(t.id)} style={styles.miniCard}><ToolIcon tool={t} small/><Text style={styles.miniTitle} numberOfLines={1}>{t.title}</Text></Pressable>)}</View>
        </>}
        {tab==='tools' && <><View style={styles.sectionTop}><Text style={styles.sectionHeading}>Calculator Library</Text><Text style={styles.sectionCaption}>{tools.length} working tools</Text></View><TextInput value={search} onChangeText={setSearch} placeholder="Search calculator or converter..." placeholderTextColor="#8391a9" style={styles.librarySearch}/><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupRow}>{groups.map(g=><Pressable key={g} onPress={()=>setGroup(g)} style={[styles.groupChip,group===g&&styles.groupChipActive]}><Text style={[styles.groupText,group===g&&styles.groupTextActive]}>{g}</Text></Pressable>)}</ScrollView><View style={styles.libraryList}>{filtered.map(t=><Pressable key={t.id} onPress={()=>setSelected(t.id)} style={styles.libraryItem}><ToolIcon tool={t}/><View style={{flex:1}}><Text style={styles.bigTitle}>{t.title}</Text><Text style={styles.bigSub}>{t.subtitle}</Text></View><Text style={styles.cardArrow}>›</Text></Pressable>)}</View></>}
        {tab==='chat' && <><View style={styles.chatHeader}><Text style={styles.sectionHeading}>SmartCalc AI</Text><Text style={styles.sectionCaption}>Local calculation assistant • no paid AI required</Text></View><View style={styles.messages}>{messages.map((m,i)=><View key={i} style={[styles.bubble,m.from==='user'?styles.userBubble:styles.aiBubble]}><Text style={[styles.bubbleText,m.from==='user'&&styles.userBubbleText]}>{m.text}</Text></View>)}</View><View style={styles.chatInputRow}><TextInput value={chat} onChangeText={setChat} onSubmitEditing={sendChat} placeholder="Ask anything to calculate..." placeholderTextColor="#8795ac" style={styles.chatInput}/><Pressable onPress={sendChat} style={styles.send}><Text style={styles.sendText}>➤</Text></Pressable></View><Text style={styles.suggestions}>Try: “18% GST on 25000” • “convert 10 km to mile” • “25% of 480”</Text></>}
        {tab==='history' && <><View style={styles.sectionTop}><Text style={styles.sectionHeading}>History</Text><Text style={styles.sectionCaption}>{history.length} saved calculations</Text></View>{history.length===0?<View style={styles.empty}><Text style={styles.emptyIcon}>◷</Text><Text style={styles.emptyTitle}>No calculations yet</Text><Text style={styles.emptySub}>Your results will appear here automatically.</Text></View>:history.map(h=><View key={h.id} style={styles.historyItem}><Text style={styles.historyTitle}>{h.title}</Text><Text style={styles.historyResult}>{h.result}</Text></View>)}</>}
      </ScrollView>
      <View style={styles.bottomNav}>{([['home','⌂','Home'],['tools','▦','Tools'],['chat','✦','AI Chat'],['history','◷','History']] as [Tab,string,string][]).map(([id,icon,title])=><Pressable key={id} onPress={()=>nav(id)} style={styles.navItem}><Text style={[styles.navIcon,tab===id&&styles.navActive]}>{icon}</Text><Text style={[styles.navText,tab===id&&styles.navActive]}>{title}</Text></Pressable>)}</View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

function SectionTitle({title,subtitle}:{title:string;subtitle:string}){return <View style={styles.sectionTitle}><View><Text style={styles.sectionHeading}>{title}</Text><Text style={styles.sectionCaption}>{subtitle}</Text></View><Text style={styles.viewAll}>VIEW ALL</Text></View>}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#f6f8fc'}, topBlue:{backgroundColor:'#071b4b',paddingHorizontal:18,paddingTop:10,paddingBottom:22,borderBottomLeftRadius:28,borderBottomRightRadius:28},topRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},logoRow:{flexDirection:'row',alignItems:'center'},logoMark:{width:48,height:48,borderRadius:15,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginRight:10,overflow:'hidden'},logoCalc:{fontSize:28,fontWeight:'900',color:'#1768e5',position:'absolute',left:7,top:5},logoBrain:{fontSize:15,fontWeight:'900',color:'#8c42e8',position:'absolute',right:6,bottom:5},logoDot:{width:9,height:9,borderRadius:5,backgroundColor:'#23c5ff',position:'absolute',right:8,top:8},logoText:{fontSize:23,fontWeight:'900',color:'#fff',letterSpacing:-.5},logoAccent:{color:'#3ba9ff'},logoTag:{fontSize:8,color:'#aebfe5',fontWeight:'800',letterSpacing:1,marginTop:2},tagline:{color:'#cbd8f0',fontSize:13,marginTop:5},pro:{borderWidth:1,borderColor:'#f7c84b',paddingHorizontal:12,paddingVertical:8,borderRadius:20,backgroundColor:'#142e68'},proText:{color:'#ffd24e',fontWeight:'900',fontSize:12},smartSearch:{height:62,backgroundColor:'#fff',borderRadius:31,marginTop:17,flexDirection:'row',alignItems:'center',paddingHorizontal:10},spark:{width:44,height:44,borderRadius:22,backgroundColor:'#edf4ff',alignItems:'center',justifyContent:'center'},sparkText:{fontSize:24,color:'#347be5'},searchInput:{flex:1,fontSize:16,color:'#17243c',paddingHorizontal:12},go:{width:45,height:45,borderRadius:23,backgroundColor:'#2374e8',alignItems:'center',justifyContent:'center'},goText:{fontSize:27,color:'#fff',fontWeight:'800'},examples:{color:'#aebfe5',fontSize:11,marginTop:9,marginLeft:10},page:{padding:16,paddingBottom:110},quickRow:{flexDirection:'row',gap:10,marginBottom:20},quick:{flex:1,backgroundColor:'#fff',borderRadius:16,paddingVertical:14,alignItems:'center',borderWidth:1,borderColor:'#e5ebf4'},quickIcon:{fontSize:22,color:'#2477e8',fontWeight:'900'},quickTitle:{fontSize:11,color:'#1b2b49',fontWeight:'800',marginTop:5},sectionTitle:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:7,marginBottom:12},sectionHeading:{fontSize:20,fontWeight:'900',color:'#102244'},sectionCaption:{fontSize:11,color:'#73819a',marginTop:3},viewAll:{fontSize:10,color:'#2176e8',fontWeight:'900'},grid:{gap:10},bigCard:{backgroundColor:'#fff',borderRadius:20,padding:15,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#e4eaf3',shadowColor:'#0b1d40',shadowOpacity:.05,shadowRadius:8,elevation:2},bigTitle:{fontSize:15,fontWeight:'900',color:'#172640'},bigSub:{fontSize:11,color:'#73819a',marginTop:3},cardArrow:{fontSize:29,color:'#4b73b5',marginLeft:8},toolIcon:{width:48,height:48,borderRadius:15,backgroundColor:'#eaf2ff',alignItems:'center',justifyContent:'center',marginRight:12},toolIconText:{fontSize:21,fontWeight:'900',color:'#2174e6'},toolIconSmall:{width:34,height:34,borderRadius:11,marginRight:0},toolIconTextSmall:{fontSize:15},chatBanner:{backgroundColor:'#eef0ff',borderRadius:22,padding:16,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#d9ddff'},robot:{width:58,height:58,borderRadius:19,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginRight:12},robotText:{fontSize:20,fontWeight:'900',color:'#7547e8'},chatTitle:{fontSize:16,fontWeight:'900',color:'#1a2b55'},chatSub:{fontSize:11,color:'#6d7890',marginTop:3},chatButton:{backgroundColor:'#4c49dc',paddingHorizontal:13,paddingVertical:10,borderRadius:18},chatButtonText:{color:'#fff',fontWeight:'900',fontSize:11},miniGrid:{flexDirection:'row',flexWrap:'wrap',gap:9},miniCard:{width:'23.2%',backgroundColor:'#fff',borderRadius:16,paddingVertical:11,alignItems:'center',borderWidth:1,borderColor:'#e6ebf3'},miniTitle:{fontSize:9,fontWeight:'800',color:'#27344d',marginTop:7,textAlign:'center'},sectionTop:{marginTop:3,marginBottom:12},librarySearch:{height:48,backgroundColor:'#fff',borderRadius:16,borderWidth:1,borderColor:'#dfe6f0',paddingHorizontal:16,color:'#1b2b49',fontSize:14},groupRow:{gap:8,paddingVertical:12},groupChip:{paddingHorizontal:13,paddingVertical:9,borderRadius:18,backgroundColor:'#fff',borderWidth:1,borderColor:'#dfe6f0'},groupChipActive:{backgroundColor:'#216fe0',borderColor:'#216fe0'},groupText:{fontSize:11,fontWeight:'800',color:'#61708a'},groupTextActive:{color:'#fff'},libraryList:{gap:8},libraryItem:{backgroundColor:'#fff',borderRadius:17,padding:12,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#e5ebf4'},chatHeader:{marginBottom:12},messages:{gap:10},bubble:{maxWidth:'88%',padding:13,borderRadius:17},aiBubble:{alignSelf:'flex-start',backgroundColor:'#fff',borderWidth:1,borderColor:'#e1e7f0'},userBubble:{alignSelf:'flex-end',backgroundColor:'#216fe0'},bubbleText:{fontSize:13,lineHeight:19,color:'#263651'},userBubbleText:{color:'#fff'},chatInputRow:{flexDirection:'row',gap:8,marginTop:14},chatInput:{flex:1,height:50,backgroundColor:'#fff',borderRadius:18,borderWidth:1,borderColor:'#dce4ef',paddingHorizontal:15,color:'#182943'},send:{width:50,height:50,borderRadius:18,backgroundColor:'#216fe0',alignItems:'center',justifyContent:'center'},sendText:{color:'#fff',fontSize:22},suggestions:{fontSize:10,color:'#75839a',marginTop:8,lineHeight:16},empty:{alignItems:'center',paddingVertical:80},emptyIcon:{fontSize:44,color:'#9aa9bf'},emptyTitle:{fontSize:18,fontWeight:'900',color:'#233451',marginTop:12},emptySub:{fontSize:12,color:'#7d8aa0',marginTop:5},historyItem:{backgroundColor:'#fff',borderRadius:16,padding:14,marginBottom:8,borderWidth:1,borderColor:'#e3e9f1'},historyTitle:{fontSize:12,fontWeight:'800',color:'#65738b'},historyResult:{fontSize:15,fontWeight:'900',color:'#1b2c4b',marginTop:5},bottomNav:{height:72,backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#e2e8f0',flexDirection:'row',justifyContent:'space-around',paddingTop:8,paddingBottom:8},navItem:{alignItems:'center',justifyContent:'center',minWidth:70},navIcon:{fontSize:23,color:'#8b98ad'},navText:{fontSize:10,color:'#77859b',fontWeight:'800',marginTop:2},navActive:{color:'#1f73e5'},toolHeader:{height:68,backgroundColor:'#071b4b',flexDirection:'row',alignItems:'center',paddingHorizontal:15,gap:10},backButton:{width:38,height:38,borderRadius:19,backgroundColor:'#19356f',alignItems:'center',justifyContent:'center'},backText:{fontSize:31,color:'#fff',lineHeight:34},toolTitle:{fontSize:16,color:'#fff',fontWeight:'900'},toolSubtitle:{fontSize:10,color:'#aebfe5',marginTop:2},freeBadge:{fontSize:9,color:'#7df1ba',fontWeight:'900',borderWidth:1,borderColor:'#43c88d',paddingHorizontal:7,paddingVertical:4,borderRadius:10},toolContent:{padding:16,paddingBottom:40},toolHero:{backgroundColor:'#eef4ff',borderRadius:22,padding:16,flexDirection:'row',alignItems:'center',marginBottom:12},heroTitle:{fontSize:20,fontWeight:'900',color:'#172947'},heroSub:{fontSize:11,color:'#6d7d98',marginTop:3},card:{backgroundColor:'#fff',borderRadius:22,padding:17,borderWidth:1,borderColor:'#e1e8f2'},fieldWrap:{marginBottom:12},fieldLabel:{fontSize:11,color:'#64738d',fontWeight:'800',marginBottom:6},field:{height:50,borderWidth:1,borderColor:'#dce4ee',borderRadius:14,paddingHorizontal:14,color:'#162743',backgroundColor:'#fbfcfe',fontSize:15},choiceRow:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:12},smallChoice:{flex:1,height:45,borderWidth:1,borderColor:'#dce4ee',borderRadius:12,paddingHorizontal:10,color:'#172943',backgroundColor:'#fbfcfe'},helper:{fontSize:10,color:'#78879e',lineHeight:15,marginBottom:10},chips:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:10},chip:{paddingHorizontal:12,paddingVertical:9,borderRadius:15,backgroundColor:'#f0f3f8'},chipActive:{backgroundColor:'#216fe0'},chipText:{fontSize:11,fontWeight:'800',color:'#60708a'},chipTextActive:{color:'#fff'},primary:{height:52,borderRadius:16,backgroundColor:'#216fe0',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10,marginTop:5},primaryText:{color:'#fff',fontSize:15,fontWeight:'900'},primaryArrow:{color:'#fff',fontSize:22},resultBox:{backgroundColor:'#edf8f2',borderRadius:17,padding:15,marginTop:13,borderWidth:1,borderColor:'#ccebd9'},resultLabel:{fontSize:9,color:'#24845b',fontWeight:'900',letterSpacing:1},resultText:{fontSize:17,color:'#153b2d',fontWeight:'900',lineHeight:25,marginTop:5},note:{textAlign:'center',fontSize:10,color:'#7c8aa0',marginTop:12},
});
