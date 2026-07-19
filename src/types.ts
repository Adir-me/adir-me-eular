export interface CodeFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

export interface TerminalLine {
  id: string;
  text: string;
  type: 'input' | 'output' | 'thinking' | 'tool' | 'success' | 'error' | 'system' | 'banner';
  timestamp: string;
}

export interface AgentState {
  objective: string;
  projectName: string;
  projectPath: string;
  agentMd: string;
  files: { [path: string]: string };
  isThinking: boolean;
  isExecutingTool: boolean;
  currentStep: number;
  status: 'idle' | 'initializing' | 'running' | 'waiting_approval' | 'completed' | 'failed';
  pendingCommandApproval?: string;
  history: string[];
}
