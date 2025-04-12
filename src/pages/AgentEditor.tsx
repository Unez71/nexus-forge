import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Brain, Loader2, MessageCircle, Save } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Agent = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
};

type BlockPosition = {
  x: number;
  y: number;
};

type Block = {
  id: string;
  agent_id: string;
  type: string;
  config: any;
  position: BlockPosition;
};

const blockTypes = [
  { id: "prompt", name: "System Prompt", description: "Define the agent's behavior and personality" },
  { id: "memory", name: "Memory", description: "Allow the agent to remember conversation history" },
  { id: "googleai", name: "Google AI", description: "Use Google's Generative AI model" },
];

const AgentEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
    },
  });

  useEffect(() => {
    async function fetchAgent() {
      if (!id || !user) return;

      try {
        const { data: agentData, error: agentError } = await supabase
          .from("agents")
          .select("*")
          .eq("id", id)
          .single();

        if (agentError) throw agentError;
        if (!agentData) {
          toast.error("Agent not found");
          navigate("/dashboard");
          return;
        }

        if (agentData.user_id !== user.id) {
          toast.error("You don't have permission to edit this agent");
          navigate("/dashboard");
          return;
        }

        setAgent(agentData);
        form.reset({
          name: agentData.name,
          description: agentData.description || "",
          is_public: agentData.is_public,
        });

        const { data: blocksData, error: blocksError } = await supabase
          .from("blocks")
          .select("*")
          .eq("agent_id", id);

        if (blocksError) throw blocksError;
        
        if (blocksData) {
          const formattedBlocks = blocksData.map(block => ({
            ...block,
            position: typeof block.position === 'object' ? block.position as BlockPosition : 
                     { x: 0, y: 0 }
          }));
          setBlocks(formattedBlocks);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load agent");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgent();
  }, [id, user, navigate, form]);

  const saveAgentDetails = async (formData: any) => {
    if (!id || !agent) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("agents")
        .update({
          name: formData.name,
          description: formData.description,
          is_public: formData.is_public,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Agent updated successfully");
      
      setAgent({
        ...agent,
        name: formData.name,
        description: formData.description,
        is_public: formData.is_public,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update agent");
    } finally {
      setIsSaving(false);
    }
  };

  const addBlock = async (type: string) => {
    if (!id || !agent) return;

    try {
      let config = {};
      
      if (type === "prompt") {
        config = { prompt: "You are a helpful assistant." };
      } else if (type === "memory") {
        config = { maxMessages: 10 };
      } else if (type === "googleai") {
        config = { model: "gemini-pro" };
      }

      const position: BlockPosition = { 
        x: blocks.length * 100, 
        y: blocks.length * 50 
      };

      const { data, error } = await supabase
        .from("blocks")
        .insert({
          agent_id: id,
          type,
          config,
          position,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newBlock: Block = {
        ...data,
        position: typeof data.position === 'object' ? data.position as BlockPosition : position
      };
      
      setBlocks([...blocks, newBlock]);
      toast.success(`Added ${type} block`);
    } catch (error: any) {
      toast.error(error.message || "Failed to add block");
    }
  };

  const updateBlockConfig = async (blockId: string, config: any) => {
    try {
      const { error } = await supabase
        .from("blocks")
        .update({ config })
        .eq("id", blockId);

      if (error) throw error;
      
      setBlocks(blocks.map(block => 
        block.id === blockId ? { ...block, config } : block
      ));
      toast.success("Block updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update block");
    }
  };

  const removeBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("id", blockId);

      if (error) throw error;
      
      setBlocks(blocks.filter(block => block.id !== blockId));
      toast.success("Block removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove block");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Agent</h1>
          <p className="text-gray-500">Configure your agent's settings and behavior</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={form.handleSubmit(saveAgentDetails)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/chat/${id}`)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Test Chat
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Public Agent
                      </FormLabel>
                      <FormDescription>
                        Make this agent available to other users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Agent Blocks</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button>Add Block</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Block</SheetTitle>
                <SheetDescription>
                  Choose a block type to add to your agent
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {blockTypes.map((blockType) => (
                  <Card key={blockType.id} className="cursor-pointer hover:bg-gray-50" onClick={() => addBlock(blockType.id)}>
                    <CardContent className="p-4">
                      <div className="font-medium">{blockType.name}</div>
                      <p className="text-sm text-gray-500">{blockType.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {blocks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No blocks added</h3>
            <p className="mt-1 text-sm text-gray-500">Add blocks to define your agent's behavior</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block) => (
              <BlockCard 
                key={block.id}
                block={block}
                updateConfig={(config) => updateBlockConfig(block.id, config)}
                removeBlock={() => removeBlock(block.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface BlockCardProps {
  block: Block;
  updateConfig: (config: any) => void;
  removeBlock: () => void;
}

const BlockCard = ({ block, updateConfig, removeBlock }: BlockCardProps) => {
  const [config, setConfig] = useState(block.config);
  
  const handleSave = () => {
    updateConfig(config);
  };

  const blockForm = useForm({
    defaultValues: {
      config: block.config
    }
  });
  
  const renderBlockContent = () => {
    switch (block.type) {
      case "prompt":
        return (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
              <Textarea 
                value={config.prompt} 
                onChange={(e) => setConfig({...config, prompt: e.target.value})}
                placeholder="You are a helpful assistant..."
                rows={4}
                className="w-full"
              />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        );
        
      case "memory":
        return (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Messages to Remember</label>
              <Input 
                type="number"
                value={config.maxMessages} 
                onChange={(e) => setConfig({...config, maxMessages: parseInt(e.target.value)})}
                min={1}
                className="w-full"
              />
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        );
        
      case "googleai":
        return (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                value={config.model}
                onChange={(e) => setConfig({...config, model: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-pro-vision">Gemini Pro Vision</option>
              </select>
            </div>
            <Button className="mt-4" onClick={handleSave}>Save Changes</Button>
          </div>
        );
        
      default:
        return <div>Unknown block type</div>;
    }
  };
  
  const getBlockTitle = () => {
    switch (block.type) {
      case "prompt": return "System Prompt";
      case "memory": return "Memory";
      case "googleai": return "Google AI";
      default: return block.type;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{getBlockTitle()}</CardTitle>
        <Button variant="ghost" size="sm" onClick={removeBlock}>Remove</Button>
      </CardHeader>
      <CardContent>
        {renderBlockContent()}
      </CardContent>
    </Card>
  );
};

export default AgentEditor;
