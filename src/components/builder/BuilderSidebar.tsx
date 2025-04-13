import { NodeType } from "@/types/builder";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, Database, Code, Settings, FileText } from "lucide-react";

const nodeTypes: { type: NodeType; icon: React.ReactNode; label: string; description: string }[] = [
  {
    type: "llm-prompt",
    icon: <Brain className="h-5 w-5" />,
    label: "LLM Prompt",
    description: "Generate text using a language model"
  },
  {
    type: "llm-completion",
    icon: <MessageSquare className="h-5 w-5" />,
    label: "LLM Completion",
    description: "Complete text using a language model"
  },
  {
    type: "memory-store",
    icon: <Database className="h-5 w-5" />,
    label: "Memory Store",
    description: "Store and retrieve information"
  },
  {
    type: "code-execution",
    icon: <Code className="h-5 w-5" />,
    label: "Code Execution",
    description: "Execute custom code"
  },
  {
    type: "api-call",
    icon: <Settings className="h-5 w-5" />,
    label: "API Call",
    description: "Make HTTP requests"
  },
  {
    type: "text-processing",
    icon: <FileText className="h-5 w-5" />,
    label: "Text Processing",
    description: "Process and transform text"
  }
];

interface BuilderSidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

export function BuilderSidebar({ onDragStart }: BuilderSidebarProps) {
  return (
    <div className="w-64 border-r p-4">
      <h2 className="mb-4 text-lg font-semibold">Nodes</h2>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <Card
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            className="p-3 cursor-move hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="text-gray-500">{node.icon}</div>
              <div>
                <div className="font-medium">{node.label}</div>
                <div className="text-sm text-gray-500">{node.description}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 