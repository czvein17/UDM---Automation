import { goToApplicabilitiesTab } from "../actions/goToApplicabilitiesTab.js";
import { selectLanguage } from "../actions/selectLanguage.js";
import { ensureUnlocked } from "../actions/ensureUnlocked.js";

/**
 * editTranslation accepts an optional elementId so unlocking state can be reused.
 * @param {{state:Object,config:Object}} ctx
 * @param {import('playwright-core').Page} tab
 * @param {string} [elementId]
 */
export async function editTranslation(ctx, tab, elementId) {
    console.log("Editing translation...");

    await goToApplicabilitiesTab(ctx, tab);
    await selectLanguage(ctx, tab,);

    await tab.waitForTimeout(500);
    const unlockStatus = await ensureUnlocked(ctx, tab, elementId);
    console.log("Unlock State: ", unlockStatus)
}