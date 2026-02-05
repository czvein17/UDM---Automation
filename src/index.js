import path from "node:path";
import { fileURLToPath } from "node:url";

import { getConfig } from "./config/config.js";
import { createBrowser } from "./browser/createBrowser.js";
import { createCtx } from "./context/createCtx.js";
import { ensureLoggedIn } from "./auth/ensureLoggedIn.js";
import { readExcel } from "./input/excel.js";
import { runFromExcel } from "./runner/runFromExcel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const mode = process.argv[2] || "run"; // default: run

    const config = getConfig();
    const { browser, context, page } = await createBrowser(config);
    const ctx = createCtx({ browser, context, page, config });

    await ensureLoggedIn(ctx);

    if (mode === "login") {
        console.log("✅ Logged in. Close browser to exit.");
        await new Promise((resolve) => browser.on("disconnected", resolve));
        return;
    }

    // ✅ default Excel path = src/data.xlsx
    const excelPath = path.join(__dirname, "data.xlsx");

    console.log("📄 Reading Excel:", excelPath);
    const { rows } = readExcel(excelPath);

    await runFromExcel(ctx, rows);

    await ctx.context.storageState({ path: ctx.config.storageState });
    // await browser.close();
}

main().catch((e) => {
    console.error("❌ Fatal:", e);
    process.exit(1);
});
