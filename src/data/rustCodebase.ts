import { CodeFile } from '../types';

export const RUST_CODEBASE: CodeFile[] = [
  {
    path: 'Cargo.toml',
    name: 'Cargo.toml',
    language: 'toml',
    content: `[package]
name = "euler"
version = "0.1.0"
edition = "2021"
authors = ["Euler Team"]
description = "A minimalist, hyper-capable, production-grade AI Coding Agent for Termux and Alpine"

[dependencies]
tokio = { version = "1.35", features = ["full"] }
reqwest = { version = "0.11", default-features = false, features = ["rustls-tls", "json", "stream"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
futures-util = "0.3"
crossterm = "0.27"
clap = { version = "4.4", features = ["derive"] }
`
  },
  {
    path: 'src/main.rs',
    name: 'main.rs',
    language: 'rust',
    content: `use std::io::{self, Write};
use std::path::PathBuf;
use std::fs;
use crossterm::{
    execute,
    style::Stylize,
    terminal::{Clear, ClearType},
};

mod agent;
mod llm;
mod tools;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut stdout = io::stdout();
    
    // Clear screen and show ASCII Banner
    execute!(stdout, Clear(ClearType::All))?;
    print_banner();

    // Parse professional command line arguments
    let args: Vec<String> = std::env::args().collect();
    
    // Help command
    if args.iter().any(|arg| arg == "--help" || arg == "-h") {
        print_help();
        return Ok(());
    }

    // Always run in the current working directory to act as a professional developer tool
    let project_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    println!("{} Operating in current directory: {:?}", "[*]".cyan(), project_dir);

    // Establish agent.md
    let agent_md_path = project_dir.join("agent.md");
    let mut objective = String::new();

    // Extract objective, model, and api-key from arguments if available
    let mut arg_objective = None;
    let mut arg_model = None;
    let mut arg_key = None;

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "-o" | "--objective" => {
                if i + 1 < args.len() {
                    arg_objective = Some(args[i + 1].clone());
                    i += 2;
                } else {
                    i += 1;
                }
            }
            "-m" | "--model" => {
                if i + 1 < args.len() {
                    arg_model = Some(args[i + 1].clone());
                    i += 2;
                } else {
                    i += 1;
                }
            }
            "-k" | "--api-key" => {
                if i + 1 < args.len() {
                    arg_key = Some(args[i + 1].clone());
                    i += 2;
                } else {
                    i += 1;
                }
            }
            _ => {
                i += 1;
            }
        }
    }

    // Determine the OpenRouter API key
    let api_key = match arg_key {
        Some(key) => key,
        None => match std::env::var("OPENROUTER_API_KEY") {
            Ok(key) => key,
            Err(_) => {
                println!("{} OPENROUTER_API_KEY environment variable not found.", "[!]".yellow());
                let key = prompt("Please enter your OpenRouter API Key (or pass with --api-key): ")?;
                if key.trim().is_empty() {
                    println!("{} API key cannot be empty. Exiting.", "[✗]".red());
                    return Ok(());
                }
                key.trim().to_string()
            }
        }
    };

    // Determine the model
    let model = arg_model.unwrap_or_else(|| "google/gemini-2.5-flash".to_string());
    println!("{} Selected Model: {}", "[*]".cyan(), model.clone().green());

    // Resolve project objective
    if let Some(obj) = arg_objective {
        objective = obj;
    } else if agent_md_path.exists() {
        // Try reading objective from existing agent.md
        if let Ok(content) = fs::read_to_string(&agent_md_path) {
            for line in content.lines() {
                if line.starts_with("# Goal:") || line.starts_with("## Project Goal") {
                    let cleaned = line.replace("# Goal:", "").replace("## Project Goal", "").replace("\n", "").trim().to_string();
                    if !cleaned.is_empty() && cleaned != "[Goal to be defined]" {
                        objective = cleaned;
                        break;
                    }
                }
            }
        }
    }

    if objective.is_empty() {
        println!("{} No active goal found in workspace.", "[!]".yellow());
        objective = prompt("What is the objective/goal for this project? ")?;
        if objective.trim().is_empty() {
            println!("{} Objective cannot be empty.", "[✗]".red());
            return Ok(());
        }
    }

    // Ensure pristine agent.md is set up
    if !agent_md_path.exists() {
        let initial_agent_md = format!(
            "# Euler Agent Workspace Log\\n\\n\
             ## Project Goal\\n\
             {}\\n\\n\
             ## Current Architecture / Stack\\n\
             - Target: Rust (Standard Environment)\\n\\n\
             ## Todo List & Progress\\n\
             - [/] Scan directory structure\\n\
             - [ ] Formulate plan\\n\
             - [ ] Implement core code modules\\n\
             - [ ] Run compiler check and compile release\\n\\n\
             ## System Constraints & Notes\\n\
             - Bounded, high-performance execution\\n",
            objective.trim()
        );
        fs::write(&agent_md_path, initial_agent_md)?;
        println!("{} Initialized pristine agent.md log.", "[✓]".green());
    } else {
        println!("{} Loaded existing agent.md log context.", "[✓]".green());
    }

    // Run the agent execution loop
    println!("\\n{} Starting autonomous agentic loop... Press Ctrl+C to abort.", "[*]".cyan());
    agent::run_agent_loop(project_dir, api_key, objective, model).await?;

    Ok(())
}

fn print_banner() {
    println!("{}", r#"
███████╗██╗   ██╗██╗     ███████╗██████╗ 
██╔════╝██║   ██║██║     ██╔════╝██╔══██╗
█████╗  ██║   ██║██║     █████╗  ██████╔╝
██╔══╝  ██║   ██║██║     ██╔══╝  ██╔══██╗
███████╗╚██████╔╝███████╗███████╗██║  ██║
╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
    "# .cyan().bold());
    println!("{}", "            Autonomous AI Coding Engine v1.0.0".italic().white());
    println!("{}", "            Multi-Model Developer Workbench".italic().white());
    println!("\\n");
}

fn print_help() {
    println!("Euler Autonomous Code Agent - Help Menu");
    println!("Usage: euler [OPTIONS]");
    println!("\\nOptions:");
    println!("  -o, --objective <GOAL>   The goal or objective for the autonomous coding session.");
    println!("  -m, --model <MODEL>       The OpenRouter model to execute with (default: google/gemini-2.5-flash).");
    println!("  -k, --api-key <KEY>       The OpenRouter API Key (can also set OPENROUTER_API_KEY environment var).");
    println!("  -h, --help                Show this help message.");
}

fn prompt(message: &str) -> io::Result<String> {
    print!("{}", message);
    io::stdout().flush()?;
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    Ok(input.trim().to_string())
}
`
  },
  {
    path: 'src/llm.rs',
    name: 'llm.rs',
    language: 'rust',
    content: `use serde::{Deserialize, Serialize};
use serde_json::json;
use std::error::Error;

pub struct OpenRouterClient {
    api_key: String,
    model: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Deserialize, Debug)]
struct OpenRouterResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize, Debug)]
struct Choice {
    message: ResponseMessage,
}

#[derive(Deserialize, Debug)]
struct ResponseMessage {
    content: Option<String>,
}

impl OpenRouterClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            // Highly robust, free-tier model excellent at coding and reasoning
            model: "google/gemini-2.5-flash".to_string(),
        }
    }

    #[allow(dead_code)]
    pub fn with_model(api_key: String, model: String) -> Self {
        Self { api_key, model }
    }

    pub async fn get_next_action(
        &self,
        system_prompt: &str,
        conversation_history: &[ChatMessage],
    ) -> Result<String, Box<dyn Error>> {
        let client = reqwest::Client::builder()
            .use_rustls_tls() // Pure rust TLS implementation suitable for Termux
            .build()?;

        let mut messages = vec![ChatMessage {
            role: "system".to_string(),
            content: system_prompt.to_string(),
        }];
        messages.extend_from_slice(conversation_history);

        let payload = json!({
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 3072,
            "response_format": { "type": "json_object" }
        });

        let response = client
            .post("https://openrouter.ai/api/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("HTTP-Referer", "https://github.com/euler-agent/euler")
            .header("X-Title", "Euler Agent Termux Harness")
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await?;

        if !response.status().is_success() {
            let err_text = response.text().await?;
            return Err(format!("OpenRouter API error: {}", err_text).into());
        }

        let resp_body: OpenRouterResponse = response.json().await?;
        if let Some(choice) = resp_body.choices.first() {
            if let Some(content) = &choice.message.content {
                return Ok(content.clone());
            }
        }

        Err("No response text returned from OpenRouter".into())
    }
}

pub fn get_embedded_harness_prompt() -> &'static str {
    r#"You are Euler, an ultra-capable, minimalist autonomous AI engineering agent executing inside an Alpine Linux environment via Termux. Your ultimate directive is to fulfill user requests by building, testing, refining, and fixing code directly in the workspace.
You operate via a strict Agent Harness Loop: Think -> Update Log -> Execute Tool -> Observe -> Repeat.
CRITICAL OPERATIONAL MANDATES:
1. ENVIRONMENT CONSTRAINTS: You are running on an ARM64 mobile environment inside Termux. Keep builds fast. Avoid spawning massive background daemons. Use standard Alpine utilities (apk, busybox, etc.).
2. MEMORY PERSISTENCE: The file \`agent.md\` is your external long-term brain. Every time you start a major task, read it. Every time you complete a sub-step, rewrite or update \`agent.md\` using your tools to accurately reflect your progress, state changes, and future todo items. Do not ask the user before updating \`agent.md\`.
3. INCREMENTAL TESTING: Never write massive blocks of code without verifying them. Write a component, execute the compiler/test runner tool, observe the error, and fix it immediately. Do not guess if code compiles—test it.
4. MINIMALIST EDITS: Prefer \`edit_file_patch\` over \`write_file\` for large existing files to save context window tokens and avoid truncation bugs.
5. AUTONOMY: When given a task, execute as many consecutive tool calls as necessary to completely finish it. Only stop and prompt the user when the objective is entirely achieved, an unrecoverable system error occurs, or explicit user clarification/input is required.

OUTPUT FORMAT SPECIFICATION:
You must respond with a JSON object representing your next thought and action. The JSON structure is strictly:
{
  "thought": "A detailed explanation of what you are thinking, planning, or reflecting on.",
  "tool_call": {
    "name": "read_file" | "write_file" | "edit_file_patch" | "list_directory" | "execute_command" | "complete_task",
    "args": {
      // For read_file: { "path": "path/to/file" }
      // For write_file: { "path": "path/to/file", "content": "full content" }
      // For edit_file_patch: { "path": "path/to/file", "target_snippet": "exact snippet to find", "replacement_snippet": "exact code to insert" }
      // For list_directory: { "path": "path/to/dir" }
      // For execute_command: { "command": "bash command" }
      // For complete_task: { "summary": "brief summary of accomplished goal" }
    }
  }
}"#
}
`
  },
  {
    path: 'src/tools.rs',
    name: 'tools.rs',
    language: 'rust',
    content: `use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

pub fn read_file(base_dir: &Path, rel_path: &str) -> Result<String, String> {
    let safe_path = get_safe_path(base_dir, rel_path)?;
    fs::read_to_string(&safe_path).map_err(|e| format!("Failed to read file: {}", e))
}

pub fn write_file(base_dir: &Path, rel_path: &str, content: &str) -> Result<(), String> {
    let safe_path = get_safe_path(base_dir, rel_path)?;
    
    // Create parent directories if they don't exist
    if let Some(parent) = safe_path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create parent dirs: {}", e))?;
        }
    }
    
    fs::write(&safe_path, content).map_err(|e| format!("Failed to write file: {}", e))
}

pub fn edit_file_patch(
    base_dir: &Path,
    rel_path: &str,
    target_snippet: &str,
    replacement_snippet: &str,
) -> Result<(), String> {
    let safe_path = get_safe_path(base_dir, rel_path)?;
    let content = fs::read_to_string(&safe_path)
        .map_err(|e| format!("Failed to read file for patching: {}", e))?;
    
    if !content.contains(target_snippet) {
        return Err("Target snippet not found in file. Edit failed.".to_string());
    }
    
    let updated_content = content.replace(target_snippet, replacement_snippet);
    fs::write(&safe_path, updated_content)
        .map_err(|e| format!("Failed to write patched file: {}", e))
}

pub fn list_directory(base_dir: &Path, rel_path: &str) -> Result<Vec<String>, String> {
    let safe_path = get_safe_path(base_dir, rel_path)?;
    let mut files = Vec::new();
    
    visit_dirs(&safe_path, &safe_path, &mut files)?;
    Ok(files)
}

pub fn execute_command(base_dir: &Path, command: &str) -> Result<(i32, String, String), String> {
    #[cfg(target_os = "windows")]
    let (shell, arg) = ("cmd", "/C");
    #[cfg(not(target_os = "windows"))]
    let (shell, arg) = ("sh", "-c");

    let output = Command::new(shell)
        .arg(arg)
        .arg(command)
        .current_dir(base_dir)
        .output()
        .map_err(|e| format!("Failed to execute process: {}", e))?;

    let status_code = output.status.code().unwrap_or(-1);
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    Ok((status_code, stdout, stderr))
}

fn get_safe_path(base_dir: &Path, rel_path: &str) -> Result<PathBuf, String> {
    let raw_path = base_dir.join(rel_path);
    // Canonicalize path to prevent traversal vulnerabilities (.. escaping)
    // In Rust, we can clean up standard paths
    let mut clean_path = PathBuf::new();
    for component in raw_path.components() {
        match component {
            std::path::Component::ParentDir => {
                clean_path.pop();
            }
            std::path::Component::Normal(c) => {
                clean_path.push(c);
            }
            std::path::Component::RootDir | std::path::Component::Prefix(_) => {
                // Keep the base path bounded
            }
            _ => {}
        }
    }
    
    Ok(clean_path)
}

fn visit_dirs(dir: &Path, base_dir: &Path, files: &mut Vec<String>) -> Result<(), String> {
    if dir.is_dir() {
        for entry in fs::read_dir(dir).map_err(|e| format!("Failed to read dir: {}", e))? {
            let entry = entry.map_err(|e| format!("Failed reading entry: {}", e))?;
            let path = entry.path();
            
            // Exclude common build artifacts and configuration files
            let file_name = path.file_name().and_then(|f| f.to_str()).unwrap_or("");
            if file_name == ".git"
                || file_name == "node_modules"
                || file_name == "target"
                || file_name == "dist"
                || file_name == ".cargo"
            {
                continue;
            }

            if path.is_dir() {
                visit_dirs(&path, base_dir, files)?;
            } else {
                if let Ok(rel) = path.strip_prefix(base_dir) {
                    if let Some(rel_str) = rel.to_str() {
                        files.push(rel_str.to_string());
                    }
                }
            }
        }
    }
    Ok(())
}
`
  },
  {
    path: 'src/agent.rs',
    name: 'agent.rs',
    language: 'rust',
    content: `use std::io::{self, Write};
use std::path::PathBuf;
use serde::Deserialize;
use serde_json::Value;
use crossterm::style::Stylize;

use crate::llm::{OpenRouterClient, ChatMessage, get_embedded_harness_prompt};
use crate::tools;

#[derive(Deserialize, Debug)]
struct AgentResponse {
    thought: String,
    tool_call: ToolCall,
}

#[derive(Deserialize, Debug)]
struct ToolCall {
    name: String,
    args: Value,
}

pub async fn run_agent_loop(
    project_dir: PathBuf,
    api_key: String,
    objective: String,
    model: String,
) -> Result<(), Box<dyn std::error::Error>> {
    let client = OpenRouterClient::with_model(api_key, model);
    let mut history: Vec<ChatMessage> = Vec::new();
    
    // Add initial objective to history
    history.push(ChatMessage {
        role: "user".to_string(),
        content: format!(
            "Please start coding. Target workspace directory is: {:?}. Goal: {}",
            project_dir, objective
        ),
    });

    let mut step = 1;
    loop {
        println!("\\n{}", format!("[Step {}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", step).cyan().bold());
        
        // 1. Read agent.md state
        let agent_md_content = tools::read_file(&project_dir, "agent.md")
            .unwrap_or_else(|_| "No agent.md found.".to_string());

        // 2. Scan project directory
        let files_list = tools::list_directory(&project_dir, ".").unwrap_or_default();
        let files_summary = if files_list.is_empty() {
            "No files in directory yet.".to_string()
        } else {
            format!("Current files in workspace: {:?}", files_list)
        };

        // Construct current environment frame for LLM
        let system_prompt = format!(
            "{}\\n\\nCURRENT_WORKSPACE_STATE:\\n---\\n{}\\n---\\nFiles in directory:\\n{}\\n",
            get_embedded_harness_prompt(),
            agent_md_content,
            files_summary
        );

        println!("{} Querying Euler's brain (planning step)...", "[THINKING]".magenta().bold());
        let response_raw = match client.get_next_action(&system_prompt, &history).await {
            Ok(resp) => resp,
            Err(e) => {
                println!("\\n{} OpenRouter Request Failed: {}", "[ERROR]".red().bold(), e);
                println!("{} Please double-check your API Key and network connection.", "[!]".yellow());
                break;
            }
        };

        // Parse JSON output
        let parsed_response: AgentResponse = match serde_json::from_str(&response_raw) {
            Ok(parsed) => parsed,
            Err(_) => {
                println!("\\n{} Failed to parse structured JSON. Raw response from model:", "[!]".yellow().bold());
                println!("{}", response_raw);
                break;
            }
        };

        // Display thought block with beautiful styling
        println!("\\n{} {}", "Thought:".yellow().bold(), parsed_response.thought.italic().white());

        // Display executing tool
        let tool = parsed_response.tool_call;
        println!("{} Calling tool '{}' with args: {}", "[TOOL]".cyan().bold(), tool.name.clone().bold(), tool.args);

        // Process tool execution
        let observation = match tool.name.as_str() {
            "read_file" => {
                let path = tool.args["path"].as_str().unwrap_or("");
                match tools::read_file(&project_dir, path) {
                    Ok(content) => format!("File '{}' read successfully. Content:\\n---\\n{}\\n---", path, content),
                    Err(e) => format!("Error reading file: {}", e),
                }
            }
            "write_file" => {
                let path = tool.args["path"].as_str().unwrap_or("");
                let content = tool.args["content"].as_str().unwrap_or("");
                match tools::write_file(&project_dir, path, content) {
                    Ok(_) => {
                        println!("{} Successfully wrote file: {}", "[✓]".green(), path);
                        format!("File '{}' written successfully.", path)
                    }
                    Err(e) => format!("Error writing file: {}", e),
                }
            }
            "edit_file_patch" => {
                let path = tool.args["path"].as_str().unwrap_or("");
                let target = tool.args["target_snippet"].as_str().unwrap_or("");
                let replacement = tool.args["replacement_snippet"].as_str().unwrap_or("");
                match tools::edit_file_patch(&project_dir, path, target, replacement) {
                    Ok(_) => {
                        println!("{} Successfully patched file: {}", "[✓]".green(), path);
                        format!("File '{}' patched successfully.", path)
                    }
                    Err(e) => format!("Error patching file: {}", e),
                }
            }
            "list_directory" => {
                let path = tool.args["path"].as_str().unwrap_or(".");
                match tools::list_directory(&project_dir, path) {
                    Ok(list) => format!("Files in '{}': {:?}", path, list),
                    Err(e) => format!("Error listing dir: {}", e),
                }
            }
            "execute_command" => {
                let command = tool.args["command"].as_str().unwrap_or("");
                
                // Ask user before executing shell commands
                println!("\\n{}", "━".repeat(60));
                println!("{} Euler wants to run the following bash command:", "[APPROVAL REQUIRED]".red().bold());
                println!("  $ {}", command.green().bold());
                println!("{}", "━".repeat(60));
                
                print!("Approve execution? (y/N): ");
                io::stdout().flush()?;
                let mut approval = String::new();
                io::stdin().read_line(&mut approval)?;
                
                if approval.trim().to_lowercase() == "y" {
                    println!("{} Running: {} ...", "[*]".cyan(), command);
                    match tools::execute_command(&project_dir, command) {
                        Ok((status, stdout, stderr)) => {
                            if status == 0 {
                                println!("{} Command succeeded (exit code: 0)", "[✓]".green());
                            } else {
                                println!("{} Command failed (exit code: {})", "[✗]".red(), status);
                            }
                            format!(
                                "Command completed with status {}.\\nStdout:\\n{}\\nStderr:\\n{}",
                                status, stdout, stderr
                            )
                        }
                        Err(e) => format!("Command failed to start: {}", e),
                    }
                } else {
                    println!("{} Command rejected by user constraint.", "[!]".yellow());
                    "Command execution was aborted by the user constraint.".to_string()
                }
            }
            "complete_task" => {
                let summary = tool.args["summary"].as_str().unwrap_or("Objective finished");
                println!("\\n{}", "━".repeat(60));
                println!("{} Euler has successfully completed the objective!", "[SUCCESS]".green().bold());
                println!("Summary of work:\\n{}", summary.white().bold());
                println!("{}", "━".repeat(60));
                break;
            }
            _ => {
                format!("Unknown tool: {}", tool.name)
            }
        };

        // Add iteration round to conversational history
        history.push(ChatMessage {
            role: "assistant".to_string(),
            content: response_raw,
        });
        
        history.push(ChatMessage {
            role: "user".to_string(),
            content: format!("Observation from tool execution:\\n{}", observation),
        });

        step += 1;
        if step > 25 {
            println!("{} Bounded loop guard reached 25 steps. Halting for user safety.", "[!]".yellow().bold());
            break;
        }
    }

    Ok(())
}
`
  }
];
