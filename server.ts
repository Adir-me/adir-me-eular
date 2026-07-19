import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client safely
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini API Client initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize Gemini Client:", error);
    }
  } else {
    console.log("No GEMINI_API_KEY found or default placeholder detected. Operating in high-performance simulation mode.");
  }

  // API endpoint for live Euler Agent step simulation
  app.post("/api/simulate", async (req, res) => {
    const { objective, step, history, files } = req.body;

    if (!objective) {
      return res.status(400).json({ error: "Objective is required" });
    }

    // Fallback static step-by-step generator if Gemini is not initialized
    const getFallbackStep = (stepNum: number) => {
      const fallbackSteps: { [key: number]: any } = {
        1: {
          thought: "First, let's inspect the workspace directory to see if any project skeleton exists. I'll invoke 'list_directory' to view the environment.",
          toolName: "list_directory",
          toolArgs: { path: "." },
          simulatedCommandResult: "Files found:\n- agent.md\n- Cargo.toml (does not exist yet)\n- src/main.rs (does not exist yet)",
          logUpdate: {
            todoIndex: 0,
            newStatus: "in_progress",
            newTodo: "Create file layout and skeleton in Rust"
          }
        },
        2: {
          thought: "The workspace is clean. I will construct the primary project skeleton. I will write a highly optimized Cargo.toml configuration containing necessary dependencies for this task.",
          toolName: "write_file",
          toolArgs: { path: "Cargo.toml" },
          fileToUpdate: "Cargo.toml",
          fileContent: `[package]\nname = "euler_app"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\ntokio = { version = "1", features = ["full"] }\nreqwest = { version = "0.11", default-features = false, features = ["rustls-tls", "json"] }\nserde = { version = "1", features = ["derive"] }\nserde_json = "1"`,
          simulatedCommandResult: "File written successfully: Cargo.toml (188 bytes)",
          logUpdate: {
            todoIndex: 1,
            newStatus: "in_progress",
            newTodo: "Implement core application module src/main.rs"
          }
        },
        3: {
          thought: "With Cargo.toml established, I will implement the main application module in src/main.rs containing lightweight asynchronous processing to achieve the project's goal.",
          toolName: "write_file",
          toolArgs: { path: "src/main.rs" },
          fileToUpdate: "src/main.rs",
          fileContent: `use std::error::Error;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn Error>> {\n    println!("Euler App running seamlessly inside Termux/Alpine!");\n    Ok(())\n}`,
          simulatedCommandResult: "File written successfully: src/main.rs (142 bytes)",
          logUpdate: {
            todoIndex: 1,
            newStatus: "completed",
            newTodo: "Verify and build code via cargo check"
          }
        },
        4: {
          thought: "I must run a cargo build verification to make sure the written Rust compiles cleanly in this environment. Let's run execute_command with cargo check.",
          toolName: "execute_command",
          toolArgs: { command: "cargo check" },
          simulatedCommandResult: "    Updating crates.io index\n   Compiling proc-macro2 v1.0\n   Compiling quote v1.0\n   Compiling syn v2.0\n   Compiling serde v1.0\n   Compiling euler_app v0.1.0\n    Finished dev [unoptimized + debuginfo] target(s) in 1.45s",
          logUpdate: {
            todoIndex: 2,
            newStatus: "completed"
          }
        },
        5: {
          thought: "The compilation is perfectly clean. I will execute the program using cargo run to verify user runtime output.",
          toolName: "execute_command",
          toolArgs: { command: "cargo run" },
          simulatedCommandResult: "    Finished dev [unoptimized + debuginfo] target(s) in 0.04s\n     Running `target/debug/euler_app`\nEuler App running seamlessly inside Termux/Alpine!",
          logUpdate: {
            todoIndex: 3,
            newStatus: "completed"
          }
        },
        6: {
          thought: "All components are successfully built, verified, and running natively inside our container with lightweight footprints. I will finalize and complete the task.",
          toolName: "complete_task",
          toolArgs: { summary: "Fitted workspace skeleton, designed efficient Cargo configs, implemented lightweight asynchronous main module, and successfully verified clean compilation and execution run loops." },
          logUpdate: {
            todoIndex: 4,
            newStatus: "completed"
          }
        }
      };
      return fallbackSteps[stepNum] || fallbackSteps[6];
    };

    if (!ai) {
      // Return static simulation steps
      const fallback = getFallbackStep(step);
      return res.json(fallback);
    }

    try {
      // Dynamic AI simulation of the Euler agent!
      const systemInstruction = `You are the backend logic for an Euler Agent Simulator. The Euler agent is an autonomous coding agent written in Rust running inside Termux/Alpine.
Your task is to generate the next Step of Euler's simulation run for a given user objective: "${objective}".
This is Step number: ${step}.

Current file list in the virtual workspace:
${JSON.stringify(Object.keys(files || {}), null, 2)}

Previous action history logs:
${JSON.stringify(history || [], null, 2)}

You must respond with a strictly formatted JSON object representing Euler's state transition:
{
  "thought": "Detailed description of what you as Euler are planning, reasoning, or reflecting on at this step (written in 1st person). Keep it brief, technical, and hyper-focused.",
  "toolName": "read_file" | "write_file" | "edit_file_patch" | "execute_command" | "complete_task" | "list_directory",
  "toolArgs": {
     // match the args structure of Euler's native Rust tools
  },
  "simulatedCommandResult": "Complete terminal text/logs returning the result of calling this tool in the sandbox (e.g. file content, recursive tree, bash stdout/stderr from executing a compiler or test run). Keep it realistic.",
  "fileToUpdate": "Optional relative path of a file that was created or modified in this step (e.g. 'src/main.rs', 'Cargo.toml')",
  "fileContent": "Complete contents of fileToUpdate if created/modified",
  "logUpdate": {
    "todoIndex": number, // index (0-4) of the goal list being affected
    "newStatus": "completed" | "in_progress" | "pending",
    "newTodo": "Optional string describing a new subtask added to the log"
  }
}

Guide Euler to execute the following realistic flow across multiple steps:
1. Step 1: Scan workspace (list_directory) to see what's there.
2. Step 2: Establish configuration files (Cargo.toml, dependencies).
3. Step 3: Implement core modules (e.g., src/main.rs).
4. Step 4: Run build commands (e.g. 'cargo check', 'npm run build').
5. Step 5: Execute binary or tests to confirm.
6. Step 6: Complete task with summary.

Ensure output matches the objective: "${objective}". Keep all code blocks production-grade. Only return the JSON object, absolutely no markdown wrappers.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate Step ${step} JSON for Euler AI agent simulator.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              thought: { type: Type.STRING },
              toolName: { type: Type.STRING },
              toolArgs: { type: Type.OBJECT },
              simulatedCommandResult: { type: Type.STRING },
              fileToUpdate: { type: Type.STRING },
              fileContent: { type: Type.STRING },
              logUpdate: {
                type: Type.OBJECT,
                properties: {
                  todoIndex: { type: Type.INTEGER },
                  newStatus: { type: Type.STRING },
                  newTodo: { type: Type.STRING }
                }
              }
            },
            required: ["thought", "toolName", "toolArgs", "simulatedCommandResult"]
          }
        }
      });

      const responseText = response.text || "";
      const resultJson = JSON.parse(responseText.trim());
      res.json(resultJson);
    } catch (error) {
      console.error("Gemini simulation error:", error);
      // Fallback to static simulation gracefully on any API/parsing failure
      const fallback = getFallbackStep(step);
      res.json(fallback);
    }
  });

  // Serve static assets in production, otherwise mount Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Euler Applet running successfully on port ${PORT}`);
  });
}

startServer();
