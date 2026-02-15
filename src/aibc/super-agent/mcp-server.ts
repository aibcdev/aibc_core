/**
 * AIBC MCP Server
 * Exposes AIBC capabilities as standardized tools for LLMs.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { runPythonInSandbox } from "./sandbox.js";
import { browseAndExtract } from "./browser.js";

// --- Tool Schemas ---

const SearchSignalsSchema = z.object({
    query: z.string().describe("Topic or keyword to search in signals"),
    limit: z.number().optional().default(5),
});

const RunPythonCodeSchema = z.object({
    code: z.string().describe("Python code to execute in the sandbox"),
});

const BrowseUrlSchema = z.object({
    url: z.string().url().describe("The URL to browse and extract content from"),
});

// --- MCP Server Setup ---

const server = new Server(
    {
        name: "aibc-super-agent",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search_signals",
                description: "Search for marketing signals in the AIBC database",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string" },
                        limit: { type: "number" },
                    },
                    required: ["query"],
                },
            },
            {
                name: "run_python_code",
                description: "Execute Python code in a secure sandboxed environment",
                inputSchema: {
                    type: "object",
                    properties: {
                        code: { type: "string" },
                    },
                    required: ["code"],
                },
            },
            {
                name: "browse_url",
                description: "Browse a website and extract its text content",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: { type: "string" },
                    },
                    required: ["url"],
                },
            },
        ],
    };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "search_signals") {
            const { query, limit } = SearchSignalsSchema.parse(args);
            // TODO: Implement actual Supabase search
            return {
                content: [
                    {
                        type: "text",
                        text: `Searching signals for "${query}" (limit: ${limit})... [MOCK RESULTS]`,
                    },
                ],
            };
        }

        if (name === "run_python_code") {
            const { code } = RunPythonCodeSchema.parse(args);
            const result = await runPythonInSandbox(code);
            return {
                content: [
                    {
                        type: "text",
                        text: result,
                    },
                ],
            };
        }

        if (name === "browse_url") {
            const { url } = BrowseUrlSchema.parse(args);
            const result = await browseAndExtract(url);
            return {
                content: [
                    {
                        type: "text",
                        text: result,
                    },
                ],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    } catch (error: any) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`,
                },
            ],
        };
    }
});

/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("AIBC MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
