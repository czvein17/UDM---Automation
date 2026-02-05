import { markRunning } from "../runner/statusTracker.js";
import { buildTargetUrl } from "./buildTargetUrl.js";

export async function runOne(ctx) {
    const row = ctx.state.row;

    console.log(row)
    const url = buildTargetUrl(row);
    markRunning(ctx, `Open tab → ${url}`);

    // ✅ new tab inside same authenticated context
    const tab = await ctx.context.newPage();

    try {
        // Optional: maximize-like behavior
        // (context viewport:null in createBrowser already handles window sizing)

        await tab.goto(url, { waitUntil: "domcontentloaded" });

        // TODO: replace with real "page ready" selector for that page
        // Use something stable on those screens.
        await tab.waitForSelector("app-root", { timeout: ctx.config.timeoutMs });

        markRunning(ctx, "Page loaded");

        // Later: do actual actions using Field Name / Element Name etc.
        // e.g. await doSomething(tab, row);

    } finally {
        // await tab.close();
        // markRunning(ctx, "Tab closed");
        console.log("Row Finish")
    }
}
