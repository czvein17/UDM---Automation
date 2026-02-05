import { ELEMENTS } from "../../selectors/index.js";
import { getFirst } from "../../utils/getFirst.js";

export async function editDisplayName(ctx, tab) {
    const desiredValue = getFirst(ctx.state.row, ["Display Name", "displayName", "DisplayName"])

    const timeout = Number(ctx?.config?.TIMEOUT_MS || ctx?.config?.timeoutMs) || 30000;
    const table = tab.locator(ELEMENTS.TABLE_SELECTOR).first();
    await table.waitFor({ state: "visible", timeout }).catch(() => { });

    const rows = await tab.locator(`${ELEMENTS.TABLE_SELECTOR} tbody tr`).count();
    const rowsToProcess = Math.max(0, rows - 1); // skip footer row

    const normalize = (s = "") => String(s).replace(/\s+/g, " ").trim();

    for (let i = 0; i < rowsToProcess; i++) {
        const rowLocator = tab.locator(`${ELEMENTS.TABLE_SELECTOR} tbody tr`).nth(i);

        if ((await rowLocator.count()) === 0) continue;

        await rowLocator.waitFor({ state: "visible", timeout: Math.min(5000, timeout) }).catch(() => { });

        const cell = rowLocator.locator("td").nth(1); // second column
        if ((await cell.count()) === 0) {
            console.warn(`Row ${i}: target cell not found, skipping`);
            continue;
        }
        await cell.waitFor({
            state: "visible",
            timeout: Math.min(5000, timeout)
        })
            .catch(() => { });

        try {
            // read current value
            let current = "";

            const input = cell.locator("input, textarea").first();
            if (await input.count()) {
                try {
                    current = (await input.inputValue()).trim();
                }
                catch {
                    current = String((await input.getAttribute("value")).trim() || "");
                }
            } else if (await cell.locator('[contenteditable="true"]').count()) {
                current = (await cell.locator('[contenteditable="true"]').textContent()).trim();
            } else {
                current = (await cell.textContent()).trim();
            }

            console.log(`Row ${i}: current="${current}" desired="${desiredValue}"`);

            if (normalize(current) === normalize(desiredValue)) {
                console.log(`Row ${i}: no change needed (skipped)`);
                continue;
            }

            // perform update
            await cell.scrollIntoViewIfNeeded();

            if (await input.count()) {
                await input.fill(String(desiredValue));
                console.log(`Row ${i}: filled input`);
            } else if (await cell.locator('[contenteditable="true"]').count()) {
                const editable = cell.locator('[contenteditable="true"]').first();
                await editable.click();
                // clear then type
                await editable.evaluate((el) => { el.innerText = ""; });
                await editable.type(String(desiredValue));
                console.log(`Row ${i}: updated contenteditable`);
            } else {
                await cell.click();
                await tab.keyboard.press("Control+A").catch(() => { });
                await tab.keyboard.type(String(desiredValue));
                console.log(`Row ${i}: typed into cell`);
            }
        } catch (err) {
            console.warn(`Row ${i}: failed to edit display name - ${err.message}`);
            continue;
        }
    }

    console.log("Display Name editing completed.");
}