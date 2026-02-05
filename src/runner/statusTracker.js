import { STATUS } from "./status.js";

/**
 * Defensive helpers: many callers assume `ctx` is an object with .state.
 * Guard against accidental reassignments (e.g. ctx = "Unlocked") so tracker
 * doesn't throw when automation code mis-sets ctx.
 */
function isCtxObject(ctx) {
    return ctx && typeof ctx === "object";
}

export function initRowStatus(ctx) {
    if (!isCtxObject(ctx)) {
        console.warn("statusTracker.initRowStatus: invalid ctx, skipping init");
        return;
    }
    ctx.state = ctx.state || {};
    ctx.state.status = "pending";
}

export function markRunning(ctx, remark) {
    if (!isCtxObject(ctx)) {
        console.warn("statusTracker.markRunning: invalid ctx:", remark);
        return;
    }
    ctx.state = ctx.state || {};
    ctx.state.status = remark;
    console.log("STATUS:", remark);
}

export function markSuccess(ctx, remark) {
    if (!isCtxObject(ctx)) {
        console.warn("statusTracker.markSuccess:", remark);
        return;
    }
    ctx.state = ctx.state || {};
    ctx.state.status = remark || "success";
    console.log("SUCCESS:", remark);
}

export function markFailed(ctx, error, remark) {
    if (!isCtxObject(ctx)) {
        console.warn("statusTracker.markFailed: invalid ctx. Error:", remark, error?.message || error);
        return;
    }
    ctx.state = ctx.state || {};
    ctx.state.status = "failed";
    ctx.state.error = error?.message || String(error);
    console.error("FAILED:", remark, ctx.state.error);
}
