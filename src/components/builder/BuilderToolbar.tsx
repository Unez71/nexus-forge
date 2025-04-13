import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Play, Undo, Redo } from "lucide-react";

interface BuilderToolbarProps {
  agentName: string;
  agentDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  onTest: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function BuilderToolbar({
  agentName,
  agentDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  onTest,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: BuilderToolbarProps) {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Input
            value={agentName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Agent Name"
            className="text-lg font-semibold"
          />
          <Textarea
            value={agentDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Agent Description"
            className="text-sm"
          />
        </div>
        <div className="ml-4 flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={onSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
} 