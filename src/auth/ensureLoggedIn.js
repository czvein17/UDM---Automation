import { mkdirSync } from "node:fs";

export async function ensureLoggedIn(ctx) {
    const { page, context, config } = ctx;

    const STRONG_INSIDE = '#axis-main-content > ss-app > div > div > ss-survey-cycle > div';
    const strong = page.locator(STRONG_INSIDE).first();

    await page.goto(config.baseUrl, { waitUntil: "domcontentloaded" });

    // ✅ if we can see strong marker quickly, we're inside
    try {
        await strong.waitFor({ state: "visible", timeout: config.timeoutMs });
        console.log("🔓 Inside app (authenticated).");
        await context.storageState({ path: config.storageState });
        return;
    } catch { }

    const urlNow = page.url();
    const hostNow = new URL(urlNow).host;

    // ✅ only treat as SSO if actually on auth host
    if (hostNow.includes("auth.ehr.com")) {
        console.log("🔐 On SSO. Please complete login/MFA...");
        console.log("SSO URL:", urlNow);

        await page.waitForFunction(
            (expectedHost) => location.host === expectedHost,
            { timeout: 0 },
            new URL(config.baseUrl).host
        );

        await strong.waitFor({ state: "visible", timeout: 0 });

        console.log("✅ Login completed – inside app.");
        await context.storageState({ path: config.storageState });
        return;
    }

    // Otherwise: likely wrong marker for this page
    mkdirSync("artifacts", { recursive: true });
    await page.screenshot({ path: "artifacts/inside_marker_missing.png", fullPage: true });

    throw new Error(
        `Authenticated check failed: not on SSO host, but inside marker not found. Current URL=${urlNow}. Screenshot saved: artifacts/inside_marker_missing.png`
    );
}
