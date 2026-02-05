import { ELEMENTS } from "../../selectors/index.js";

/**
 * If an Unlock button is visible, click it and confirm the dialog.
 * Returns 'unlocked' when it performed an unlock, 'already-unlocked' when no unlock action was needed.
 *
 * @param {{config: Object}} ctx
 * @param {import('playwright-core').Page} tab
 */
export async function ensureUnlocked(ctx, tab) {
    const timeout = Number(ctx?.config?.TIMEOUT_MS || ctx?.config?.timeoutMs) || 30000;
    // fallback to common dialog containers if selector not set
    const dialogSelector = ELEMENTS.DIALOG_SELECTOR || "mat-dialog-container, .mat-mdc-dialog-container";
    const unlockBtn = tab.locator(ELEMENTS.BTN_UNLOCK_CONTAINER).first();

    if (
        !(await unlockBtn.count()) ||
        !(await unlockBtn.isVisible())
    ) {
        console.log("🔓 Element already unlocked (no unlock control present).");
        return "already-unlocked";
    }

    console.log("🔒 Element locked — attempting unlock...");
    await unlockBtn.click();
    await tab.waitForTimeout(500); // wait for potential dialog to appear
    await tab.waitForSelector(dialogSelector, { state: "visible", timeout });

    // Try to find and click an "Unlock" button inside any overlay using evaluation (robust to different containers)
    const clicked = await tab.evaluate(() => {
        const containers = Array.from(document.querySelectorAll("cdk-overlay-container, .cdk-overlay-container, mat-dialog-container, .mat-mdc-dialog-container"));
        for (const c of containers) {
            const buttons = Array.from(c.querySelectorAll("button"));
            for (const b of buttons) {
                const txt = (b.innerText || b.textContent || "").trim().toLowerCase();
                if (txt.includes("unlock")) {
                    try { b.click(); } catch (e) { /* ignore */ }
                    return true;
                }
            }
        }
        return false;
    });

    if (clicked) {
        await tab.waitForSelector(dialogSelector, { state: "detached", timeout }).catch(() => { });
        console.log("✅ Unlock confirmed (via overlay eval).");
        return "unlocked";
    }

}