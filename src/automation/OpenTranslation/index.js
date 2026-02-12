import { goToApplicabilitiesTab } from "../actions/goToApplicabilitiesTab.js";
import { selectLanguage } from "../actions/selectLanguage.js";

export async function openTranslation(ctx, tab) {
    console.log("Oppeing Translation");

    await goToApplicabilitiesTab(ctx, tab)
    await selectLanguage(ctx, tab)
}   