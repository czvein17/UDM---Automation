import dotenv from "dotenv";
dotenv.config();

export function getConfig() {
    const cfg = {
        baseUrl: process.env.BASE_URL || "about:blank",
        headless: String(process.env.HEADLESS || "false").toLowerCase() === "true",
        timeoutMs: Number(process.env.TIMEOUT_MS || 30000),

        engine: process.env.BROWSER_ENGINE || "chromium", // chromium | firefox | webkit
        channel: process.env.BROWSER_CHANNEL || "msedge", // for chromium: msedge | chrome
        edgeExe: process.env.EDGE_EXE || "",

        storageState: process.env.STORAGE_STATE || "state/storage.json",
        username: process.env.USERNAME || ""
    };

    return cfg;
}
