# Baon — Student Expense Tracker

**Know where your baon goes.** Baon helps students record spending in Philippine pesos and see how much of their monthly allowance remains.

## Highlights

- Add, edit, and delete expenses with categories and optional notes.
- Set a monthly budget and track spending, remaining allowance, and over-budget amounts.
- Filter records by month and category, with category subtotals.
- Clear input feedback and a responsive, keyboard-accessible interface.
- Save records locally in the browser.

## Built with

HTML, CSS, and JavaScript. The app stores money as integer centavos to avoid floating-point rounding errors, and uses browser `localStorage` for persistence. Automated behavior checks cover validation, totals, filtering, and saved data.

## Scope

Baon is a browser-based student project. Data stays on one device and is not synced or backed up. Clearing browser storage can remove saved records.

The [requirements analysis](docs/requirements-analysis.md) and [testing notes](docs/testing.md) provide more detail about the project.
