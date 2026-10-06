# Student Expense Tracker

A simple student expense tracker made with HTML, CSS, and JavaScript. Record spending in Philippine pesos and see how much of your monthly allowance remains.

## Run the app

Open `index.html` in Chrome, Edge, or Firefox. No installation, database, or server is needed. Use the same browser and file location each time to keep access to saved data.

1. Enter a description, amount, category, and date, then click **Add expense**.
2. Enter a monthly budget and click **Set budget**.
3. Choose a month or category to review your spending.
4. Click **Edit** to update an expense or **Delete** to remove it after confirmation.

## Features

- Add, edit, and delete expenses.
- Categories: Food, Transport, School supplies, Load / Internet, Personal, and Other.
- Monthly spending, expense count, budget, remaining amount, and over-budget notice.
- Month and category filters, with a separate category subtotal.
- Input validation and clear success/error messages.
- Browser persistence through `localStorage`.
- Responsive layout and labeled keyboard-accessible controls.

Each month has its own budget. Category filters affect the expense list and category subtotal; the monthly overview always covers the entire selected month. Adding or editing an expense switches the view to that expense's month and clears the category filter so the saved record is visible.

## Project files

```text
index.html                  Page structure and forms
css/style.css               Desktop and mobile styles
js/model.js                 Validation, money helpers, filters, and totals
js/app.js                   Interface events, rendering, and browser storage
tests/tracker.test.cjs       Dependency-free automated behavior checks
docs/requirements-analysis.md
docs/ai-prompt-log.md
docs/testing.md
docs/submission-checklist.md
docs/screenshots/README.md
```

## How the code works

Expenses have an ID, description, amount in integer centavos, category, and date. Money is stored in centavos to avoid floating-point addition errors, such as `0.1 + 0.2`. `model.js` validates input and calculates totals. `app.js` listens for form submissions, writes state to browser storage, and updates the page. Descriptions are rendered using `textContent` so typed HTML is displayed as text.

The storage key is `student-expense-tracker-v1`. Expenses and monthly budgets are saved together as JSON. Data is written before updating the visible state; a failed write shows an error and preserves the previous data. Damaged saved data is not silently overwritten.

## Tests

If Node.js is installed, run:

```sh
node tests/tracker.test.cjs
```

All 15 automated checks passed during development. These include behavior checks using a small DOM mock; they do not replace testing in a real browser. See `docs/testing.md` for the manual checklist.

## Limitations

Data belongs to this browser on this device and is not synced or backed up. Clearing browser data can remove it. Some browsers restrict storage for local files or private windows. If saving is blocked, use a normal browser window with local storage enabled. Avoid editing the tracker in multiple tabs at the same time. Amounts and budgets are limited to ₱1,000,000 each, with at most two decimal places. Expense dates from 1900 through 9999 are accepted, including future dates.

## Midterm status

The supplied general instructions were used as requirements context. The specific assigned scenario page was not provided, so its exact required features and branch feature still need confirmation. The app and draft documentation are present; GitHub publishing, staged commits, a feature branch/pull request, browser screenshots, and the student's own evaluation remain to be completed. No Git history or evidence has been fabricated. See `docs/submission-checklist.md`.
