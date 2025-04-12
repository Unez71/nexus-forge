
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, MessageCircle, Trash } from "lucide-react";

type Conversation = {
  id: string;
  title: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
  agent: {
    name: string;
  };
  messages: {
    id: string;
    content: string;
  }[];
};

const ConversationsPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("conversations")
          .select(`
            *,
            agent:agents(name),
            messages:messages(id, content)
          `)
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to load conversations");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [user]);

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setConversations(conversations.filter((conv) => conv.id !== id));
      toast.success("Conversation deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete conversation");
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Conversations</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No conversations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start a new conversation with one of your agents
          </p>
          <div className="mt-6">
            <Link to="/dashboard">
              <Button>
                View My Agents
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div>{conversation.title}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteConversation(conversation.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="text-sm text-gray-500 mb-2">
                  Agent: {conversation.agent?.name || "Unknown"}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {new Date(conversation.updated_at).toLocaleString()}
                </div>
                <div className="flex-1 min-h-[50px]">
                  <p className="text-sm line-clamp-3 text-gray-600">
                    {conversation.messages && conversation.messages.length > 0
                      ? conversation.messages[conversation.messages.length - 1]
                          ?.content || "No messages"
                      : "No messages"}
                  </p>
                </div>
                <Link
                  to={`/chat/${conversation.agent_id}?conversation=${conversation.id}`}
                  className="mt-auto"
                >
                  <Button className="w-full mt-4">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Continue Conversation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationsPage;
