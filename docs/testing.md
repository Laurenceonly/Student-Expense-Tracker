# Testing

## Automated checks performed

Command: `node tests/tracker.test.cjs`

Result: 15 checks passed. The checks cover exact centavo totals, invalid amounts, zero budgets, calendar dates, blank descriptions, unknown categories, filters, invalid saved data, duplicate IDs, add/edit/cancel/delete behavior, deletion cancellation, restoring state, over-budget behavior, saving expenses in another month, plain-text rendering, and storage write failures.

The interaction checks use a small in-memory DOM mock and fake local storage. They verify application logic but do not exercise a real browser's native date/number inputs, file storage behavior, CSS, accessibility tree, or layout. JavaScript syntax checks also passed for both source files.

## Manual browser checks still to complete

Use sample data you can remove after testing. Record actual results rather than marking these passed in advance.

| Test | Steps | Expected result | Actual result |
| --- | --- | --- | --- |
| Add expense | Add Lunch, ₱85.50, Food, today's date | One row; total ₱85.50; success message | Pending |
| Validate fields | Submit empty fields, blank description, zero/negative amount, and three decimal places | Error; no record saved | Pending |
| Edit | Change Lunch to ₱90.00 | Existing row updated; total ₱90.00 | Pending |
| Cancel editing | Edit a row, change input, then cancel | Saved row unchanged; form returns to add mode | Pending |
| Set budget | Set budget to ₱500.00 | With ₱90.00 spending, remaining ₱410.00 | Pending |
| Over budget | Set budget to ₱50.00 | Over-budget amount ₱40.00 | Pending |
| Zero budget | Set budget to ₱0 | Valid budget; no broken progress indicator | Pending |
| Filter | Add Transport expense and filter Food | Only Food rows; separate Food subtotal; monthly total unchanged | Pending |
| Month | Switch to another month and set its budget | Independent expenses and budget | Pending |
| Persistence | Reload after saving | Expenses and budgets remain | Pending |
| Delete | Cancel a deletion, then confirm it | Cancel preserves row; confirm removes it and updates total | Pending |
| Plain text | Enter `<b>Lunch</b>` as the description | Text displayed literally | Pending |
| Mobile | Open at a narrow width (about 375 px) | Form stacks above list; table scrolls when needed | Pending |
| Keyboard | Use Tab, type fields, and activate buttons | Visible focus and usable controls | Pending |

## Saved-data recovery

If the app reports damaged saved data, first inspect or back up the `student-expense-tracker-v1` entry in the browser's developer tools under local storage. Do not clear it if you need its contents. Removing that specific key starts the tracker over and permanently removes those saved expenses and budgets. Reload after restoring or deliberately resetting the entry.
