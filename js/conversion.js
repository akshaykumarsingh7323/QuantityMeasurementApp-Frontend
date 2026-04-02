/**
 * conversion.js
 * Pure JS functions for conversion, comparison, and arithmetic logic.
 * No DOM access — all functions are testable in isolation.
 */

/**
 * Conversion factors to a common base unit per measurement type.
 * Length  → meters (m)
 * Weight  → grams  (g)
 * Volume  → liters (L)
 * Temperature is handled separately (non-linear).
 */
export const TO_BASE = {
  /* Length */
  km: 1000,
  m:  1,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  yd: 0.9144,
  ft: 0.3048,
  in: 0.0254,

  /* Weight */
  kg: 1000,
  g:  1,
  mg: 0.001,
  lb: 453.59237,
  oz: 28.349523125,
  t:  1_000_000,

  /* Volume */
  L:       1,
  mL:      0.001,
  'm³':    1000,
  gal:     3.785411784,
  qt:      0.946352946,
  cup:     0.2365882365,
  'fl oz': 0.0295735296,
};

/**
 * Format a number for display.
 * Uses exponential notation for very large / very small values.
 * @param {number} n
 * @returns {string}
 */
export function fmt(n) {
  if (!isFinite(n)) return String(n);
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-4)) {
    return n.toExponential(4);
  }
  // Strip trailing zeros up to 8 decimal places
  return parseFloat(n.toFixed(8)).toString();
}

/* ---- Temperature ---- */

/**
 * Convert a temperature value between two units.
 * @param {number} value
 * @param {'°C'|'°F'|'K'} fromSym
 * @param {'°C'|'°F'|'K'} toSym
 * @returns {number}
 */
export function convertTemperature(value, fromSym, toSym) {
  if (fromSym === toSym) return value;

  // Step 1: to Celsius
  let celsius;
  switch (fromSym) {
    case '°C': celsius = value; break;
    case '°F': celsius = (value - 32) * 5 / 9; break;
    case 'K':  celsius = value - 273.15; break;
    default: throw new Error(`Unknown temperature unit: ${fromSym}`);
  }

  // Step 2: Celsius to target
  switch (toSym) {
    case '°C': return celsius;
    case '°F': return celsius * 9 / 5 + 32;
    case 'K':  return celsius + 273.15;
    default: throw new Error(`Unknown temperature unit: ${toSym}`);
  }
}

/* ---- Standard conversion (via base unit) ---- */

/**
 * Convert a value between two compatible units using the TO_BASE table.
 * @param {number} value
 * @param {string} fromSym
 * @param {string} toSym
 * @returns {number}
 */
export function convertValue(value, fromSym, toSym) {
  const fromFactor = TO_BASE[fromSym];
  const toFactor   = TO_BASE[toSym];
  if (fromFactor == null) throw new Error(`Unknown unit: ${fromSym}`);
  if (toFactor   == null) throw new Error(`Unknown unit: ${toSym}`);
  return (value * fromFactor) / toFactor;
}

/* ---- Action Functions ---- */

/**
 * Conversion action: convert fromValue/fromUnit → toUnit.
 * @param {number} fromValue
 * @param {string} fromSym
 * @param {string} toSym
 * @param {'Length'|'Weight'|'Temperature'|'Volume'} type
 * @returns {{ converted: number, resultText: string }}
 */
export function performConversion(fromValue, fromSym, toSym, type) {
  const converted =
    type === 'Temperature'
      ? convertTemperature(fromValue, fromSym, toSym)
      : convertValue(fromValue, fromSym, toSym);

  return {
    converted,
    resultText: `${fromValue} ${fromSym} = ${fmt(converted)} ${toSym}`,
  };
}

/**
 * Comparison action: express fromValue in the toUnit and describe the relationship.
 * @param {number} fromValue
 * @param {string} fromSym
 * @param {string} toSym
 * @param {'Length'|'Weight'|'Temperature'|'Volume'} type
 * @returns {{ converted: number, resultText: string }}
 */
export function performComparison(fromValue, fromSym, toSym, type) {
  const converted =
    type === 'Temperature'
      ? convertTemperature(fromValue, fromSym, toSym)
      : convertValue(fromValue, fromSym, toSym);

  const fmtFrom = fmt(fromValue);
  const fmtTo   = fmt(converted);

  let rel = '=';
  if (fromValue > converted) rel = '>';
  else if (fromValue < converted) rel = '<';

  const resultText =
    fromSym === toSym
      ? `${fmtFrom} ${fromSym} ${rel} ${fmtTo} ${toSym}`
      : `${fmtFrom} ${fromSym} → ${fmtTo} ${toSym}`;

  return { converted, resultText };
}

/**
 * Arithmetic action: apply operator between (fromValue in toUnit) and toValue.
 * Both operands are expressed in toUnit before the operation.
 * @param {number} fromValue
 * @param {string} fromSym
 * @param {number} toValue
 * @param {string} toSym
 * @param {'+'|'-'|'*'|'/'} operator
 * @param {'Length'|'Weight'|'Temperature'|'Volume'} type
 * @returns {{ result: number, resultText: string }}
 */
export function performArithmetic(fromValue, fromSym, toValue, toSym, operator, type) {
  // Convert fromValue into toUnit so both operands share the same unit
  const a =
    type === 'Temperature'
      ? convertTemperature(fromValue, fromSym, toSym)
      : convertValue(fromValue, fromSym, toSym);
  const b = toValue;

  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/':
      if (b === 0) throw new Error('Division by zero');
      result = a / b;
      break;
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }

  const opDisplay = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator] || operator;
  const resultText = `${fmt(a)} ${toSym} ${opDisplay} ${fmt(b)} ${toSym} = ${fmt(result)} ${toSym}`;

  return { result, resultText };
}
