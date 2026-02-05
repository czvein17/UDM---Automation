export function createCtx({ browser, context, page, config }) {
    return {
        browser,
        context,
        page,
        config,
        state: {},
    };
}
