/**
 * state.js
 * Module-level state: selectedType, selectedAction, values, units.
 * Single source of truth shared across all modules.
 */

export const state = {
  /** @type {'Length'|'Weight'|'Temperature'|'Volume'} */
  selectedType: 'Length',

  /** @type {'Comparison'|'Conversion'|'Arithmetic'} */
  selectedAction: 'Comparison',

  /** @type {'+'|'-'|'*'|'/'} */
  selectedOperator: '+',

  /** @type {{ name: string, email: string } | null} */
  currentUser: null,

  /** From-panel values */
  fromValue: 1,
  fromUnit: '',

  /** To-panel values */
  toValue: '',
  toUnit: '',

  /** In-memory history (mirrors /history on json-server) */
  history: [],
};

/** Update any key(s) in state */
export function setState(partial) {
  Object.assign(state, partial);
}
