import { STATUS } from "./status.js";

export function initRowStatus(ctx) {
    ctx.state.status = {
        state: STATUS.PENDING,
        remarks: [],
        startedAt: null,
        endedAt: null,
        error: null,
    };
}

export function markRunning(ctx, remark) {
    ctx.state.status.state = STATUS.RUNNING;
    ctx.state.status.startedAt ??= new Date().toISOString();
    if (remark) ctx.state.status.remarks.push(remark);
}

export function markSuccess(ctx, remark) {
    ctx.state.status.state = STATUS.SUCCESS;
    ctx.state.status.endedAt = new Date().toISOString();
    if (remark) ctx.state.status.remarks.push(remark);
}

export function markFailed(ctx, error, remark) {
    ctx.state.status.state = STATUS.FAILED;
    ctx.state.status.endedAt = new Date().toISOString();
    ctx.state.status.error = error?.message || String(error);
    if (remark) ctx.state.status.remarks.push(remark);
}
