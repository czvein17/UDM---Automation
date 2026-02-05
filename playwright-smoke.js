import { chromium } from "playwright-core";

console.log("1) Starting Playwright smoke test...");

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

(async () => {
    try {
        console.log("2) Launching browser...");
        const browser = await chromium.launch({
            headless: false,
            executablePath: EDGE_PATH,
            args: [
                "--no-sandbox",
                "--disable-gpu",
                "--disable-dev-shm-usage",
            ],
        });

        console.log("3) Browser launched.");

        const page = await browser.newPage();
        console.log("4) Opening about:blank...");
        await page.goto("about:blank", { waitUntil: "domcontentloaded" });

        console.log("5) SUCCESS — Playwright works on this machine.");
        console.log("Close the browser window to exit.");

        await new Promise((resolve) => browser.on("disconnected", resolve));
    } catch (err) {
        console.error("❌ FAILED");
        console.error(err);
        process.exit(1);
    }
})();
