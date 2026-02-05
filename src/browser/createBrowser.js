import { chromium, firefox, webkit } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";

export async function createBrowser(config) {
    mkdirSync("state", { recursive: true });

    const launcher =
        config.engine === "chromium" ? chromium :
            config.engine === "firefox" ? firefox :
                webkit;

    const launchOptions = {
        headless: config.headless,
        args: ["--start-maximized"],
    };

    // Prefer channel for system Edge/Chrome (no downloads)
    if (config.engine === "chromium") {
        if (config.channel) {
            launchOptions.channel = config.channel; // "msedge" or "chrome"
        } else if (config.edgeExe) {
            launchOptions.executablePath = config.edgeExe;
        }
    }

    const browser = await launcher.launch(launchOptions);

    const context = await browser.newContext({
        viewport: null,
        storageState: existsSync(config.storageState)
            ? config.storageState
            : undefined,
    });

    context.setDefaultTimeout(config.timeoutMs);
    context.setDefaultNavigationTimeout(config.timeoutMs);

    const page = await context.newPage();

    return { browser, context, page };
}
