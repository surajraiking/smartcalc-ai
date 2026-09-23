import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ToolId =
  | 'basic'
  | 'percent'
  | 'gst'
  | 'discount'
  | 'profit'
  | 'emi'
  | 'interest'
  | 'compound'
  | 'sip'
  | 'units'
  | 'age';

type Tab = 'home' | 'tools' | 'chat';

const tools: Array<{ id: ToolId; icon: string; title: string; subtitle: string }> = [
  { id: 'basic', icon: '＋', title: 'Calculator', subtitle: 'Basic & scientific' },
  { id: 'percent', icon: '%', title: 'Percentage', subtitle: 'Percent of / change' },
  { id: 'gst', icon: '₹', title: 'GST', subtitle: 'Add or remove GST' },
  { id: 'discount', icon: '🏷', title: 'Discount', subtitle: 'Sale price & savings' },
  { id: 'profit', icon: '📈', title: 'Profit / Loss', subtitle: 'Margin & percentage' },
  { id: 'emi', icon: '🏦', title: 'EMI', subtitle: 'Loan payment' },
  { id: 'interest', icon: '💰', title: 'Simple Interest', subtitle: 'Interest & amount' },
  { id: 'compound', icon: '📊', title: 'Compound', subtitle: 'Compounded growth' },
  { id: 'sip', icon: '🪙', title: 'SIP', subtitle: 'Investment growth' },
  { id: 'units', icon: '↔', title: 'Unit Converter', subtitle: 'Length, weight, temp' },
  { id: 'age', icon: '🎂', title: 'Age Calculator', subtitle: 'Exact age' },
];

const quickTools: ToolId[] = ['percent', 'gst', 'emi', 'units', 'discount', 'sip'];

