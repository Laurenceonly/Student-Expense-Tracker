'use strict';

const model = window.TrackerModel;
const STORAGE_KEY = 'student-expense-tracker-v1';
const byId = id => document.getElementById(id);
const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const money = cents => currency.format(cents / 100);
const today = new Date();
// Use local calendar values; UTC dates can be a day behind in the Philippines.
const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
let state = { expenses: [], budgets: {} };
let editingId = null;
let storageReadable = true;

function showMessage(text, isError = false) {
  byId('message').textContent = text;
  byId('message').classList.toggle('error', isError);
  byId('message').hidden = false;
}

try { state = model.parseState(localStorage.getItem(STORAGE_KEY)); }
catch (error) {
  storageReadable = false;
  showMessage('Saved data could not be opened. No data has been overwritten. Check browser storage settings or restore your saved data before adding expenses.', true);
}

byId('month').value = localToday.slice(0, 7);
byId('date').value = localToday;
byId('date').min = '1900-01-01';
byId('date').max = '9999-12-31';

function saveState(next, message) {
  if (!storageReadable) { showMessage('Browser storage is unavailable or the saved data is damaged. Resolve the storage problem and reload this page.', true); return false; }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  catch (error) { showMessage('Could not save changes. Browser storage may be full or blocked. Your previous data is unchanged.', true); return false; }
  state = next;
  render();
  showMessage(message);
  return true;
}

function resetForm() {
  editingId = null;
  byId('expense-form').reset();
  byId('date').value = localToday;
  byId('form-title').textContent = 'Add an expense';
  byId('save-expense').textContent = 'Add expense';
  byId('cancel-edit').hidden = true;
}

function textCell(row, text, className = '') {
  const cell = row.insertCell();
  cell.textContent = text;
  cell.className = className;
  return cell;
}

function render() {
  const month = byId('month').value;
  const monthly = model.forMonth(state.expenses, month);
  const visible = model.forMonth(state.expenses, month, byId('filter').value);
  const spent = model.total(monthly);
  const budget = state.budgets[month];
  const hasBudget = budget !== undefined;
  byId('total').textContent = money(spent);
  byId('count').textContent = `${monthly.length} expense${monthly.length === 1 ? '' : 's'} this month`;
  byId('budget-total').textContent = hasBudget ? money(budget) : 'Not set';
  byId('budget').value = hasBudget ? (budget / 100).toFixed(2) : '';
  const overBudget = hasBudget && spent > budget;
  byId('remaining-label').textContent = overBudget ? 'Over budget' : 'Remaining';
  byId('remaining').textContent = hasBudget ? money(Math.abs(budget - spent)) : '—';
  byId('remaining').classList.toggle('over-budget', overBudget);
  byId('budget-note').textContent = !hasBudget ? 'Set a budget to see what’s left.' : overBudget ? 'Your spending has passed this month’s budget.' : spent === budget ? 'You have used your monthly budget.' : 'Available for the rest of the month.';
  byId('budget-progress').hidden = !hasBudget;
  byId('budget-progress').value = budget > 0 ? Math.min(100, spent / budget * 100) : spent > 0 ? 100 : 0;
  byId('month-label').textContent = new Date(month + '-01T12:00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  byId('filtered-total').hidden = !byId('filter').value;
  byId('filtered-total').textContent = `${byId('filter').value}: ${money(model.total(visible))} (${visible.length} expenses)`;
  const list = byId('expense-list');
  list.replaceChildren();
  for (const expense of visible) {
    const row = document.createElement('tr');
    const description = textCell(row, expense.description);
    const category = document.createElement('span');
    category.className = 'expense-category';
    category.textContent = expense.category;
    description.append(category);
    if (expense.notes) {
      const notes = document.createElement('p');
      notes.className = 'expense-notes';
      notes.textContent = expense.notes;
      description.append(notes);
    }
    textCell(row, new Date(expense.date + 'T12:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }), 'date-cell');
    textCell(row, money(expense.amountCents), 'amount-cell');
    const actions = textCell(row, '', 'actions');
    for (const action of ['Edit', 'Delete']) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action;
      button.className = action.toLowerCase();
      button.setAttribute('aria-label', `${action} ${expense.description}`);
      button.addEventListener('click', () => action === 'Edit' ? editExpense(expense.id) : deleteExpense(expense.id));
      actions.append(button);
    }
    list.append(row);
  }
  byId('empty').hidden = visible.length > 0;
  byId('empty').querySelector('h3').textContent = byId('filter').value ? 'No matching expenses' : 'No expenses yet';
  byId('empty').querySelector('p').textContent = byId('filter').value ? 'Choose another category or add an expense.' : 'Add your first expense to start tracking this month.';
}

byId('expense-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const expense = model.validateExpense({ description: byId('description').value, notes: byId('notes').value, amount: byId('amount').value, category: byId('category').value, date: byId('date').value });
    const id = editingId || (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
    const record = { id, ...expense };
    const expenses = editingId ? state.expenses.map(item => item.id === editingId ? record : item) : [...state.expenses, record];
    if (saveState({ ...state, expenses }, editingId ? 'Expense updated.' : 'Expense added.')) {
      byId('month').value = expense.date.slice(0, 7);
      byId('filter').value = '';
      resetForm();
      render();
    }
  } catch (error) { showMessage(error.message, true); }
});

function editExpense(id) {
  const expense = state.expenses.find(item => item.id === id);
  if (!expense) return;
  editingId = id;
  byId('description').value = expense.description;
  byId('notes').value = expense.notes || '';
  byId('amount').value = (expense.amountCents / 100).toFixed(2);
  byId('category').value = expense.category;
  byId('date').value = expense.date;
  byId('form-title').textContent = 'Edit expense';
  byId('save-expense').textContent = 'Save changes';
  byId('cancel-edit').hidden = false;
  byId('description').focus();
}

function deleteExpense(id) {
  const expense = state.expenses.find(item => item.id === id);
  if (!expense || !window.confirm(`Delete "${expense.description}" (${money(expense.amountCents)})?`)) return;
  if (saveState({ ...state, expenses: state.expenses.filter(item => item.id !== id) }, 'Expense deleted.')) {
    if (editingId === id) resetForm();
  }
}

byId('budget-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const cents = model.toCents(byId('budget').value, true);
    saveState({ ...state, budgets: { ...state.budgets, [byId('month').value]: cents } }, 'Monthly budget saved.');
  } catch (error) { showMessage(error.message, true); }
});
byId('cancel-edit').addEventListener('click', resetForm);
byId('month').addEventListener('change', () => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(byId('month').value)) { byId('month').value = localToday.slice(0, 7); showMessage('Choose a valid month.', true); }
  render();
});
byId('filter').addEventListener('change', render);
render();
