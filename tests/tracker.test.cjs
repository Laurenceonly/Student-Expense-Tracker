// Dependency-free checks. This small DOM mock tests behavior, not browser layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const model = require('../js/model.js');

let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function boot(storage = { value: null }) {
  class Element {
    constructor() { this.value = ''; this.textContent = ''; this.hidden = false; this.children = []; this.listeners = {}; this.classes = new Set(); this.classList = { toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name) }; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    trigger(name) { this.listeners[name]({ preventDefault() {} }); }
    append(child) { this.children.push(child); }
    replaceChildren() { this.children = []; }
    insertCell() { const child = new Element(); this.append(child); return child; }
    setAttribute() {}
    focus() {}
    querySelector(name) { return this.parts[name]; }
  }
  const ids = [...fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8').matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
  elements.empty.parts = { h3: new Element(), p: new Element() };
  elements['expense-form'].reset = () => { for (const key of ['description', 'amount', 'category', 'date']) elements[key].value = ''; };
  const window = { TrackerModel: model, confirm: () => true };
  const context = vm.createContext({ window, document: { getElementById: id => elements[id], createElement: () => new Element() }, localStorage: { getItem: () => storage.value, setItem: (key, value) => { if (storage.fail) throw new Error('Storage full'); storage.value = value; } }, Intl, Date, crypto: require('node:crypto').webcrypto, console });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8'), context);
  function add(description, amount, date = elements.date.value) {
    elements.description.value = description;
    elements.amount.value = amount;
    elements.category.value = 'Food';
    elements.date.value = date;
    elements['expense-form'].trigger('submit');
  }
  return { elements, storage, add, window };
}

check('Currency uses exact integer cent totals', () => assert.equal(model.toCents('0.10') + model.toCents('0.20'), 30));
check('Invalid amounts are rejected', () => { for (const amount of ['', '-1', '0', '1.001', '1e3', '1000001', 'Infinity']) assert.throws(() => model.toCents(amount)); });
check('Zero budget is allowed', () => assert.equal(model.toCents('0', true), 0));
check('Calendar dates are validated', () => { assert.equal(model.validDate('2026-02-30'), false); assert.equal(model.validDate('2024-02-29'), true); });
check('Whitespace descriptions and unknown categories are rejected', () => {
  assert.throws(() => model.validateExpense({ description: ' ', amount: '20', category: 'Food', date: '2026-10-06' }));
  assert.throws(() => model.validateExpense({ description: 'Lunch', amount: '20', category: 'Unknown', date: '2026-10-06' }));
});
check('Month and category filters give accurate totals', () => {
  const data = [{ date: '2026-10-06', category: 'Food', amountCents: 8550 }, { date: '2026-10-05', category: 'Transport', amountCents: 2000 }, { date: '2026-09-30', category: 'Food', amountCents: 500 }];
  assert.equal(model.total(model.forMonth(data, '2026-10')), 10550);
  assert.equal(model.total(model.forMonth(data, '2026-10', 'Food')), 8550);
});
check('Corrupt data and duplicate IDs are rejected', () => {
  assert.throws(() => model.parseState('{bad'));
  assert.throws(() => model.parseState(JSON.stringify({ expenses: [], budgets: { '2026-13': 500 } })));
  const e = { id: 'same', description: 'Lunch', amountCents: 2000, date: '2026-10-06', category: 'Food' };
  assert.throws(() => model.parseState(JSON.stringify({ expenses: [e, e], budgets: {} })));
});
check('Add, edit, cancel, and delete update the saved records', () => {
  const app = boot(); app.add('Lunch', '85.50');
  assert.equal(JSON.parse(app.storage.value).expenses[0].amountCents, 8550);
  let row = app.elements['expense-list'].children[0];
  row.children[3].children[0].trigger('click');
  app.elements.amount.value = '90'; app.elements['expense-form'].trigger('submit');
  assert.equal(JSON.parse(app.storage.value).expenses.length, 1);
  assert.equal(JSON.parse(app.storage.value).expenses[0].amountCents, 9000);
  row = app.elements['expense-list'].children[0]; row.children[3].children[0].trigger('click');
  app.elements['cancel-edit'].trigger('click'); assert.equal(app.elements['save-expense'].textContent, 'Add expense');
  row.children[3].children[1].trigger('click'); assert.equal(JSON.parse(app.storage.value).expenses.length, 0);
});
check('Canceling deletion preserves the record', () => {
  const app = boot(); app.add('Lunch', '50'); app.window.confirm = () => false;
  app.elements['expense-list'].children[0].children[3].children[1].trigger('click');
  assert.equal(JSON.parse(app.storage.value).expenses.length, 1);
});
check('Reload restores expenses and monthly budget', () => {
  const app = boot(); app.add('Lunch', '50'); app.elements.budget.value = '500'; app.elements['budget-form'].trigger('submit');
  const restored = boot(app.storage); assert.equal(restored.elements['expense-list'].children.length, 1);
  assert.equal(restored.elements['remaining'].textContent, new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(450));
});
check('Over-budget and zero-budget states remain finite', () => {
  const app = boot(); app.add('Lunch', '50'); app.elements.budget.value = '0'; app.elements['budget-form'].trigger('submit');
  assert.equal(app.elements['remaining-label'].textContent, 'Over budget'); assert.equal(app.elements['budget-progress'].value, 100);
});
check('A different month expense becomes visible after adding', () => {
  const app = boot(); app.add('Old expense', '40', '2025-03-01');
  assert.equal(app.elements.month.value, '2025-03'); assert.equal(app.elements['expense-list'].children.length, 1);
});
check('HTML-looking descriptions are inserted as plain text', () => {
  const app = boot(); app.add('<img src=x onerror=alert(1)>', '10');
  assert.equal(app.elements['expense-list'].children[0].children[0].textContent, '<img src=x onerror=alert(1)>');
});
check('Failed storage writes keep the previous data and input', () => {
  const app = boot(); app.add('Lunch', '50'); const previous = app.storage.value; app.storage.fail = true; app.add('Fare', '20');
  assert.equal(app.storage.value, previous); assert.equal(app.elements.description.value, 'Fare'); assert.equal(app.elements.message.classes.has('error'), true);
});
check('Corrupt saved data is not overwritten', () => {
  const app = boot({ value: '{bad' }); app.add('Lunch', '50'); assert.equal(app.storage.value, '{bad');
});
console.log(`\n${passed} checks passed. Browser layout and native controls still need a manual check.`);
