/**
 * AIBC Browser Integration
 * Uses Playwright to allow the agent to navigate the web.
 */

import { chromium, type Browser, type Page } from "playwright";

/**
 * Navigate to a URL and extract text content
 */
export async function browseAndExtract(url: string): Promise<string> {
    console.log(`[Browser] Navigating to ${url}...`);

    const browser: Browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page: Page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: "networkidle" });

        // Simple text extraction
        const content = await page.evaluate(() => {
            // Remove scripts and styles
            const scripts = (document as any).querySelectorAll("script, style");
            scripts.forEach((s: any) => s.remove());
            return (document as any).body.innerText;
        });

        return content.trim();
    } catch (error: any) {
        return `Browser Error: ${error.message}`;
    } finally {
        await browser.close();
    }
}

/**
 * Take a screenshot (useful for debugging "agentic" visual tasks)
 */
export async function captureScreenshot(url: string, path: string): Promise<void> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto(url);
        await page.screenshot({ path });
    } finally {
        await browser.close();
    }
}
