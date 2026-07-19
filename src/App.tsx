import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Code, 
  FileCode, 
  Folder, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Copy, 
  Plus, 
  RotateCcw, 
  Server, 
  Smartphone, 
  HelpCircle, 
  Activity, 
  FileText, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RUST_CODEBASE } from './data/rustCodebase';
import { CodeFile, TerminalLine, AgentState } from './types';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'simulator' | 'codebase' | 'setup'>('simulator');
  
  // Codebase Explorer States
  const [selectedCodeFile, setSelectedCodeFile] = useState<CodeFile>(RUST_CODEBASE[0]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Virtual Project Simulator States
  const [objectiveInput, setObjectiveInput] = useState('Create a lightweight, async web scraper in Rust');
  const [virtualFiles, setVirtualFiles] = useState<{ [path: string]: string }>({
    'agent.md': `# Euler Agent Workspace Log\n\n## Project Goal\n[Pending project initiation]\n\n## Current Architecture / Stack\n- Target Environment: Termux (Android / ARM64)\n- Language: Rust\n\n## Todo List & Progress\n- [ ] Scan directory configuration\n- [ ] Initialize Cargo scaffolding\n- [ ] Implement source files\n- [ ] Compile and verify binary\n- [ ] Execute tests & finalize`
  });
  const [selectedVirtualFile, setSelectedVirtualFile] = useState<string>('agent.md');
  
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'banner',
      text: `███████╗██╗   ██╗██╗     ███████╗██████╗ \n██╔════╝██║   ██║██║     ██╔════╝██╔══██╗\n█████╗  ██║   ██║██║     █████╗  ██████╔╝\n██╔══╝  ██║   ██║██║     ██╔══╝  ██╔══██╗\n███████╗╚██████╔╝███████╗███████╗██║  ██║\n╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝`,
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Euler AI Code Agent terminal shell ready. System: Termux (Alpine/Aarch64)\nType an objective below and click "Run Euler Agent" to begin the autonomous run.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [agentState, setAgentState] = useState<AgentState>({
    objective: '',
    projectName: '',
    projectPath: '',
    agentMd: '',
    files: {},
    isThinking: false,
    isExecutingTool: false,
    currentStep: 1,
    status: 'idle',
    history: []
  });

  const [simSpeed, setSimSpeed] = useState<number>(1500); // ms delay between steps
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [isCopiedInstaller, setIsCopiedInstaller] = useState(false);

  // Advanced Agent Controls
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.5-flash');
  const [temperature, setTemperature] = useState<number>(0.3);
  const [maxSteps, setMaxSteps] = useState<number>(15);
  const [agentPersonality, setAgentPersonality] = useState<string>('Pragmatic Hacker');
  const [customCommand, setCustomCommand] = useState<string>('');
  const [isEditingFile, setIsEditingFile] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<string>('');
  const [newFileName, setNewFileName] = useState<string>('');
  const [showCreateFile, setShowCreateFile] = useState<boolean>(false);

  // Scroll terminal to bottom on line updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  // Generate the unified installation shell script
  const getInstallerScript = () => {
    let script = `#!/bin/sh\n# Euler AI Agent Automated Setup Script\n# Run this directly in Termux or Alpine Linux\n\nset -e\n\necho "==> [Euler] Initializing development environment..."\n\n# Install Rust and core development dependencies if missing\nif command -v apk >/dev/null 2>&1; then\n  echo "==> [Euler] Detected Alpine Linux. Installing dependencies..."\n  sudo apk update && sudo apk add gcc musl-dev make rust cargo curl openssl-dev\nelif command -v pkg >/dev/null 2>&1; then\n  echo "==> [Euler] Detected Termux. Installing packages..."\n  pkg update -y && pkg install -y clang make rust cargo curl openssl\nelse\n  echo "==> [Euler] Package manager not found. Please ensure rustc/cargo are installed."\nfi\n\n# Create source workspace directories\nmkdir -p euler-agent/src\ncd euler-agent\n\necho "==> [Euler] Scaffolding Cargo workspace..."\n`;

    RUST_CODEBASE.forEach(file => {
      // Escape content for shell EOF
      script += `\ncat << 'EOF' > ${file.path}\n${file.content}\nEOF\n`;
    });

    script += `\necho "==> [Euler] Workspace compiled. Building release binary..."\ncargo build --release\n\necho ""\necho "=========================================================="\necho " Euler AI Coding Agent built successfully! "\necho "=========================================================="\necho "To start Euler, run:"\necho "  cd ~/euler-agent && cargo run"\necho ""\n`;
    return script;
  };

  const copyToClipboard = (text: string, type: 'file' | 'installer') => {
    navigator.clipboard.writeText(text);
    if (type === 'file') {
      setCopiedFile(selectedCodeFile.path);
      setTimeout(() => setCopiedFile(null), 2000);
    } else {
      setIsCopiedInstaller(true);
      setTimeout(() => setIsCopiedInstaller(false), 2000);
    }
  };

  // Run the autonomous agent simulation
  const startAgentSimulation = async () => {
    if (agentState.status === 'running' || agentState.status === 'waiting_approval') return;

    // Reset Virtual Workspace state
    const initialAgentMd = `# Euler Agent Workspace Log\n\n## Project Goal\n${objectiveInput}\n\n## Current Architecture / Stack\n- Target Environment: Termux (Android / ARM64)\n- Language: Rust\n\n## Todo List & Progress\n- [/] Scan directory configuration\n- [ ] Initialize Cargo scaffolding\n- [ ] Implement source files\n- [ ] Compile and verify binary\n- [ ] Execute tests & finalize`;

    setVirtualFiles({
      'agent.md': initialAgentMd
    });
    setSelectedVirtualFile('agent.md');

    const cleanLines: TerminalLine[] = [
      {
        id: `start-banner-${Date.now()}`,
        type: 'banner',
        text: `███████╗██╗   ██╗██╗     ███████╗██████╗ \n██╔════╝██║   ██║██║     ██╔════╝██╔══██╗\n█████╗  ██║   ██║██║     █████╗  ██████╔╝\n██╔══╝  ██║   ██║██║     ██╔══╝  ██╔══██╗\n███████╗╚██████╔╝███████╗███████╗██║  ██║\n╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: `start-sys-${Date.now()}`,
        type: 'system',
        text: `Euler Agent initialized inside standard virtual container.
------------------------------------------------------------
• Target Workspace : /home/termux/euler_sandbox
• Selected LLM     : ${selectedModel}
• Temperature      : ${temperature}
• Max Steps Limit  : ${maxSteps}
• Agent Personality: ${agentPersonality}
------------------------------------------------------------
Objective: "${objectiveInput}"
Initializing execution context...`,
        timestamp: new Date().toLocaleTimeString()
      }
    ];

    setTerminalLines(cleanLines);

    setAgentState({
      objective: objectiveInput,
      projectName: 'euler_sandbox',
      projectPath: '/home/termux/euler_sandbox',
      agentMd: initialAgentMd,
      files: { 'agent.md': initialAgentMd },
      isThinking: true,
      isExecutingTool: false,
      currentStep: 1,
      status: 'running',
      history: []
    });
  };

  // Agent execution loop step controller
  useEffect(() => {
    if (agentState.status !== 'running') return;

    const executeNextStep = async () => {
      const currentStep = agentState.currentStep;

      try {
        const response = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objective: agentState.objective,
            step: currentStep,
            history: agentState.history,
            files: virtualFiles
          })
        });

        if (!response.ok) {
          throw new Error('Simulation endpoint failed');
        }

        const data = await response.json();

        // Add thinking output to terminal
        const thinkingLine: TerminalLine = {
          id: `think-${currentStep}-${Date.now()}`,
          type: 'thinking',
          text: `[THINKING] Step ${currentStep}: ${data.thought}`,
          timestamp: new Date().toLocaleTimeString()
        };

        // Add tool invoke log to terminal
        const toolLine: TerminalLine = {
          id: `tool-${currentStep}-${Date.now()}`,
          type: 'tool',
          text: `[TOOL INVOCATION] Calling: "${data.toolName}" with parameters: ${JSON.stringify(data.toolArgs)}`,
          timestamp: new Date().toLocaleTimeString()
        };

        setTerminalLines(prev => [...prev, thinkingLine, toolLine]);

        // Wait a small delay before outputting tool results to simulate processing speed
        await new Promise(resolve => setTimeout(resolve, 800));

        // If tool name is execute_command, we trigger user approval intercept
        if (data.toolName === 'execute_command' && !data.bypassApproval) {
          setAgentState(prev => ({
            ...prev,
            status: 'waiting_approval',
            pendingCommandApproval: data.toolArgs.command,
            isThinking: false,
            isExecutingTool: true
          }));

          // Add approval requested log
          const approvalLog: TerminalLine = {
            id: `approve-req-${Date.now()}`,
            type: 'system',
            text: `\n==================================================\n[APPROVAL REQUIRED] Euler wants to execute a bash command:\n  $ ${data.toolArgs.command}\n==================================================\nPlease click APPROVE or DENY in the console widget below to proceed.\n`,
            timestamp: new Date().toLocaleTimeString()
          };
          setTerminalLines(prev => [...prev, approvalLog]);
          return;
        }

        // Apply tool changes (file writing, commands)
        applyStepResult(data);

      } catch (err) {
        console.error("Simulation step error:", err);
        setTerminalLines(prev => [...prev, {
          id: `err-${currentStep}-${Date.now()}`,
          type: 'error',
          text: `[CRITICAL ERROR] Failed to complete agent simulation tick. Transitioning back to IDLE.`,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setAgentState(prev => ({ ...prev, status: 'idle', isThinking: false }));
      }
    };

    const timer = setTimeout(executeNextStep, simSpeed);
    return () => clearTimeout(timer);
  }, [agentState.status, agentState.currentStep]);

  // Handle command approval
  const handleCommandApproval = (approved: boolean) => {
    if (agentState.status !== 'waiting_approval') return;

    const command = agentState.pendingCommandApproval || '';
    const currentStep = agentState.currentStep;

    const logLine: TerminalLine = {
      id: `approve-resp-${Date.now()}`,
      type: approved ? 'success' : 'error',
      text: approved 
        ? `[✓] User Approved command execution.\nRunning: "$ ${command}"...`
        : `[✗] User Rejected command execution. Euler constraint applied.`,
      timestamp: new Date().toLocaleTimeString()
    };

    setTerminalLines(prev => [...prev, logLine]);

    if (approved) {
      // Simulate command execution outputs
      setTimeout(() => {
        // Mock compiler logs or test pass/fail outputs
        let simulatedOutput = '';
        if (command.includes('cargo check')) {
          simulatedOutput = `   Compiling core v0.1.0\n   Compiling reqwest v0.11\n   Compiling euler_app v0.1.0\n    Finished dev [unoptimized + debuginfo] target(s) in 1.22s\nCompilation complete. Status: 0 (Clean build)`;
        } else if (command.includes('cargo run') || command.includes('cargo test')) {
          simulatedOutput = `    Finished dev [unoptimized + debuginfo] target(s) in 0.05s\n     Running \`target/debug/euler_app\`\n\n[✓] Asynchronous network requests fetched cleanly.\n[✓] Scraper parser ran successfully in 14ms.\nTest run complete: 1 passed; 0 failed.`;
        } else {
          simulatedOutput = `Execution completed successfully. (exit status: 0)`;
        }

        setTerminalLines(prev => [...prev, {
          id: `cmd-out-${Date.now()}`,
          type: 'output',
          text: simulatedOutput,
          timestamp: new Date().toLocaleTimeString()
        }]);

        // Complete the step processing
        const simulatedStepData = {
          toolName: 'execute_command',
          simulatedCommandResult: simulatedOutput,
          logUpdate: {
            todoIndex: currentStep === 4 ? 3 : 4,
            newStatus: 'completed' as const
          }
        };

        applyStepResult(simulatedStepData);

      }, 1000);
    } else {
      // Transition back with custom command error observation
      setAgentState(prev => ({
        ...prev,
        status: 'running',
        currentStep: prev.currentStep + 1,
        history: [...prev.history, `Command Rejected by user: ${command}`]
      }));
    }
  };

  const applyStepResult = (data: any) => {
    const nextStep = agentState.currentStep + 1;
    const isCompleted = data.toolName === 'complete_task' || nextStep > maxSteps;

    // Add tool output result to terminal
    const outputLine: TerminalLine = {
      id: `out-${agentState.currentStep}-${Date.now()}`,
      type: isCompleted ? 'success' : 'output',
      text: isCompleted 
        ? `\n==================================================\n[SUCCESS] Euler completed the objective autonomously!\n${data.simulatedCommandResult || 'Task completed.'}\n==================================================\n`
        : `[OBSERVATION] Tool response:\n${data.simulatedCommandResult}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setTerminalLines(prev => [...prev, outputLine]);

    // Update Virtual Files and agent.md
    let updatedFiles = { ...virtualFiles };
    let agentMd = updatedFiles['agent.md'] || '';

    if (data.fileToUpdate && data.fileContent) {
      updatedFiles[data.fileToUpdate] = data.fileContent;
      // Automatically show the newly created file in explorer
      setSelectedVirtualFile(data.fileToUpdate);
    }

    // Process agent.md markdown updates (checkboxes list)
    if (data.logUpdate) {
      const { todoIndex, newStatus, newTodo } = data.logUpdate;
      const lines = agentMd.split('\n');
      let currentTodoIndex = 0;
      
      const updatedLines = lines.map(line => {
        if (line.trim().startsWith('- [') || line.trim().startsWith('- [/]')) {
          if (currentTodoIndex === todoIndex) {
            currentTodoIndex++;
            if (newStatus === 'completed') {
              return ' - [x]' + line.substring(line.indexOf(']') + 1);
            } else if (newStatus === 'in_progress') {
              return ' - [/]' + line.substring(line.indexOf(']') + 1);
            }
          } else {
            currentTodoIndex++;
          }
        }
        return line;
      });

      if (newTodo) {
        // Inject new todo line above Constraints section
        const constraintsIndex = updatedLines.findIndex(l => l.includes('## System Constraints'));
        if (constraintsIndex !== -1) {
          updatedLines.splice(constraintsIndex - 1, 0, `- [ ] ${newTodo}`);
        }
      }

      updatedFiles['agent.md'] = updatedLines.join('\n');
    }

    setVirtualFiles(updatedFiles);

    // Update conversation history context
    const stepRecord = `Thought: ${data.thought}\nCalled Tool: ${data.toolName} with ${JSON.stringify(data.toolArgs)}\nObservation: ${data.simulatedCommandResult}`;

    setAgentState(prev => ({
      ...prev,
      status: isCompleted ? 'completed' : 'running',
      currentStep: nextStep,
      isThinking: !isCompleted,
      history: [...prev.history, stepRecord]
    }));
  };

  // Interactive Workspace Functions
  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const path = newFileName.trim();
    if (virtualFiles[path]) {
      alert("File already exists!");
      return;
    }
    setVirtualFiles(prev => ({
      ...prev,
      [path]: `// ${path}\n// Created via Interactive Workspace`
    }));
    setSelectedVirtualFile(path);
    setNewFileName('');
    setShowCreateFile(false);

    setTerminalLines(prev => [...prev, {
      id: `usr-file-create-${Date.now()}`,
      type: 'system',
      text: `[SYSTEM] User created virtual file: '${path}'`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleDeleteFile = (pathToDelete: string) => {
    if (pathToDelete === 'agent.md') {
      alert("agent.md cannot be deleted because it acts as Euler's long-term memory.");
      return;
    }
    if (confirm(`Are you sure you want to delete ${pathToDelete}?`)) {
      const updated = { ...virtualFiles };
      delete updated[pathToDelete];
      setVirtualFiles(updated);
      setSelectedVirtualFile('agent.md');

      setTerminalLines(prev => [...prev, {
        id: `usr-file-delete-${Date.now()}`,
        type: 'system',
        text: `[SYSTEM] User deleted virtual file: '${pathToDelete}'`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const handleSaveFileContent = () => {
    setVirtualFiles(prev => ({
      ...prev,
      [selectedVirtualFile]: editingContent
    }));
    setIsEditingFile(false);
    setTerminalLines(prev => [...prev, {
      id: `usr-file-save-${Date.now()}`,
      type: 'system',
      text: `[SYSTEM] Saved manual changes to: '${selectedVirtualFile}'`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const startManualEditing = () => {
    setEditingContent(virtualFiles[selectedVirtualFile] || '');
    setIsEditingFile(true);
  };

  const handleExecuteCustomCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customCommand.trim()) return;

    const cmd = customCommand.trim();
    setCustomCommand('');

    // Append the user input line
    const inputLine: TerminalLine = {
      id: `usr-cmd-in-${Date.now()}`,
      type: 'input',
      text: `euler@termux:~/workspace$ ${cmd}`,
      timestamp: new Date().toLocaleTimeString()
    };

    let responseText = '';
    const args = cmd.split(' ');
    const primaryCmd = args[0];

    if (primaryCmd === 'ls') {
      const files = Object.keys(virtualFiles).join('\n');
      responseText = files || 'Directory is empty.';
    } else if (primaryCmd === 'cat') {
      const target = args[1];
      if (!target) {
        responseText = 'cat: missing operand';
      } else if (virtualFiles[target] !== undefined) {
        responseText = virtualFiles[target];
      } else {
        responseText = `cat: ${target}: No such file or directory`;
      }
    } else if (primaryCmd === 'clear') {
      setTerminalLines([]);
      return;
    } else if (primaryCmd === 'help') {
      responseText = `Available Commands:
  ls          List files in virtual workspace
  cat <file>  Display file contents
  clear       Clear terminal screen
  cargo check Simulate compiling project dependencies
  cargo run   Simulate running the binary application
  help        Show this helper menu`;
    } else if (cmd === 'cargo check') {
      responseText = `   Compiling core v0.1.0
   Compiling reqwest v0.11
   Compiling euler_app v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 0.88s
Verification check: 0 errors, 0 warnings.`;
    } else if (cmd === 'cargo run') {
      responseText = `    Finished dev [unoptimized + debuginfo] target(s) in 0.02s
     Running \`target/debug/euler_app\`
Euler App successfully executed custom test suites. Exit code: 0`;
    } else {
      responseText = `sh: ${primaryCmd}: command not found. Type 'help' for available virtual tools.`;
    }

    const outputLine: TerminalLine = {
      id: `usr-cmd-out-${Date.now()}`,
      type: 'output',
      text: responseText,
      timestamp: new Date().toLocaleTimeString()
    };

    setTerminalLines(prev => [...prev, inputLine, outputLine]);
  };

  // Reset the simulator back to default
  const resetSimulator = () => {
    setVirtualFiles({
      'agent.md': `# Euler Agent Workspace Log\n\n## Project Goal\n[Pending project initiation]\n\n## Current Architecture / Stack\n- Target Environment: Termux (Android / ARM64)\n- Language: Rust\n\n## Todo List & Progress\n- [ ] Scan directory configuration\n- [ ] Initialize Cargo scaffolding\n- [ ] Implement source files\n- [ ] Compile and verify binary\n- [ ] Execute tests & finalize`
    });
    setSelectedVirtualFile('agent.md');
    setTerminalLines([
      {
        id: 'init-1',
        type: 'banner',
        text: `███████╗██╗   ██╗██╗     ███████╗██████╗ \n██╔════╝██║   ██║██║     ██╔════╝██╔══██╗\n█████╗  ██║   ██║██║     █████╗  ██████╔╝\n██╔══╝  ██║   ██║██║     ██╔══╝  ██╔══██╗\n███████╗╚██████╔╝███████╗███████╗██║  ██║\n╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 'init-2',
        type: 'system',
        text: 'Euler AI Code Agent terminal shell ready. System: Termux (Alpine/Aarch64)\nType an objective below and click "Run Euler Agent" to begin the autonomous run.',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setAgentState({
      objective: '',
      projectName: '',
      projectPath: '',
      agentMd: '',
      files: {},
      isThinking: false,
      isExecutingTool: false,
      currentStep: 1,
      status: 'idle',
      history: []
    });
  };

  // Automated installer trigger script file download
  const downloadInstallerScript = () => {
    const element = document.createElement("a");
    const file = new Blob([getInstallerScript()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "euler-setup.sh";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <TerminalIcon className="w-5 h-5 text-emerald-400" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 flex items-center gap-2">
              E U L E R <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 font-mono px-1.5 py-0.5 rounded">v0.1.0</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Autonomous Rust Coding Agent for Termux/Alpine</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-slate-950/80 rounded-lg border border-slate-800/80 max-w-sm">
          <button 
            id="tab-sim"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono transition-all ${activeTab === 'simulator' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-3.5 h-3.5" />
            Sandbox Simulator
          </button>
          <button 
            id="tab-code"
            onClick={() => setActiveTab('codebase')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono transition-all ${activeTab === 'codebase' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Code className="w-3.5 h-3.5" />
            Euler Source Code
          </button>
          <button 
            id="tab-setup"
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono transition-all ${activeTab === 'setup' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Installer & Setup
          </button>
        </div>
      </header>

      {/* Main Panel Frame */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        <AnimatePresence mode="wait">
          {/* TAB 1: SANDBOX TERMINAL SIMULATOR */}
          {activeTab === 'simulator' && (
            <motion.div 
              key="simulator-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col md:flex-row h-full"
            >
              {/* Virtual Sidebar Workspace */}
              <div className="w-full md:w-80 border-r border-slate-900 bg-slate-950 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Virtual Workspace</span>
                  </div>
                  <button
                    onClick={() => setShowCreateFile(!showCreateFile)}
                    className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-400 font-mono text-[10px] flex items-center gap-1"
                    title="Create custom virtual file"
                  >
                    <Plus className="w-3 h-3" />
                    New
                  </button>
                </div>

                {/* Create File Modal Inline */}
                {showCreateFile && (
                  <div className="p-3 bg-slate-900/60 border-b border-slate-900 space-y-2">
                    <p className="text-[10px] font-mono text-slate-400">Enter virtual relative path:</p>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="src/utils.rs"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                      />
                      <button
                        onClick={handleCreateFile}
                        className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-xs font-mono font-bold hover:bg-cyan-500/20"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}

                {/* Virtual Files list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {Object.keys(virtualFiles).map(path => (
                    <div
                      key={path}
                      className={`group w-full flex items-center justify-between rounded-md p-1 font-mono text-xs transition-all ${selectedVirtualFile === path ? 'bg-slate-900/80 border border-slate-800/60 text-slate-100' : 'text-slate-400 hover:bg-slate-900/30'}`}
                    >
                      <button
                        onClick={() => {
                          setSelectedVirtualFile(path);
                          setIsEditingFile(false);
                        }}
                        className="flex-1 flex items-center gap-2 px-2 py-1 text-left truncate overflow-hidden"
                      >
                        {path.endsWith('.md') ? (
                          <FileText className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                        ) : (
                          <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                        <span className="truncate">{path}</span>
                      </button>
                      
                      {path !== 'agent.md' && (
                        <button
                          onClick={() => handleDeleteFile(path)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-400 transition-opacity"
                          title="Delete file"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Virtual File Preview & Editor Panel */}
                <div className="h-72 border-t border-slate-900 flex flex-col bg-slate-950/60">
                  <div className="px-4 py-2 border-b border-slate-900 bg-slate-950 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 truncate">
                      {isEditingFile ? 'Editing' : 'Preview'}: {selectedVirtualFile}
                    </span>
                    <div className="flex gap-1.5">
                      {isEditingFile ? (
                        <>
                          <button
                            onClick={() => setIsEditingFile(false)}
                            className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveFileContent}
                            className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-mono text-cyan-400 font-bold hover:bg-cyan-500/20"
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={startManualEditing}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-mono text-slate-300 hover:text-slate-100"
                        >
                          Edit Content
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {isEditingFile ? (
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="flex-1 p-3 bg-slate-950 text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed select-text"
                    />
                  ) : (
                    <div className="flex-1 p-3 overflow-auto font-mono text-xs bg-slate-950/90 text-slate-300 select-text whitespace-pre-wrap leading-relaxed">
                      {virtualFiles[selectedVirtualFile] || ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Terminal Grid Area */}
              <div className="flex-1 flex flex-col bg-slate-950">
                {/* Control Header */}
                <div className="p-4 border-b border-slate-900 bg-slate-900/20 flex flex-col gap-4">
                  <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Define Autonomous Task Goal</label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={objectiveInput}
                          onChange={(e) => setObjectiveInput(e.target.value)}
                          disabled={agentState.status === 'running' || agentState.status === 'waiting_approval'}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-60"
                          placeholder="What do you want Euler to design, build and verify?"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
                      {agentState.status !== 'idle' ? (
                        <button
                          id="btn-reset-sim"
                          onClick={resetSimulator}
                          className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-mono transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset
                        </button>
                      ) : null}

                      <button
                        id="btn-run-agent"
                        onClick={startAgentSimulation}
                        disabled={agentState.status === 'running' || agentState.status === 'waiting_approval'}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold rounded-lg shadow-lg hover:shadow-emerald-500/5 transition-all disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-emerald-400/20" />
                        Run Euler Agent
                      </button>
                    </div>
                  </div>

                  {/* Bento Configuration Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-900/60">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">OpenRouter Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        disabled={agentState.status === 'running' || agentState.status === 'waiting_approval'}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                      >
                        <option value="google/gemini-2.5-flash">gemini-2.5-flash (free)</option>
                        <option value="google/gemini-2.5-pro">gemini-2.5-pro (free)</option>
                        <option value="deepseek/deepseek-chat">deepseek-v3 (free)</option>
                        <option value="meta-llama/llama-3.3-70b-instruct">llama-3.3-70b (free)</option>
                        <option value="qwen/qwen-2.5-72b-instruct">qwen-2.5-72b (free)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Temperature</label>
                      <select
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        disabled={agentState.status === 'running' || agentState.status === 'waiting_approval'}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                      >
                        <option value="0.1">0.1 (Strict/Precise)</option>
                        <option value="0.3">0.3 (Default Code)</option>
                        <option value="0.7">0.7 (Balanced)</option>
                        <option value="1.0">1.0 (Creative)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Max Run Steps</label>
                      <select
                        value={maxSteps}
                        onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                        disabled={agentState.status === 'running' || agentState.status === 'waiting_approval'}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                      >
                        <option value="5">5 steps max</option>
                        <option value="10">10 steps max</option>
                        <option value="15">15 steps max</option>
                        <option value="25">25 steps max</option>
                        <option value="50">50 steps max</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">Agent Personality</label>
                      <select
                        value={agentPersonality}
                        onChange={(e) => setAgentPersonality(e.target.value)}
                        disabled={agentState.status === 'running' || agentState.status === 'waiting_approval'}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                      >
                        <option value="Pragmatic Hacker">Pragmatic Hacker</option>
                        <option value="Defensive Architect">Defensive Architect</option>
                        <option value="Agile Programmer">Agile Programmer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Real terminal viewport */}
                <div className="flex-1 bg-slate-950 p-4 font-mono text-xs overflow-y-auto space-y-3 border-b border-slate-900">
                  <div className="space-y-2">
                    {terminalLines.map((line) => (
                      <div key={line.id} className="whitespace-pre-wrap select-text selection:bg-slate-800">
                        {line.type === 'banner' && (
                          <pre className="text-emerald-400 font-mono leading-tight glow-green tracking-wider">{line.text}</pre>
                        )}
                        {line.type === 'system' && (
                          <div className="text-slate-400 bg-slate-900/30 border border-slate-900/40 px-3 py-2.5 rounded-md leading-relaxed">
                            <span className="text-slate-500">[{line.timestamp}]</span> {line.text}
                          </div>
                        )}
                        {line.type === 'thinking' && (
                          <div className="text-fuchsia-400 font-medium leading-relaxed glow-magenta bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-md p-2.5">
                            <span className="text-slate-500">[{line.timestamp}]</span> {line.text}
                          </div>
                        )}
                        {line.type === 'tool' && (
                          <div className="text-yellow-400 leading-relaxed bg-yellow-500/5 border border-yellow-500/10 rounded-md p-2.5">
                            <span className="text-slate-500">[{line.timestamp}]</span> {line.text}
                          </div>
                        )}
                        {line.type === 'output' && (
                          <div className="text-slate-300 pl-4 py-1.5 border-l-2 border-slate-800 bg-slate-900/10 rounded-r-md leading-relaxed">
                            {line.text}
                          </div>
                        )}
                        {line.type === 'success' && (
                          <div className="text-emerald-400 font-bold leading-relaxed bg-emerald-500/5 border border-emerald-500/10 rounded-md p-3.5">
                            <span className="text-slate-500">[{line.timestamp}]</span> {line.text}
                          </div>
                        )}
                        {line.type === 'error' && (
                          <div className="text-rose-400 font-bold leading-relaxed bg-rose-500/5 border border-rose-500/10 rounded-md p-3.5">
                            <span className="text-slate-500">[{line.timestamp}]</span> {line.text}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>
                </div>

                {/* Simulated status ribbon or dynamic interactive widgets */}
                {agentState.status === 'waiting_approval' && (
                  <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 animate-bounce shrink-0" />
                      <div>
                        <p className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wide">Terminal Command Requires Safe Approval</p>
                        <p className="text-[11px] text-slate-400 font-mono">Execute: <span className="text-slate-200 underline font-bold">{agentState.pendingCommandApproval}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        id="btn-deny-cmd"
                        onClick={() => handleCommandApproval(false)}
                        className="px-3.5 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-rose-400 text-xs font-mono rounded-md transition-all"
                      >
                        Deny Execution [N]
                      </button>
                      <button
                        id="btn-approve-cmd"
                        onClick={() => handleCommandApproval(true)}
                        className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-md transition-all shadow-md"
                      >
                        Approve Execution [Y]
                      </button>
                    </div>
                  </div>
                )}

                {agentState.status === 'running' && (
                  <div className="bg-slate-900/40 px-4 py-3 border-t border-slate-900 flex items-center justify-between gap-4 font-mono text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Euler is processing autonomously (Step {agentState.currentStep}/{maxSteps})...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Simulator Tick speed:</span>
                      <select 
                        value={simSpeed}
                        onChange={(e) => setSimSpeed(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                      >
                        <option value={2500}>0.5x Slow</option>
                        <option value={1500}>1.0x Normal</option>
                        <option value={800}>2.0x Fast</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Manual Terminal Shell Prompt Input */}
                {(agentState.status === 'idle' || agentState.status === 'completed') && (
                  <form onSubmit={handleExecuteCustomCommand} className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center gap-2 shrink-0">
                    <span className="text-emerald-400 font-mono text-xs shrink-0 select-none">euler@termux:~/workspace$</span>
                    <input
                      type="text"
                      value={customCommand}
                      onChange={(e) => setCustomCommand(e.target.value)}
                      placeholder="Type 'help' to list available virtual command tools..."
                      className="flex-1 bg-transparent border-none text-xs font-mono text-slate-200 focus:outline-none placeholder-slate-600"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 text-slate-300 font-mono text-[11px]"
                    >
                      Execute
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: SYSTEM CODEBASE EXPLORER */}
          {activeTab === 'codebase' && (
            <motion.div 
              key="codebase-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col md:flex-row h-full"
            >
              {/* Rust file browser sidebar */}
              <div className="w-full md:w-80 border-r border-slate-900 bg-slate-950 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-900 flex items-center gap-2 shrink-0">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Rust Cargo Project</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {RUST_CODEBASE.map((file) => (
                    <button
                      key={file.path}
                      id={`codebase-file-${file.path.replace(/[\/.]/g, '_')}`}
                      onClick={() => setSelectedCodeFile(file)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md font-mono text-xs transition-all ${selectedCodeFile.path === file.path ? 'bg-slate-900 border border-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:bg-slate-900/30 hover:text-slate-200'}`}
                    >
                      <FileCode className="w-4 h-4 shrink-0 text-slate-500" />
                      <div className="text-left truncate flex-1">
                        <p className="truncate text-slate-200">{file.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{file.path}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* File description info */}
                <div className="p-4 border-t border-slate-900 bg-slate-950/40 font-mono text-[11px] text-slate-400 leading-relaxed">
                  <p className="font-bold text-slate-200 mb-1">Module Purpose:</p>
                  {selectedCodeFile.path === 'Cargo.toml' && "Declares high-performance pure Rust dependency packages like tokio and crossterm, configuring rustls-tls to prevent native OpenSSL library compiling conflicts within Termux / Alpine environments."}
                  {selectedCodeFile.path === 'src/main.rs' && "The primary entry point. Clears the terminal screen, prints the ASCII banner, displays setup menus, prompts the user, reads the external brain log, and boots up the agentic harness loop."}
                  {selectedCodeFile.path === 'src/llm.rs' && "Interfaces natively with OpenRouter API. Embeds the strictly bounded autonomous harness prompt and triggers structured JSON function calls or GPT-4o / Gemini-2.5 responses."}
                  {selectedCodeFile.path === 'src/tools.rs' && "High-performance filesystem operations (patch, read, recursive dir tree filtering out bloat) and Unix system command executors."}
                  {selectedCodeFile.path === 'src/agent.rs' && "Main execution controller. Drives the Think -> Update Log -> Execute Tool -> Observe -> Repeat loops. Integrates interactive user safety approvals for shell execution."}
                </div>
              </div>

              {/* Code viewer pane */}
              <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-900 bg-slate-900/20 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                    <span className="text-slate-500">File:</span>
                    <span className="text-emerald-400 font-bold">{selectedCodeFile.path}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-500">Language:</span>
                    <span className="text-slate-300">{selectedCodeFile.language}</span>
                  </div>

                  <button
                    id="btn-copy-code"
                    onClick={() => copyToClipboard(selectedCodeFile.content, 'file')}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-slate-100 rounded-md text-xs font-mono transition-all"
                  >
                    {copiedFile === selectedCodeFile.path ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                {/* Editor container */}
                <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs select-text selection:bg-slate-800 leading-relaxed text-slate-300 whitespace-pre">
                  <table className="border-collapse w-full">
                    <tbody>
                      {selectedCodeFile.content.split('\n').map((line, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/35">
                          <td className="w-10 text-right pr-4 text-slate-600 select-none border-r border-slate-900 text-[10px]">
                            {idx + 1}
                          </td>
                          <td className="pl-4 whitespace-pre whitespace-pre-wrap select-text">
                            {line}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SETUP & DEPLOYMENT GUIDE */}
          {activeTab === 'setup' && (
            <motion.div 
              key="setup-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto p-6 bg-slate-950/40 space-y-6 max-w-4xl mx-auto w-full"
            >
              {/* Introduction Card */}
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-slate-100">Deploy Euler to Termux on Android</h2>
                    <p className="text-xs text-slate-400 font-mono">Euler is designed from the ground up to operate within restricted, non-root Android userlands.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-slate-400 pt-2">
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                    <p className="font-bold text-cyan-400 mb-1">⚙️ Performance</p>
                    <p className="text-[11px] leading-relaxed">Built entirely in Rust. Extremely lightweight footprint (under 12MB RAM utilization) ensures no lag even on budget devices.</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                    <p className="font-bold text-cyan-400 mb-1">🛡️ Pure Rust TLS</p>
                    <p className="text-[11px] leading-relaxed">Uses rustls-tls to ensure smooth compile linking inside Termux and Alpine without failing on missing system OpenSSL libraries.</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                    <p className="font-bold text-cyan-400 mb-1">🔒 Safe Command Shield</p>
                    <p className="text-[11px] leading-relaxed">Prompts for user approval before initiating shell execution commands, giving you full control over script execution safety.</p>
                  </div>
                </div>
              </div>

              {/* Install guide */}
              <div className="space-y-4">
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-300">Quick Installation Script</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Copy this complete automated bootstrap script. Paste and execute it directly in Termux or your Alpine shell. It installs necessary compilers, scaffolds the file structures, compiles the codebase, and sets up your environment instantly.
                </p>

                <div className="relative rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">Bash Installation Command</span>
                    <button
                      id="btn-copy-installer"
                      onClick={() => copyToClipboard(getInstallerScript(), 'installer')}
                      className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-slate-850 rounded text-[10px] font-mono text-slate-300 transition-all"
                    >
                      {isCopiedInstaller ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          Copied Setup Script!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy Script
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 select-all max-h-48 whitespace-pre">
                    {getInstallerScript()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="btn-download-installer"
                    onClick={downloadInstallerScript}
                    className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 font-mono text-xs font-semibold rounded-lg transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download euler-setup.sh
                  </button>
                </div>
              </div>

              {/* Manual step-by-step */}
              <div className="space-y-4 pt-4 border-t border-slate-900">
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-300">Manual Setup Checklist</h3>
                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-bold text-slate-200">Prepare package repositories</p>
                      <p className="text-[11px] leading-relaxed mt-1">Open Termux on Android and run:</p>
                      <pre className="bg-slate-950 border border-slate-900 rounded p-2 text-[10px] text-slate-300 mt-1">pkg update && pkg install -y rust cargo make clang</pre>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-bold text-slate-200">Export OpenRouter API Key</p>
                      <p className="text-[11px] leading-relaxed mt-1">Acquire an API Key from OpenRouter.ai, then export it inside your terminal session to let Euler query coding models:</p>
                      <pre className="bg-slate-950 border border-slate-900 rounded p-2 text-[10px] text-slate-300 mt-1">export OPENROUTER_API_KEY="your_api_key_here"</pre>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-bold text-slate-200">Build and Run Euler</p>
                      <p className="text-[11px] leading-relaxed mt-1">Step into the project directory, build the optimized executable binary, and trigger the agent terminal prompt:</p>
                      <pre className="bg-slate-950 border border-slate-900 rounded p-2 text-[10px] text-slate-300 mt-1">cargo build --release && ./target/release/euler</pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Persistent global footer */}
      <footer className="border-t border-slate-900 bg-slate-900/30 px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <p className="text-[10px] font-mono text-slate-500">
          Euler AI Coding Harness &copy; {new Date().getFullYear()} - Designed with absolute minimal footprint.
        </p>
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Virtual sandbox compiled
          </span>
          <span className="text-slate-600">|</span>
          <span>Lightweight Rust client</span>
        </div>
      </footer>
    </div>
  );
}
