import { useState } from "react";
import { BuilderToolbar } from "@/components/builder/BuilderToolbar";
import { BuilderSidebar } from "@/components/builder/BuilderSidebar";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { NodeType } from "@/types/builder";

export function Builder() {
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving agent...");
  };

  const handleTest = () => {
    // TODO: Implement test functionality
    console.log("Testing agent...");
  };

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log("Undoing...");
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log("Redoing...");
  };

  return (
    <div className="flex flex-col h-full">
      <BuilderToolbar
        agentName={agentName}
        agentDescription={agentDescription}
        onNameChange={setAgentName}
        onDescriptionChange={setAgentDescription}
        onSave={handleSave}
        onTest={handleTest}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <div className="flex flex-1 overflow-hidden">
        <BuilderSidebar onDragStart={handleDragStart} />
        <BuilderCanvas />
      </div>
    </div>
  );
} 