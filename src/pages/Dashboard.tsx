
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Brain, Loader2, MessageCircle, Plus, Trash } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_public: boolean;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        setAgents(data || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load agents");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgents();
  }, [user]);

  const handleDeleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Remove from local state
      setAgents(agents.filter(agent => agent.id !== id));
      toast.success("Agent deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete agent");
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Agents</h1>
        <Link to="/create-agent">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Agent
          </Button>
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No agents</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new agent.</p>
          <div className="mt-6">
            <Link to="/create-agent">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create New Agent
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <CardTitle>{agent.name}</CardTitle>
                <CardDescription>
                  {agent.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  Created: {new Date(agent.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center mt-2">
                  <div className={`h-2.5 w-2.5 rounded-full mr-2 ${agent.is_public ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-500">{agent.is_public ? 'Public' : 'Private'}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to={`/agents/${agent.id}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
                <Link to={`/chat/${agent.id}`}>
                  <Button className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteAgent(agent.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
