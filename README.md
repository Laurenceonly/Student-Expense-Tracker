# Baon

Baon is a student expense tracker for managing a monthly allowance in Philippine pesos. Log canteen meals, fares, school supplies, and mobile load to see what you’ve spent and how much of your allowance is left.

## Run locally

Download or clone the repository and open [`index.html`](index.html) in your browser. Baon runs on plain HTML, CSS, and JavaScript. It requires no installation, account, server, or API key.

## Track an allowance

1. Choose a month and use **Set budget** to record that month’s allowance.
2. Use **Add expense** to log each purchase. Enter a description, amount, category, and date. Add a note if you need to remember what the purchase covered.
3. Use **Total spent** and **Remaining** to check your allowance. If spending exceeds the budget, the overview shows how far you went over.
4. Filter **Your expenses** by category to see its subtotal. The overview continues to show totals for the whole month. Use **Edit** or **Delete** to correct a record.

For example, with a ₱2,000 allowance, a ₱75 lunch and a ₱25 fare leave ₱1,900. Filtering by **Food** shows a ₱75 subtotal while **Total spent** still shows ₱100.

## Data and storage

Baon saves expenses and their monthly budgets in the browser’s local storage. Keep using the same browser profile and app address to access your records. Clearing that browser’s site data can erase them. Data does not sync across browsers or devices.

Amounts are stored as whole centavos so adding peso amounts preserves exact totals.

## Repository layout

| Path | Purpose |
| --- | --- |
| [`index.html`](index.html) | Expense form, monthly overview, and expense table |
| [`css/`](css/) and [`assets/`](assets/) | Styles, brand mark, and favicon |
| [`js/model.js`](js/model.js) | Expense validation, centavo calculations, filtering, and monthly totals |
| [`js/app.js`](js/app.js) | Form handling, rendering, and browser storage |
| [`tests/`](tests/) | Automated checks for the model and app behavior |
| [`docs/testing.md`](docs/testing.md) | Test coverage and manual browser checklist |

## Run the tests

With Node.js installed, run this command from the repository root.

```sh
node tests/tracker.test.cjs
```

The suite covers expense entry and editing, monthly budgets, filtering, and storage failures. Follow the [browser checklist](docs/testing.md) to verify layout and native form controls.
