import { ELEMENTS } from "../../selectors/index.js";

/**
 * Click the page-level Save button and wait until the Approve button becomes enabled.
 * Returns true when approve is enabled, false otherwise.
 *
 * @param {{config:Object}} ctx
 * @param {import('playwright-core').Page} tab
 */
export async function toggleSaveBtn(ctx, tab) {
    const timeout = Number(ctx?.config?.TIMEOUT_MS || ctx?.config?.timeoutMs) || 30000;
    const saveSel = ELEMENTS.BTN_SAVE_CONTAINER;
    const approveSel = ELEMENTS.BTN_APPROVE_CONTAINER;
    const spinnerSel = ELEMENTS.SPINNER_SELECTOR || ".ngx-spinner-overlay";

    const saveBtn = tab.locator(saveSel).first();
    if ((await saveBtn.count()) === 0) {
        console.log("toggleSaveBtn: save button not found.");
        return false;
    }

    // wait for any global spinner to disappear
    await tab.waitForSelector(spinnerSel, { state: "detached", timeout }).catch(() => { });

    // try clicking save with small retries to avoid transient overlay/spinner issues
    let clicked = false;
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            await saveBtn.waitFor({ state: "visible", timeout: Math.min(5000, timeout) });
            if (!(await saveBtn.isEnabled())) {
                // if not enabled, bail early
                console.log("toggleSaveBtn: save button is disabled.");
                return false;
            }
            await saveBtn.click({ timeout: Math.min(10000, timeout) });
            clicked = true;
            break;
        } catch (err) {
            lastErr = err;
            // wait briefly for spinner to clear then retry
            await tab.waitForSelector(spinnerSel, { state: "detached", timeout: 3000 }).catch(() => { });
            await new Promise((r) => setTimeout(r, 200 * attempt));
        }
    }

    if (!clicked) {
        console.warn(`toggleSaveBtn: failed to click save button: ${lastErr?.message || "unknown"}`);
        return false;
    }

    // after clicking, wait for approve button to become enabled (no 'disabled' attribute)
    try {
        await tab.waitForFunction(
            (selector) => {
                const el = document.querySelector(selector);
                return !!el && !el.hasAttribute("disabled") && !el.disabled;
            },
            approveSel,
            { timeout }
        );
        console.log("toggleSaveBtn: approve button enabled — save succeeded.");
        return true;
    } catch {
        console.warn("toggleSaveBtn: approve button did not become enabled within timeout.");
        return false;
    }
}