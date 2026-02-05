import { ELEMENTS } from "../../selectors/index.js";

/**
 * Open language selector and pick the requested language (by visible text).
 * Throws if language option is not found.
 *
 * @param {{config: Object}} ctx
 * @param {import('playwright-core').Page} tab
 * @param {string} language
 */
export async function selectLanguage(ctx, tab) {
    const lang = String(ctx?.config?.translationLanguage || "").trim();
    if (!lang) throw new Error("selectLanguage: no language specified");

    const timeout = Number(ctx?.config?.timeoutMs) || 30000;

    // ✅ ensure app is hydrated
    await tab.waitForSelector("app-root", { timeout });

    const toggle = tab.locator(ELEMENTS.LANGUAGE_TOGGLE_SELECTOR).first();
    await toggle.waitFor({ state: "visible", timeout });
    await toggle.click();

    const list = tab.locator(ELEMENTS.LANGUAGE_LIST_SELECTOR).first();
    await list.waitFor({ state: "visible", timeout });

    const option = list.locator(`li:has-text("${lang}")`).first();
    if (await option.isVisible().catch(() => false)) {
        await option.click();
    } else {
        const simplified = lang.replace(/\s*\(.*\)/, "").trim();
        const fallback = list.locator(`li:has-text("${simplified}")`).first();

        if (await fallback.isVisible().catch(() => false)) {
            await fallback.click();
        } else {
            await tab.keyboard.press("Escape").catch(() => { });
            throw new Error(`selectLanguage: option not found for "${lang}"`);
        }
    }

    // best-effort overlay wait
    await tab
        .waitForSelector(".p-select-overlay", { state: "detached", timeout })
        .catch(() => { });
}
