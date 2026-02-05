import { ELEMENTS } from '../../selectors/index.js';
/**
 * Click the "Applicabilities" tab and wait for its panel to be visible.
 *
 * @param {{config: Object}} ctx
 * @param {import('playwright-core').Page} tab
 */
export async function goToApplicabilitiesTab(ctx, tab) {
    const selector = ELEMENTS.APPLICABILITIES_TAB_SELECTOR;
    const waitTimeout = Number(ctx?.config?.TIMEOUT_MS || ctx?.config?.timeoutMs) || 30000;

    const tabBtn = tab.locator(selector).first();
    await tabBtn.waitFor({ state: "visible", timeout: waitTimeout });

    // get panel id from aria-controls if available, click the tab, then wait for panel
    const panelId = (await tabBtn.getAttribute("aria-controls")) || null;
    await tabBtn.click();

    if (panelId) {
        await tab.waitForSelector(`#${panelId}`, { timeout: waitTimeout });
    } else {
        // fallback: wait for the tab's aria-selected to become true
        await tab.waitForFunction(
            (sel) => document.querySelector(sel)?.getAttribute("aria-selected") === "true",
            selector,
            { timeout: waitTimeout }
        );
    }
}