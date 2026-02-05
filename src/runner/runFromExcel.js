import { runOne } from "../automation/runOne.js";
import {
    initRowStatus,
    markRunning,
    markSuccess,
    markFailed,
} from "./statusTracker.js";

export async function runFromExcel(ctx, rows) {
    console.log(`📄 Total rows: ${rows.length}`);

    ctx.state.results = []; // collect final results

    for (let i = 0; i < rows.length; i++) {
        ctx.state.rowIndex = i;
        ctx.state.row = rows[i];

        initRowStatus(ctx);
        markRunning(ctx, "Started processing row");

        console.log(`\n▶ Row ${i + 1}/${rows.length}`);

        try {
            await runOne(ctx);

            markSuccess(ctx, "Row completed successfully");
            console.log(`✅ Row ${i + 1} SUCCESS`);
        } catch (err) {
            markFailed(ctx, err, "Row failed during automation");
            console.log(err)
            console.error(`❌ Row ${i + 1} FAILED`);
        }

        // snapshot result for later export
        ctx.state.results.push({
            rowIndex: i,
            input: ctx.state.row,
            status: ctx.state.status,
        });
    }

    console.log("🎉 Processing finished.");
}
