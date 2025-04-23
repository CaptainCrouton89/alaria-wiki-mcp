#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { z } from "zod";

// Create the MCP server
const server = new McpServer({
  name: "alaria-wiki-mcp",
  version: "1.0.0",
});

// Tool: Add a new note to the wiki
server.tool(
  "Add or Update Note",
  "Add a new note to the wiki or update an existing note",
  {
    name: z.string().describe("The name of the note"),
    content: z.string().describe("The content of the note"),
  },
  async ({ name, content }) => {
    try {
      const response = await axios.post(
        "https://edit.alariawiki.online/add_new",
        new URLSearchParams({
          PN: name,
          CT: content,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status === 302) {
        return {
          content: [
            {
              type: "text",
              text: `Successfully updated note: ${name}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Successfully added note: ${name}`,
          },
        ],
      };
    } catch (error: any) {
      console.error("Error adding note:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error adding note: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Tool: Search notes in the wiki
server.tool(
  "search_notes",
  "Search for notes in the wiki",
  {
    ss: z.string().describe("The search term"),
  },
  async ({ ss }) => {
    try {
      const response = await axios.post(
        "https://edit.alariawiki.online/",
        new URLSearchParams({
          ss,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return {
        content: [
          {
            type: "text",
            text: `Search results for "${ss}": ${JSON.stringify(
              response.data
            )}`,
          },
        ],
      };
    } catch (error: any) {
      console.error("Error searching notes:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error searching notes: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Alaria Wiki MCP Server running...");
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch(console.error);
