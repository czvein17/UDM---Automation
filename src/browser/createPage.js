export async function createPage({ browser, config }) {
    const page = await browser.newPage();
    page.setDefaultTimeout(config.timeoutMs);
    page.setDefaultNavigationTimeout(config.timeoutMs);
    return page;
}
