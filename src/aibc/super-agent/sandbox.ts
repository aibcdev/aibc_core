/**
 * AIBC Sandbox Integration
 * Uses E2B to provide a secure execution environment.
 */

import { Sandbox } from "e2b";

/**
 * Execute Python code in an E2B sandbox
 */
export async function runPythonInSandbox(code: string): Promise<string> {
    const apiKey = process.env.E2B_API_KEY;
    if (!apiKey) {
        throw new Error("E2B_API_KEY is not set");
    }

    console.log("[Sandbox] Starting execution...");

    const sbx = await Sandbox.create({
        apiKey,
    });

    try {
        // In E2B 2.x, we use commands.run for general execution in the Sandbox class
        const result = await sbx.commands.run(`python3 -c ${JSON.stringify(code)}`);

        // Combine stdout and stderr
        const output = [
            result.stdout,
            result.stderr ? `\nERRORS:\n${result.stderr}` : ""
        ].join("").trim();

        return output || "Executed successfully with no output.";
    } catch (error: any) {
        return `Execution Error: ${error.message}`;
    } finally {
        await sbx.kill();
    }
}

/**
 * Proof of concept for filesystem interaction in sandbox
 */
export async function testSandboxFilesystem() {
    const apiKey = process.env.E2B_API_KEY;
    if (!apiKey) return;

    const sbx = await Sandbox.create({ apiKey });
    try {
        await sbx.files.write("hello.txt", "Hello from AIBC!");
        const content = await sbx.files.read("hello.txt");
        console.log("[Sandbox Test] File content:", content);
    } finally {
        await sbx.kill();
    }
}
