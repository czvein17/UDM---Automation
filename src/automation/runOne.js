import { markRunning } from "../runner/statusTracker.js";
import { buildTargetUrl } from "./buildTargetUrl.js";
import { ELEMENTS } from "../selectors/index.js";
import { detectStatus } from "../utils/detectStatus.js";
import { editTranslation } from "./EditTranslation/index.js";
import { openTranslation } from "./OpenTranslation/index.js";
import { addApplicabilities } from "./AddApplicabilities/index.js";

function getFirst(row, keys = []) {
    for (const k of keys) {
        if (k in row && row[k] != null && String(row[k]).trim() !== "") return row[k];
    }
    return undefined;
}
const normalize = (s = "") => s.replace(/\s+/g, " ").trim().toLowerCase();

export async function runOne(ctx) {
    const row = ctx.state.row;
    const task = (ctx.config.task || ctx.config.TASK || "").toString().replace(/['"]/g, "").trim().toLowerCase();
    const url = buildTargetUrl(row);

    markRunning(ctx, `Open tab → ${url}`);
    const tab = await ctx.context.newPage();

    try {
        await tab.goto(url, { waitUntil: "domcontentloaded" });

        const waitTimeout = Number(ctx.config.timeoutMs || ctx.config.TIMEOUT_MS) || 30000;
        await tab.waitForSelector(ELEMENTS.ELEMENTS_CONTAINER, { timeout: waitTimeout });
        markRunning(ctx, `Page loaded (${ELEMENTS.ELEMENTS_CONTAINER} present)`);

        const statusText = await detectStatus(tab);
        markRunning(ctx, `Element status: ${statusText}`);
        console.log(statusText);

        // --- formatted per-row log block ---
        const elementId = getFirst(row, ["Element ID", "ElementId", "elementId", "id", "ID"]);
        const tableName = getFirst(row, ["Table Name", "TableName", "table", "Table"]);
        const fieldName = getFirst(row, ["Field Name", "FieldName", "field", "Field"]);

        console.log("----------------------------------------------------------");
        console.log(`Element ID: ${elementId ?? ""}`);
        console.log(`Table Name: ${tableName ?? ""}`);
        console.log(`Field: Name: ${fieldName ?? ""}`);
        console.log(`Task: ${task}`);
        console.log(`Status: ${statusText}`);
        // --- end log block ---

        // read input value (inputs have no textContent)
        const fieldLoc = tab.locator(ELEMENTS.FIELD_NAME_SELECTOR).first();
        const pageFieldName = (await fieldLoc.inputValue()).trim();
        console.log("Field name on page:", `"${pageFieldName}"`);

        if (fieldName && normalize(pageFieldName) !== normalize(String(fieldName))) {
            ctx.state.status = "fieldName dont match";
            markRunning(ctx, `Field name mismatch — page="${pageFieldName}" expected="${fieldName}"`);
            console.log("Skipping row due to field name mismatch.");
            return;
        }

        markRunning(ctx, "Field name matches, continuing...");

        // handle non-approved statuses for global tracking
        const st = normalize(statusText);
        if (st !== "approved") {
            if (st.includes("draft")) ctx.state.status = "Draft";
            else if (st.includes("pending")) ctx.state.status = "Pending";
            else ctx.state.status = "Not Approve";

            markRunning(ctx, `Skipping: status is ${statusText}`);
            console.log(`Skipping row: status "${statusText}"`);
            return;
        };

        switch (task) {
            case "re-approve":
                ctx.state.status = "Re-Approve";
                console.log("Re-approving element...");
                break;
            case "re-approve translation":
                ctx.state.status = "Re-Approve";
                console.log("Re-approving translation...");
                break;
            case "edit translation":
                await editTranslation(ctx, tab);
                break;
            case "open-translation": {
                await openTranslation(ctx, tab)
            };
            case "edit-applicabilities":
                // console.log("Editing applicabilities...");
                await addApplicabilities(ctx, tab)
                break;
            default:
                throw new Error(`Unknown task: ${task}`);
        }

    } finally {
        console.log("Row Finish");
        console.log("----------------------------------------------------------------");
    }
}
