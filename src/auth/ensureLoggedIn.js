import { mkdirSync } from "fs";

export async function ensureLoggedIn(ctx) {
    const { page, context, config } = ctx;

    const APP_HOST = new URL(config.baseUrl).host;

    // ✅ Your inside-app marker (keep yours)
    const STRONG_INSIDE =
        "#axis-main-content > ss-app > div > div > ss-survey-cycle > div";
    const strong = page.locator(STRONG_INSIDE).first();

    await page.goto(config.baseUrl, { waitUntil: "domcontentloaded" });

    // quick check: already logged in?
    const shortTimeout = Number(config.timeoutMs || config.TIMEOUT_MS) || 3000;
    try {
        await strong.waitFor({ state: "visible", timeout: shortTimeout });
        console.log("🔓 Inside app (authenticated).");
        await context.storageState({ path: config.storageState });
        return;
    } catch { }

    // ✅ Treat these as SSO/IdP pages
    const SSO_HOSTS = new Set([
        "auth.ehr.com",
        "login.microsoftonline.com",
        "login.microsoft.com",
        "aadcdn.msauth.net",
        "aadcdn.msftauth.net",
    ]);

    const urlNow = page.url();
    let hostNow = "";
    try {
        hostNow = new URL(urlNow).host;
    } catch {
        hostNow = "";
    }

    const isSSOPage =
        hostNow === "" ||
        hostNow.includes("auth.ehr.com") ||
        hostNow.includes("microsoftonline.com") ||
        hostNow.includes("microsoft.com") ||
        SSO_HOSTS.has(hostNow);

    if (isSSOPage) {
        console.log("🔐 SSO detected. Please complete login/MFA in the opened browser.");
        console.log("SSO URL:", urlNow);

        // ✅ Wait until we're back to the app host (no timeout)
        await page.waitForURL(
            (u) => {
                try {
                    return new URL(u.toString()).host === APP_HOST;
                } catch {
                    return false;
                }
            },
            { timeout: 0 }
        );

        console.log("🔁 Returned to app host. Navigating to baseUrl to ensure correct start page...");
        await page.goto(config.baseUrl, { waitUntil: "domcontentloaded" });

        // ✅ Now wait for inside marker (normal timeout)
        const waitTimeout = Number(config.TIMEOUT_MS) || 30000;
        await strong.waitFor({ state: "visible", timeout: waitTimeout });

        console.log("✅ Login completed – inside app.");
        await context.storageState({ path: config.storageState });
        return;
    }

    // Otherwise: unexpected page
    mkdirSync("artifacts", { recursive: true });
    await page.screenshot({ path: "artifacts/inside_marker_missing.png", fullPage: true });

    throw new Error(
        `Authenticated check failed: not on recognized SSO page, and inside marker not found. Current URL=${urlNow}. Screenshot saved: artifacts/inside_marker_missing.png`
    );
}