const num = (value: string) => {
  const n = Number(value.replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const money = (value: number) =>
  `₹${Number.isFinite(value) ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}`;

const fmt = (value: number) =>
  Number.isFinite(value) ? value.toLocaleString('en-IN', { maximumFractionDigits: 4 }) : '0';

function evaluateExpression(input: string): number | null {
  const source = input.replace(/,/g, '').replace(/×/g, '*').replace(/÷/g, '/').trim();
  if (!source || !/^[0-9+\-*/().%\s]+$/.test(source)) return null;
  const tokens = source.match(/\d*\.?\d+|[()+\-*/%]/g);
  if (!tokens) return null;
  const values: number[] = [];
  const ops: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
  const apply = () => {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    if (op === undefined || a === undefined || b === undefined) throw new Error('Invalid expression');
    if (op === '+') values.push(a + b);
    else if (op === '-') values.push(a - b);
    else if (op === '*') values.push(a * b);
    else if (op === '/') {
      if (b === 0) throw new Error('Cannot divide by zero');
      values.push(a / b);
    } else values.push(a % b);
  };
  try {
    let previous = 'operator';
    for (const token of tokens) {
      if (/^\d/.test(token)) {
        values.push(Number(token));
        previous = 'number';
      } else if (token === '(') {
        ops.push(token);
        previous = 'operator';
      } else if (token === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') apply();
        if (ops.pop() !== '(') return null;
        previous = 'number';
      } else {
        if (token === '-' && previous === 'operator') values.push(0);
        while (ops.length && ops[ops.length - 1] !== '(' && precedence[ops[ops.length - 1]] >= precedence[token]) apply();
        ops.push(token);
        previous = 'operator';
      }
    }
    while (ops.length) {
      if (ops[ops.length - 1] === '(') return null;
      apply();
    }
    return values.length === 1 && Number.isFinite(values[0]) ? values[0] : null;
  } catch {
    return null;
  }
}

function ToolPanel({ id }: { id: ToolId }) {
  const [a, setA] = useState('10000');
  const [b, setB] = useState('18');
  const [c, setC] = useState('5');
  const [unitFrom, setUnitFrom] = useState('1');
  const [unitType, setUnitType] = useState<'length' | 'weight' | 'temperature'>('length');
  const [birth, setBirth] = useState('01/01/2000');
  const [calc, setCalc] = useState<string>('');

  const run = () => {
    const x = num(a);
    const y = num(b);
    const z = num(c);
    let output = '';
    if (id === 'percent') output = `${fmt((x * y) / 100)} (${y}% of ${fmt(x)})`;
    if (id === 'gst') {
      const gst = (x * y) / 100;
      output = `${money(x + gst)} total  •  GST ${money(gst)}  •  Base ${money(x)}`;
    }
    if (id === 'discount') {
      const saved = (x * y) / 100;
      output = `${money(x - saved)} sale price  •  You save ${money(saved)}`;
    }
    if (id === 'profit') {
      const profit = y - x;
      const pct = x ? (profit / x) * 100 : 0;
      output = `${profit >= 0 ? 'Profit' : 'Loss'} ${money(Math.abs(profit))}  •  ${fmt(Math.abs(pct))}%`;
    }
    if (id === 'emi') {
      const monthlyRate = y / 12 / 100;
      const months = z * 12;
      const emi = monthlyRate === 0 ? x / months : (x * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      output = `${money(emi)} / month  •  Total ${money(emi * months)}  •  Interest ${money(emi * months - x)}`;
    }
    if (id === 'interest') {
      const interest = (x * y * z) / 100;
      output = `Interest ${money(interest)}  •  Amount ${money(x + interest)}`;
    }
    if (id === 'compound') {
      const amount = x * Math.pow(1 + y / 100, z);
      output = `Amount ${money(amount)}  •  Interest ${money(amount - x)}`;
    }
    if (id === 'sip') {
      const monthlyRate = y / 12 / 100;
      const months = z * 12;
      const invested = x * months;
      const value = monthlyRate === 0 ? invested : x * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      output = `Value ${money(value)}  •  Invested ${money(invested)}  •  Gain ${money(value - invested)}`;
    }
    if (id === 'units') {
      const value = num(unitFrom);
      if (unitType === 'length') output = `${fmt(value)} m = ${fmt(value * 3.28084)} ft = ${fmt(value * 39.3701)} in`;
      if (unitType === 'weight') output = `${fmt(value)} kg = ${fmt(value * 1000)} g = ${fmt(value * 2.20462)} lb`;
      if (unitType === 'temperature') output = `${fmt(value)} °C = ${fmt(value * 9 / 5 + 32)} °F = ${fmt(value + 273.15)} K`;
    }
    if (id === 'age') {
      const parts = birth.split('/').map(Number);
      const d = new Date(parts[2], (parts[1] || 1) - 1, parts[0] || 1);
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      let months = now.getMonth() - d.getMonth();
      if (now.getDate() < d.getDate()) months -= 1;
      if (months < 0) { years -= 1; months += 12; }
      output = `${Math.max(0, years)} years ${Math.max(0, months)} months old`;
    }
    if (id === 'basic') output = fmt(evaluateExpression(a) ?? 0);
    setCalc(output || 'Enter values and calculate');
  };

  const config: Record<ToolId, { title: string; hint: string[] }> = {
    basic: { title: 'Calculator', hint: ['Expression', ''] },
    percent: { title: 'Percentage', hint: ['Number', 'Percent %'] },
    gst: { title: 'GST Calculator', hint: ['Amount', 'GST %'] },
    discount: { title: 'Discount Calculator', hint: ['Marked price', 'Discount %'] },
    profit: { title: 'Profit / Loss', hint: ['Cost price', 'Selling price'] },
    emi: { title: 'EMI Calculator', hint: ['Loan amount', 'Annual interest %'] },
    interest: { title: 'Simple Interest', hint: ['Principal', 'Rate %'] },
    compound: { title: 'Compound Interest', hint: ['Principal', 'Rate %'] },
    sip: { title: 'SIP Calculator', hint: ['Monthly investment', 'Expected return %'] },
    units: { title: 'Unit Converter', hint: ['Value', ''] },
    age: { title: 'Age Calculator', hint: ['DD/MM/YYYY', ''] },
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{config[id].title}</Text>
      <Text style={styles.panelSub}>
        {id === 'emi' ? 'Loan amount • annual rate • years' : id === 'sip' ? 'Monthly investment • annual return • years' : 'Fast, offline and free'}
      </Text>
      {id === 'basic' || id === 'age' ? (
        <TextInput value={id === 'basic' ? a : birth} onChangeText={id === 'basic' ? setA : setBirth} placeholder={config[id].hint[0]} placeholderTextColor="#64748b" style={styles.field} keyboardType={id === 'basic' ? 'numbers-and-punctuation' : 'numbers-and-punctuation'} />
      ) : id === 'units' ? (
        <>
          <TextInput value={unitFrom} onChangeText={setUnitFrom} placeholder="Value" placeholderTextColor="#64748b" style={styles.field} keyboardType="decimal-pad" />
          <View style={styles.chips}>
            {(['length', 'weight', 'temperature'] as const).map((type) => (
              <Pressable key={type} onPress={() => setUnitType(type)} style={[styles.chip, unitType === type && styles.chipActive]}>
                <Text style={[styles.chipText, unitType === type && styles.chipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <TextInput value={a} onChangeText={setA} placeholder={config[id].hint[0]} placeholderTextColor="#64748b" style={styles.field} keyboardType="decimal-pad" />
          <TextInput value={b} onChangeText={setB} placeholder={config[id].hint[1]} placeholderTextColor="#64748b" style={styles.field} keyboardType="decimal-pad" />
          {['emi', 'interest', 'compound', 'sip'].includes(id) && <TextInput value={c} onChangeText={setC} placeholder={id === 'emi' ? 'Years' : 'Years'} placeholderTextColor="#64748b" style={styles.field} keyboardType="decimal-pad" />}
        </>
      )}
      <Pressable style={styles.calculateButton} onPress={run}><Text style={styles.calculateText}>Calculate now</Text><Text style={styles.arrow}>→</Text></Pressable>
      {!!calc && <View style={styles.answer}><Text style={styles.answerLabel}>RESULT</Text><Text style={styles.answerText}>{calc}</Text></View>}
    </View>
  );
}

function Logo() {
  return (
    <View style={styles.logoWrap}>
      <View style={styles.logoCircle}><Text style={styles.logoSymbol}>⌁</Text><Text style={styles.logoPlus}>+</Text></View>
      <View><Text style={styles.brand}>SMARTCALC</Text><Text style={styles.brandAI}>AI • CALCULATE • CONVERT • CHAT</Text></View>
    </View>
  );
}

export default function HomeScreen() {
  const [tab, setTab] = useState<Tab>('home');
  const [tool, setTool] = useState<ToolId>('basic');
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ from: 'user' | 'ai'; text: string }>>([
    { from: 'ai', text: 'Namaste! I am SmartCalc. Ask me a calculation, GST, EMI, percentage, discount or unit conversion.' },
  ]);

  const featured = useMemo(() => tools.filter((item) => quickTools.includes(item.id)), []);

  const calculate = () => {
    const value = evaluateExpression(expression);
    setAnswer(value === null ? 'Try: 25 + 75 × 2' : fmt(value));
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    let reply = '';
    const expressionValue = evaluateExpression(text);
    const percent = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)/i);
    const gst = text.match(/(\d+(?:\.\d+)?)\s*%\s*gst.*?(\d+(?:\.\d+)?)/i);
    if (expressionValue !== null && /[+\-*/]/.test(text)) reply = `${fmt(expressionValue)}. I calculated that locally, so no internet or paid AI is required.`;
    else if (percent) reply = `${percent[1]}% of ${percent[2]} = ${fmt((Number(percent[1]) * Number(percent[2])) / 100)}`;
    else if (gst) {
      const base = Number(gst[2]); const rate = Number(gst[1]); const tax = base * rate / 100;
      reply = `${rate}% GST on ${money(base)} = ${money(tax)} tax; total = ${money(base + tax)}.`;
    } else if (lower.includes('hello') || lower.includes('namaste')) reply = 'Namaste! Tell me what you want to calculate.';
    else reply = 'I can calculate expressions, percentage, GST and conversions offline. For example: “18% of 10000” or “2500 + 18% GST”.';
    setMessages((items) => [...items, { from: 'user', text }, { from: 'ai', text: reply }]);
    setChatInput('');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}><Logo /><Pressable style={styles.proBadge} onPress={() => setTab('chat')}><Text style={styles.proText}>AI</Text></Pressable></View>
        <View style={styles.tabs}>
          {([['home', '⌂', 'Home'], ['tools', '▦', 'All Tools'], ['chat', '✦', 'Smart Chat']] as const).map(([id, icon, label]) => (
            <Pressable key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.tabActive]}>
              <Text style={[styles.tabIcon, tab === id && styles.tabTextActive]}>{icon}</Text><Text style={[styles.tabLabel, tab === id && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'home' && (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.hero}><Text style={styles.heroTitle}>One app. Every calculation.</Text><Text style={styles.heroSub}>Fast • Private • Free • Works offline</Text></View>
            <View style={styles.mainCalc}>
              <View style={styles.calcTop}><Text style={styles.calcLabel}>SMART CALCULATOR</Text><Text style={styles.calcBadge}>OFFLINE</Text></View>
              <TextInput value={expression} onChangeText={setExpression} placeholder="25 + 75 × 2" placeholderTextColor="#64748b" style={styles.bigInput} keyboardType="numbers-and-punctuation" onSubmitEditing={calculate} />
              <View style={styles.answerRow}><Text style={styles.equal}>=</Text><Text style={styles.bigAnswer}>{answer || '0'}</Text></View>
              <Pressable style={styles.primary} onPress={calculate}><Text style={styles.primaryText}>Calculate</Text><Text style={styles.primaryArrow}>→</Text></Pressable>
            </View>
            <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Popular tools</Text><Pressable onPress={() => setTab('tools')}><Text style={styles.seeAll}>See all →</Text></Pressable></View>
            <View style={styles.grid}>{featured.map((item) => <ToolCard key={item.id} item={item} onPress={() => { setTool(item.id); setTab('tools'); }} />)}</View>
            <View style={styles.featureCard}><Text style={styles.featureIcon}>✦</Text><View style={styles.featureCopy}><Text style={styles.featureTitle}>Smart Chat</Text><Text style={styles.featureSub}>Ask calculations in normal language — no complicated buttons.</Text></View><Pressable onPress={() => setTab('chat')} style={styles.smallButton}><Text style={styles.smallButtonText}>Open</Text></Pressable></View>
          </ScrollView>
        )}

        {tab === 'tools' && (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.pageTitle}>All Calculators</Text><Text style={styles.pageSub}>Everything is ready to use — no “Coming soon”.</Text>
            <View style={styles.grid}>{tools.map((item) => <ToolCard key={item.id} item={item} selected={tool === item.id} onPress={() => setTool(item.id)} />)}</View>
            <ToolPanel id={tool} />
          </ScrollView>
        )}

        {tab === 'chat' && (
          <View style={styles.chatScreen}>
            <View style={styles.chatHeader}><View style={styles.chatAvatar}><Text style={styles.chatAvatarText}>✦</Text></View><View><Text style={styles.chatTitle}>SmartCalc Assistant</Text><Text style={styles.chatOnline}>● Ready • Offline calculation mode</Text></View></View>
            <ScrollView contentContainerStyle={styles.messages} keyboardShouldPersistTaps="handled">
              {messages.map((message, index) => <View key={`${message.from}-${index}`} style={[styles.bubble, message.from === 'user' ? styles.userBubble : styles.aiBubble]}><Text style={styles.bubbleText}>{message.text}</Text></View>)}
            </ScrollView>
            <View style={styles.chatInputRow}><TextInput value={chatInput} onChangeText={setChatInput} onSubmitEditing={sendChat} placeholder="Ask: 18% GST on ₹10,000" placeholderTextColor="#64748b" style={styles.chatInput} /><Pressable onPress={sendChat} style={styles.send}><Text style={styles.sendText}>↑</Text></Pressable></View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ToolCard({ item, onPress, selected }: { item: typeof tools[number]; onPress: () => void; selected?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.toolCard, selected && styles.toolCardSelected]}><View style={styles.toolIconBox}><Text style={styles.toolIcon}>{item.icon}</Text></View><Text style={styles.toolTitle}>{item.title}</Text><Text style={styles.toolSub}>{item.subtitle}</Text><Text style={styles.ready}>READY ✓</Text></Pressable>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#070D1C' },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoWrap: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#14264A', borderWidth: 1, borderColor: '#3D7BFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoSymbol: { color: '#67A4FF', fontSize: 25, fontWeight: '900', position: 'absolute', top: 1 },
  logoPlus: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 8 },
  brand: { color: '#F8FAFF', fontSize: 21, fontWeight: '900', letterSpacing: 1.2 },
  brandAI: { color: '#6E8BB8', fontSize: 7, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  proBadge: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#172B4D', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#315C9E' },
  proText: { color: '#7EB1FF', fontWeight: '900' },
  tabs: { marginHorizontal: 14, marginBottom: 2, padding: 4, borderRadius: 16, backgroundColor: '#10192C', flexDirection: 'row', borderWidth: 1, borderColor: '#1E2C45' },
  tab: { flex: 1, minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  tabActive: { backgroundColor: '#245FEA' },
  tabIcon: { color: '#7085A6', fontSize: 17 },
  tabLabel: { color: '#7085A6', fontSize: 11, fontWeight: '800' },
  tabTextActive: { color: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 40 },
  hero: { marginVertical: 12 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  heroSub: { color: '#7185A7', fontSize: 12, marginTop: 6, fontWeight: '700' },
  mainCalc: { backgroundColor: '#10192B', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: '#233451', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  calcTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calcLabel: { color: '#7D91B2', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  calcBadge: { color: '#6EE7B7', backgroundColor: '#123329', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 8, fontWeight: '900' },
  bigInput: { color: '#F8FAFF', fontSize: 28, fontWeight: '800', paddingVertical: 20 },
  answerRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1E2B43' },
  equal: { color: '#55709A', fontSize: 22, marginRight: 12 },
  bigAnswer: { color: '#65A0FF', fontSize: 34, fontWeight: '900' },
  primary: { backgroundColor: '#2D68F2', borderRadius: 15, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  primaryArrow: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  sectionTitle: { color: '#F1F5FF', fontSize: 18, fontWeight: '900' },
  seeAll: { color: '#72A6FF', fontSize: 12, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toolCard: { width: '48.2%', minHeight: 132, backgroundColor: '#0F182A', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#1F2D46' },
  toolCardSelected: { borderColor: '#3C79FF', backgroundColor: '#111F39' },
  toolIconBox: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#162A4A', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  toolIcon: { color: '#74A9FF', fontSize: 19, fontWeight: '900' },
  toolTitle: { color: '#F8FAFF', fontSize: 14, fontWeight: '900' },
  toolSub: { color: '#7387A8', fontSize: 10, marginTop: 4 },
  ready: { color: '#57D6A1', fontSize: 8, fontWeight: '900', marginTop: 10 },
  featureCard: { marginTop: 18, backgroundColor: '#111D33', borderRadius: 18, padding: 15, borderWidth: 1, borderColor: '#263B5E', flexDirection: 'row', alignItems: 'center' },
  featureIcon: { color: '#76A9FF', fontSize: 25, marginRight: 12 },
  featureCopy: { flex: 1 },
  featureTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  featureSub: { color: '#8295B3', fontSize: 10, lineHeight: 16, marginTop: 3 },
  smallButton: { backgroundColor: '#234FAE', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 },
  smallButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 10 },
  pageTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 12 },
  pageSub: { color: '#7387A8', fontSize: 12, marginTop: 5, marginBottom: 16 },
  panel: { marginTop: 18, backgroundColor: '#101A2C', borderRadius: 22, padding: 17, borderWidth: 1, borderColor: '#2A3D5D' },
  panelTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  panelSub: { color: '#7085A6', fontSize: 10, marginTop: 4, marginBottom: 12 },
  field: { backgroundColor: '#0A1221', borderWidth: 1, borderColor: '#22334F', color: '#FFFFFF', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, marginTop: 9, fontSize: 15, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, backgroundColor: '#17243A', borderWidth: 1, borderColor: '#273A59' },
  chipActive: { backgroundColor: '#2559C8', borderColor: '#4A84FF' },
  chipText: { color: '#7F93B1', fontSize: 10, fontWeight: '800' },
  chipTextActive: { color: '#FFFFFF' },
  calculateButton: { marginTop: 12, backgroundColor: '#245FEA', borderRadius: 13, paddingVertical: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  calculateText: { color: '#FFFFFF', fontWeight: '900' },
  arrow: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  answer: { marginTop: 12, backgroundColor: '#0B1627', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#284268' },
  answerLabel: { color: '#6685B3', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  answerText: { color: '#70A6FF', fontSize: 18, fontWeight: '900', marginTop: 5, lineHeight: 25 },
  chatScreen: { flex: 1, paddingHorizontal: 14 },
  chatHeader: { backgroundColor: '#101A2C', borderRadius: 18, padding: 14, marginTop: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#223552' },
  chatAvatar: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#245FEA', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  chatAvatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  chatTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  chatOnline: { color: '#56D4A0', fontSize: 9, marginTop: 4, fontWeight: '800' },
  messages: { paddingVertical: 14, paddingBottom: 20 },
  bubble: { maxWidth: '88%', padding: 13, borderRadius: 16, marginBottom: 10 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#111D31', borderWidth: 1, borderColor: '#233754' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#245FEA' },
  bubbleText: { color: '#EAF0FB', fontSize: 13, lineHeight: 20 },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#17263D' },
  chatInput: { flex: 1, backgroundColor: '#101A2C', borderWidth: 1, borderColor: '#263957', borderRadius: 15, paddingHorizontal: 14, paddingVertical: 12, color: '#FFFFFF', fontSize: 13 },
  send: { width: 45, height: 45, borderRadius: 14, backgroundColor: '#2D68F2', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
});
