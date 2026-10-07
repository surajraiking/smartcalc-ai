export type BinaryOperator = '+' | '-' | '*' | '/';

export function calculateBinary(a: number, operator: BinaryOperator, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error('Invalid number');
  }

  switch (operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/':
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
  }
}

export function percentage(value: number, percent: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(percent)) {
    throw new Error('Invalid number');
  }
  return (value * percent) / 100;
}

export function roundResult(value: number, decimals = 10): number {
  if (!Number.isFinite(value)) throw new Error('Invalid result');
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
