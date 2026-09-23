import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { percentage, calculateBinary, roundResult } from '../calculations/basic';

const quickTools = [
  ['%', 'Percentage'],
  ['GST', 'GST'],
  ['EMI', 'EMI'],
  ['₹', 'Finance'],
  ['↔', 'Units'],
  ['⌚', 'Date & Age'],
] as const;

export default function HomeScreen() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState<string[]>([]);

  const hint = useMemo(() => {
    if (!expression.trim()) return 'Try: 25% of 480';
    return 'Use +, -, ×, ÷ or calculate a percentage';
  }, [expression]);

  function evaluate() {
    const raw = expression.trim().replaceAll('×', '*').replaceAll('÷', '/');
    const percentMatch = raw.match(/^(-?\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(-?\d+(?:\.\d+)?)$/i);

    try {
      let value: number;
      if (percentMatch) {
        value = percentage(Number(percentMatch[2]), Number(percentMatch[1]));
      } else {
        const match = raw.match(/^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);
        if (!match) throw new Error('Enter a simple expression such as 25 + 75');
        value = calculateBinary(Number(match[1]), match[2] as '+' | '-' | '*' | '/', Number(match[3]));
      }
      const formatted = String(roundResult(value));
      setResult(formatted);
      setHistory((items) => [`${expression} = ${formatted}`, ...items].slice(0, 10));
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Calculation error');
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>SMARTCALC AI</Text>
        <Text style={styles.subtitle}>Calculate anything. Understand everything.</Text>

        <View style={styles.display}>
          <Text style={styles.displayLabel}>CALCULATION</Text>
          <TextInput
            value={expression}
            onChangeText={setExpression}
            placeholder={hint}
            placeholderTextColor="#94a3b8"
            style={styles.input}
            keyboardType="numbers-and-punctuation"
            returnKeyType="done"
            onSubmitEditing={evaluate}
          />
          <Text style={styles.result}>{result}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={evaluate}>
          <Text style={styles.primaryText}>Calculate</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Quick Calculators</Text>
        <View style={styles.grid}>
          {quickTools.map(([icon, title]) => (
            <Pressable key={title} style={styles.toolCard}>
              <Text style={styles.toolIcon}>{icon}</Text>
              <Text style={styles.toolTitle}>{title}</Text>
              <Text style={styles.toolSoon}>Coming next</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.chatCard}>
          <Text style={styles.chatTitle}>💬 Smart Calculation Chat</Text>
          <Text style={styles.chatText}>
            Ask naturally: “25% of 480”, “18% GST on ₹10,000”, or “₹5 lakh EMI for 5 years”.
          </Text>
          <Text style={styles.chatNote}>AI chat will be added after the verified local calculator engine.</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent calculations</Text>
        {history.length === 0 ? (
          <Text style={styles.empty}>No calculations yet.</Text>
        ) : history.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.historyItem}>
            <Text style={styles.historyText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b1220' },
  content: { padding: 20, paddingTop: 64, paddingBottom: 40 },
  brand: { color: '#f8fafc', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: '#94a3b8', marginTop: 6, marginBottom: 22, fontSize: 14 },
  display: { backgroundColor: '#111827', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#243044' },
  displayLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  input: { color: '#f8fafc', fontSize: 20, marginTop: 10, paddingVertical: 8 },
  result: { color: '#38bdf8', fontSize: 34, fontWeight: '800', marginTop: 12 },
  primaryButton: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 14 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionTitle: { color: '#e2e8f0', fontSize: 18, fontWeight: '800', marginTop: 26, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  toolCard: { width: '31.5%', minHeight: 105, backgroundColor: '#111827', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#243044' },
  toolIcon: { color: '#38bdf8', fontSize: 22, fontWeight: '800' },
  toolTitle: { color: '#f8fafc', fontWeight: '700', marginTop: 8 },
  toolSoon: { color: '#64748b', fontSize: 10, marginTop: 5 },
  chatCard: { marginTop: 20, backgroundColor: '#172033', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#2d3a52' },
  chatTitle: { color: '#f8fafc', fontSize: 17, fontWeight: '800' },
  chatText: { color: '#cbd5e1', lineHeight: 21, marginTop: 10 },
  chatNote: { color: '#64748b', fontSize: 11, marginTop: 10 },
  empty: { color: '#64748b' },
  historyItem: { backgroundColor: '#111827', padding: 14, borderRadius: 12, marginBottom: 8 },
  historyText: { color: '#cbd5e1', fontSize: 14 },
});
