/* Pure data helpers: usable in the browser and in Node for testing. */
(function (root) {
  'use strict';
  const categories = ['Food', 'Transport', 'School supplies', 'Load / Internet', 'Personal', 'Other'];

  function toCents(value, allowZero = false) {
    const text = String(value).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error('Enter an amount with at most two decimal places.');
    const cents = Math.round(Number(text) * 100);
    if (!Number.isSafeInteger(cents) || cents > 100000000 || cents < (allowZero ? 0 : 1)) {
      throw new Error(allowZero ? 'Budget must be between ₱0 and ₱1,000,000.' : 'Amount must be between ₱0.01 and ₱1,000,000.');
    }
    return cents;
  }

  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '9999-12-31') return false;
    const date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  function validateExpense(input) {
    const description = String(input.description || '').trim();
    if (!description || description.length > 80) throw new Error('Enter a description between 1 and 80 characters.');
    const amountCents = toCents(input.amount);
    if (!categories.includes(input.category)) throw new Error('Choose a valid category.');
    if (!validDate(input.date)) throw new Error('Choose a valid expense date.');
    return { description, amountCents, category: input.category, date: input.date };
  }

  function forMonth(expenses, month, category = '') {
    return expenses.filter(expense => expense.date.slice(0, 7) === month && (!category || expense.category === category))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function total(expenses) { return expenses.reduce((sum, expense) => sum + expense.amountCents, 0); }

  function parseState(raw) {
    if (raw === null) return { expenses: [], budgets: {} };
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.expenses) || !state.budgets || typeof state.budgets !== 'object' || Array.isArray(state.budgets)) throw new Error('Invalid saved data.');
    const ids = new Set();
    for (const expense of state.expenses) {
      if (!expense || typeof expense.id !== 'string' || !expense.id || ids.has(expense.id) || typeof expense.description !== 'string' || !Number.isSafeInteger(expense.amountCents)) throw new Error('Invalid saved expense.');
      validateExpense({ ...expense, amount: (expense.amountCents / 100).toFixed(2) });
      ids.add(expense.id);
    }
    for (const [month, cents] of Object.entries(state.budgets)) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || !Number.isSafeInteger(cents) || cents < 0 || cents > 100000000) throw new Error('Invalid saved budget.');
    }
    return state;
  }

  const api = { categories, toCents, validDate, validateExpense, forMonth, total, parseState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TrackerModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
