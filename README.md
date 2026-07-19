# Euler: Autonomous AI Coding Agent for Termux & Alpine Linux

Euler is an ultra-capable, minimalist autonomous AI engineering agent built from the ground up in **pure Rust** to run efficiently inside restricted environments like **Termux** on Android or standard **Alpine Linux** containers. It is tailored for low memory footprint, zero bloat, and maximum operational robustness.

---

## ⚡ One-Click Automated Setup

You can install, compile, configure, and install the `euler` CLI command with a **single command**! Open your Termux or Alpine Linux terminal and execute:

```bash
curl -fsSL https://raw.githubusercontent.com/Adir-me/adir-me-eular/main/euler-setup.sh | sh
```

---

## 🛠️ Manual Installation & Steps

If you prefer to review and run steps manually:

### 1. Install System Compilers & Toolchains
On **Termux**:
```bash
pkg update && pkg install -y rust cargo make clang curl openssl
```

On **Alpine Linux**:
```bash
sudo apk update && sudo apk add gcc musl-dev make rust cargo curl openssl-dev
```

### 2. Scaffold and Build the Binary
```bash
git clone https://github.com/Adir-me/adir-me-eular.git
cd adir-me-eular
cargo build --release
```

### 3. Setup OpenRouter API Key
Acquire an API Key from [OpenRouter.ai](https://openrouter.ai/) (Gemini 2.5 Flash is currently free to use) and export it:
```bash
export OPENROUTER_API_KEY="your_api_key_here"
```

### 4. Run the Agent
```bash
./target/release/euler
```

---

## 🤖 How It Works

Euler operates on a strict **Plan ➔ Update Log ➔ Execute Tool ➔ Observe ➔ Repeat** autonomous loop:

1. **Start or Load Projects**: Euler prompts whether you want to initialize a new coding project directory or resume an existing project.
2. **External Brain (`agent.md`)**: Tracks current goals, completed milestones, active tasks, and specific constraints. It reads and writes this log automatically to keep state across multiple sessions.
3. **Rust Multi-Tool System**:
   * `read_file` & `write_file`
   * `edit_file_patch` (highly efficient search-and-replace patches for large files)
   * `list_directory` (recursively views workspace filtering out bloat files like `target/` and `.git/`)
   * `execute_command` (runs compilers, tests, or checkers directly)
4. **User Command Guard**: Euler explicitly requests user authorization (Y/N) before executing any shell commands on your system for complete security control.

---

## 🏗️ Minimalist Codebase Architecture

The entire codebase is structured elegantly under 1,500 lines of idiomatic Rust code:
- **`src/main.rs`**: Handles user input loops, interactive boot banners, directory setups, and session configurations.
- **`src/llm.rs`**: High-performance OpenRouter client utilizing `reqwest` with pure `rustls-tls` (solving Android OpenSSL compiler link breaks).
- **`src/agent.rs`**: Core orchestrator of the autonomous decision-making loop.
- **`src/tools.rs`**: Low-level safe shell runners and efficient search-and-replace patching tools.
- **`Cargo.toml`**: Optimized crate configurations minimizing build compile times.

---
*Euler is designed to be your local, supercharged terminal software engineer running directly in your pocket.*
