# Requirements Analysis

Scenario: Simple Student Expense Tracker. This is a proposed implementation based on the user's request and the general IT 415 midterm instructions. Confirm it against the instructor's assigned scenario page before submission.

## 1. Problem

Students may lose track of everyday expenses and overspend their allowance. They need a quick way to record purchases and review their monthly spending.

## 2. Target users

Students who want to track personal spending in Philippine pesos on their own device.

## 3. Functional requirements

- Add an expense with a description, amount, category, and date.
- View, edit, and delete recorded expenses.
- Calculate monthly spending and show an expense count.
- Set a budget for each month and calculate remaining money or overspending.
- Filter expenses by month and category.
- Validate inputs and display success or error messages.
- Preserve expenses and budgets after refreshing the page using browser storage.

## 4. Required inputs

Description (1–80 non-whitespace characters), amount (₱0.01–₱1,000,000; up to two decimal places), category, and a valid date. Optional monthly budget (₱0–₱1,000,000), month filter, and category filter.

## 5. Expected outputs

A dated list of expenses; monthly total; count of expenses; monthly budget; remaining amount or over-budget amount; a budget usage indicator; filtered category subtotal; and clear validation and save messages.

## 6. Proposed features

A single-page expense form, an expense table with edit/delete actions, monthly budget overview, month/category filters, responsive design, and local persistence. These features are implemented. The instructor's required branch feature is still unknown.

## 7. Tools and technologies

HTML for structure, CSS for styling, JavaScript for behavior, `localStorage` for persistence, Git/GitHub for version control, and Codex for AI assistance. Node.js is optional for running the included automated checks and is not required to use the app.
