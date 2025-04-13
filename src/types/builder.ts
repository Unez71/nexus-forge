export type NodeType = 
  | 'llm-prompt'
  | 'llm-completion'
  | 'llm-chat'
  | 'llm-system-prompt'
  | 'memory-store'
  | 'memory-retrieve'
  | 'memory-vector'
  | 'memory-conversation'
  | 'tool-web-search'
  | 'tool-calculator'
  | 'tool-code-executor'
  | 'tool-data-analysis'
  | 'tool-api'
  | 'flow-input'
  | 'flow-output'
  | 'flow-condition'
  | 'flow-loop';

export interface NodeData {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface ConnectionData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface AgentData {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  connections: ConnectionData[];
  createdAt: string;
  updatedAt: string;
} 