import { ELEMENTS } from "../selectors/index.js";

/**
 * Read element status (approved / pending / draft / unknown) in a single place.
 * Returns a lowercase status string.
 */
export async function detectStatus(tab) {
    const locator = tab.locator(`${ELEMENTS.ELEMENTS_CONTAINER} ${ELEMENTS.STATUS_SELECTOR}`).first();
    try {
        const [classAttr, text] = await Promise.all([locator.getAttribute("class"), locator.textContent()]);
        const combined = ((classAttr || "") + " " + (text || "")).toLowerCase();

        if (combined.includes(ELEMENTS.STATUS_APPROVED_CLASS) || combined.includes("approved")) return "approved";
        if (combined.includes(ELEMENTS.STATUS_PENDING_CLASS) || combined.includes("pending")) return "pending";
        if (combined.includes(ELEMENTS.STATUS_DRAFT_CLASS) || combined.includes("draft")) return "draft";
        return (text || "").trim().toLowerCase() || "unknown";
    } catch {
        return "unknown";
    }
}