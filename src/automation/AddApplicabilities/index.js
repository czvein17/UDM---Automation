import { markRunning } from "../../runner/statusTracker.js";
import { goToApplicabilitiesTab } from "../actions/goToApplicabilitiesTab.js";
import { ensureUnlocked } from "../actions/ensureUnlocked.js";
import { ELEMENTS } from "../../selectors/index.js";

// Click the first valid row's edit button (`#edit-modal-tree`).
export async function addApplicabilities(ctx, tab, elementId) {
    await goToApplicabilitiesTab(ctx, tab);

    // Attempt unlock if needed
    ctx.state.status = "Unlock";
    markRunning(ctx, "Attempting unlock if needed...");
    const unlockStatus = await ensureUnlocked(ctx, tab, elementId);

    // after ensureUnlocked mark unlocked
    ctx.state.status = "Unlocked";
    markRunning(ctx, `Unlock result: ${unlockStatus}`);
    console.log("Unlock State:", unlockStatus);

    // Verify Valid Row (without "single test applicabilites") and click its edit button
    const tableSelector = ELEMENTS.TABLE_SELECTOR;
    try {
        await tab.waitForSelector(
            `${tableSelector} tbody`,
            {
                state: "visible",
                timeout: 5000
            });
    } catch (e) {
        console.log("Applicabilities table not found or not visible.");
        return;
    }

    const table = tab.locator(tableSelector);
    const rows = table.locator("tbody tr");
    const count = await rows.count();

    if (count === 0) {
        console.log("No rows found in applicabilities table.");
        return;
    }

    // Prefer a single DOM-eval pass: examine each row's first TD for chips and attempt to click the edit control.
    const result = await tab.evaluate((tableSelector) => {
        const table = document.querySelector(tableSelector);
        if (!table) return { clicked: false, reason: 'no-table' };
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const end = Math.max(0, rows.length - 1);

        for (let i = 0; i < end; i++) {
            const tr = rows[i];
            const td = tr.querySelector('td:first-child');
            const cellText = td ? (td.innerText || '').trim().toLowerCase() : '';

            // check chip labels inside the first cell for a Test Applicability marker
            const chipEls = td ?
                Array.from(td.querySelectorAll('mat-chip-option, .mat-mdc-chip, .mdc-evolution-chip, .mdc-evolution-chip__text-label'))
                : [];

            let hasTest = false;

            for (const c of chipEls) {
                const txt = (c.innerText || '').trim().toLowerCase();

                if (!txt) continue;

                if (txt.includes('test applicability') || txt.includes('test applicabilit')) {
                    hasTest = true;
                    break;
                }
            }

            if (hasTest) continue;

            // fallback text check
            if (cellText.includes('test applicability') || cellText.includes('single test')) continue;

            // search for edit controls inside the first cell, then the row
            const selectors = ['button#edit-modal-tree', '#edit-modal-tree', '.edit-row', 'button[matchipaction]'];
            for (const s of selectors) {
                const el = (td && td.querySelector(s)) || tr.querySelector(s);
                if (el) {
                    try {
                        el.scrollIntoView({
                            block: 'center'
                        });
                    }
                    catch (e) { }

                    try {
                        el.click();
                    }
                    catch (e) { }

                    return {
                        clicked: true, index: i
                    };
                }
            }

            // try clicking any button ancestor of an svg/icon inside the first cell
            if (td) {
                const svg = td.querySelector('svg, svg-icon');
                if (svg) {
                    const btn = svg.closest('button, [role="button"]');
                    if (btn) {
                        try {
                            btn.scrollIntoView({
                                block: 'center'
                            });
                        } catch (e) { }

                        try {
                            btn.click();
                        } catch (e) { }

                        return {
                            clicked: true,
                            index: i
                        };
                    }
                }
            }
        }

        return { clicked: false };
    }, tableSelector
    ).catch(
        (e) => ({
            clicked: false
        })
    );

    if (result && result.clicked) {
        ctx.state.status = "EditModalOpened";
        markRunning(ctx, `Opened edit modal for row ${result.index}`);
    } else {
        console.log("No valid row with an edit button was found.");
    }
}