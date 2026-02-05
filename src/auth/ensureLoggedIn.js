import { mkdirSync } from "node:fs";

export async function ensureLoggedIn(ctx) {
    const { page, context, config } = ctx;

    const STRONG_INSIDE = '#axis-main-content > ss-app > div > div > ss-survey-cycle > div';
    const strong = page.locator(STRONG_INSIDE).first();

    await page.goto(config.baseUrl, { waitUntil: "domcontentloaded" });

    // quick check: short timeout to detect already-authenticated state
    const shortTimeout = Number(config.timeoutMs || config.TIMEOUT_MS) || 3000;
    try {
        await strong.waitFor({ state: "visible", timeout: shortTimeout });
        console.log("🔓 Inside app (authenticated).");
        await context.storageState({ path: config.storageState });
        return;
    } catch { }

    const urlNow = page.url();
    const hostNow = new URL(urlNow).host;

    // If on the SSO host, wait for the user to complete login (no timeout)
    if (hostNow.includes("auth.ehr.com")) {
        console.log("🔐 On SSO. Please complete login/MFA in the opened browser — waiting until you're back in the app...");
        console.log("SSO URL:", urlNow);

        // wait for navigation back to the app host (no timeout)
        await page.waitForFunction(
            (expectedHost) => location.host === expectedHost,
            new URL(config.baseUrl).host,
            { timeout: 0 }
        );

        console.log("🔁 Returned to app host after SSO, navigating to baseUrl to ensure correct start page...");
        // navigate back to baseUrl (user may be redirected to a previous task)
        await page.goto(config.baseUrl, { waitUntil: "domcontentloaded" });

        // wait for the app's inside marker (use configured timeout)
        const waitTimeout = Number(config.TIMEOUT_MS) || 30000;
        await strong.waitFor({ state: "visible", timeout: waitTimeout });

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
