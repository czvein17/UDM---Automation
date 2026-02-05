import { goToApplicabilitiesTab } from "../actions/goToApplicabilitiesTab.js";
import { selectLanguage } from "../actions/selectLanguage.js";
import { ensureUnlocked } from "../actions/ensureUnlocked.js";
import { editDisplayName } from "./editDisplayName.js";
import { toggleSaveBtn } from "../actions/toggleSaveBtn.js";
import { markRunning } from "../../runner/statusTracker.js";

export async function editTranslation(ctx, tab, elementId) {
    console.log("Editing translation...");

    await goToApplicabilitiesTab(ctx, tab);
    await selectLanguage(ctx, tab, ctx?.config?.TRANSLATION_LANGUAGE || ctx?.config?.translationLanguage);

    const delayMs = Number(ctx?.config?.SLOW_UI_DELAY_MS || 3000);
    if (delayMs > 0) {
        console.log(`Waiting ${delayMs}ms for UI to settle...`);
        await new Promise((r) => setTimeout(r, delayMs));
    }

    // track unlock attempt
    ctx.state.status = "Unlock";
    markRunning(ctx, "Attempting unlock if needed...");
    const unlockStatus = await ensureUnlocked(ctx, tab, elementId);

    // after ensureUnlocked mark unlocked
    ctx.state.status = "Unlocked";
    markRunning(ctx, `Unlock result: ${unlockStatus}`);
    console.log("Unlock State:", unlockStatus);

    // edit display name and record result
    await editDisplayName(ctx, tab);
    ctx.state.status = "Display Name Edited";
    markRunning(ctx, "Display name edited");

    const saved = await toggleSaveBtn(ctx, tab);
    if (saved) markRunning(ctx, "Save applied");
}