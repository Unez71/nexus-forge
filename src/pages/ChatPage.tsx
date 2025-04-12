import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { MessageDisplay } from "@/components/MessageDisplay";

type Agent = {
  id: string;
  name: string;
  description: string | null;
};

type Block = {
  id: string;
  type: string;
  config: any;
};

type Message = {
  id: string;
  content: string;
  sender_type: "user" | "agent";
  created_at: string;
};

type Conversation = {
  id: string;
  title: string;
};

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAgentAndSetupChat() {
      if (!id || !user) return;

      try {
        // Fetch agent details
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

        setAgent(agentData);

        // Fetch agent blocks
        const { data: blocksData, error: blocksError } = await supabase
          .from("blocks")
          .select("*")
          .eq("agent_id", id);

        if (blocksError) throw blocksError;
        setBlocks(blocksData || []);

        // Check for existing conversation or create a new one
        const { data: convData, error: convError } = await supabase
          .from("conversations")
          .select("*")
          .eq("agent_id", id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (convError) throw convError;

        let conversationId;
        if (convData && convData.length > 0) {
          setConversation(convData[0]);
          conversationId = convData[0].id;
        } else {
          // Create a new conversation
          const { data: newConv, error: newConvError } = await supabase
            .from("conversations")
            .insert({
              agent_id: id,
              user_id: user.id,
              title: agentData.name
            })
            .select()
            .single();

          if (newConvError) throw newConvError;
          setConversation(newConv);
          conversationId = newConv.id;
        }

        // Fetch messages for this conversation
        if (conversationId) {
          const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

          if (messagesError) throw messagesError;
          
          // Ensure we're only setting properly typed messages
          if (messagesData) {
            const typedMessages: Message[] = messagesData.map(msg => ({
              id: msg.id,
              content: msg.content,
              sender_type: msg.sender_type as "user" | "agent",
              created_at: msg.created_at
            }));
            setMessages(typedMessages);
          }
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load chat");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgentAndSetupChat();
  }, [id, user, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Set up real-time updates for messages
  useEffect(() => {
    if (!conversation) return;
  
    const channelName = `messages-${conversation.id}`;
    console.log(`Creating channel: ${channelName}`);
  
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          console.log("Real-time event received:", payload);
          
          const newMessage = payload.new as any;
          
          // Skip ALL agent messages in real-time updates
          if (newMessage.sender_type === 'agent') {
            console.log('Skipping agent message from real-time subscription');
            return;
          }
          
          // Only process user messages
          const typedMessage: Message = {
            id: newMessage.id,
            content: newMessage.content,
            sender_type: newMessage.sender_type as "user" | "agent",
            created_at: newMessage.created_at
          };
          
          console.log("Processing real-time user message:", typedMessage.id);
          
          setMessages(prevMessages => {
            const messageExists = prevMessages.some(msg => msg.id === typedMessage.id);
            if (messageExists) return prevMessages;
            return [...prevMessages, typedMessage];
          });
        }
      )
      .subscribe();
  
    console.log("Subscribed to real-time updates for conversation:", conversation.id);
  
    return () => {
      console.log("Unsubscribing from real-time updates");
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  const sendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent || input.trim();
    if (!contentToSend || !conversation || !user || isProcessing) return;

    setInput("");
    setIsProcessing(true);

    try {
      // Optimistically add user message to UI immediately
      const optimisticUserMessage: Message = {
        id: `temp-${Date.now()}`,
        content: contentToSend,
        sender_type: "user",
        created_at: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, optimisticUserMessage]);

      // Insert user message to database
      const { data: userMessage, error: userMessageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_type: "user",
          content: contentToSend
        })
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Replace optimistic message with real one
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === optimisticUserMessage.id ? 
            {
              id: userMessage.id,
              content: userMessage.content,
              sender_type: userMessage.sender_type as "user" | "agent",
              created_at: userMessage.created_at
            } : msg
        )
      );

      // Show typing indicator for agent
      const typingIndicatorId = `typing-${Date.now()}`;
      const typingMessage: Message = {
        id: typingIndicatorId,
        sender_type: "agent",
        content: "...",
        created_at: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, typingMessage]);

      // Generate agent response
      const promptBlock = blocks.find(block => block.type === "prompt");
      const googleAIBlock = blocks.find(block => block.type === "googleai");
      
      let systemPrompt = "You are a helpful AI assistant.";
      if (promptBlock && promptBlock.config.prompt) {
        systemPrompt = promptBlock.config.prompt;
      }
      
      // Construct context from previous messages
      const memoryBlock = blocks.find(block => block.type === "memory");
      const maxMessages = memoryBlock?.config?.maxMessages || 10;
      
      const recentMessages = messages
        .slice(-maxMessages)
        .map(msg => `${msg.sender_type === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n");
      
      // Call Google AI if available, otherwise use fallback text
      let response = "I'm sorry, but I cannot generate a response at the moment.";
      
      if (googleAIBlock) {
        try {
          console.log("Preparing to call generate-response function");
          console.log("System prompt length:", systemPrompt.length);
          console.log("Recent messages count:", messages.length);
          
          // Add API key from block config if available
          const apiKey = googleAIBlock.config?.apiKey;
          
          // Use the Supabase function to generate a response
          const { data, error } = await supabase.functions.invoke("generate-response", {
            body: { 
              prompt: `${systemPrompt}\n\nConversation history:\n${recentMessages}\n\nUser: ${contentToSend}\n\nAssistant:`,
              model: "gemini-2.0-flash",
              apiKey: apiKey
            }
          });
          
          if (error) {
            console.error("Error from generate-response function:", error);
            throw new Error(`API error: ${error.message || "Unknown error"}`);
          }
          
          if (data && data.text) {
            response = data.text;
            console.log("Generated response:", response.substring(0, 50) + "...");
          } else if (data && data.error) {
            console.error("API returned error:", data.error);
            throw new Error(`API error: ${data.error}`);
          } else {
            console.error("Unexpected response format:", data);
            throw new Error("No response from AI service");
          }
          
        } catch (error: any) {
          console.error("Error generating AI response:", error);
          response = `I encountered an error while processing your request: ${error.message}. Please try again later.`;
          toast.error("Failed to generate AI response: " + (error.message || "Unknown error"));
        }
      }

      // Remove typing indicator
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== typingIndicatorId));
      
      // Add agent response to UI immediately
      const immediateAgentMessage: Message = {
        id: `immediate-${Date.now()}`,
        content: response,
        sender_type: "agent",
        created_at: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, immediateAgentMessage]);
      
      // Then save to database
      try {
        const { data: agentMessage, error: agentResponseError } = await supabase
          .from("messages")
          .insert({
            conversation_id: conversation.id,
            sender_type: "agent",
            content: response
          })
          .select()
          .single();
            
        if (agentResponseError) {
          console.error("Error inserting agent response:", agentResponseError);
          toast.error("Failed to save agent response");
          
          // Even if there's an error saving to the database, show the response in the UI
          const fallbackMessage: Message = {
            id: `fallback-${Date.now()}`,
            content: response,
            sender_type: "agent",
            created_at: new Date().toISOString()
          };
          
          setMessages(prevMessages => [...prevMessages, fallbackMessage]);
        } else {
          console.log("Agent response saved with ID:", agentMessage.id);
          
          // Replace the immediate message with the database message
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === immediateAgentMessage.id
                ? {
                    id: agentMessage.id,
                    content: agentMessage.content,
                    sender_type: agentMessage.sender_type as "user" | "agent",
                    created_at: agentMessage.created_at
                  }
                : msg
            )
          );
        }
      } catch (error: any) {
        console.error("Error in agent response handling:", error);
        toast.error("Failed to save agent response");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
      console.error("Error in sendMessage:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    if (!conversation || !user || isProcessing) return;

    setIsProcessing(true);
    try {
      // Remove the message and all subsequent messages
      setMessages(prevMessages => {
        const messageIndex = prevMessages.findIndex(msg => msg.id === messageId);
        return prevMessages.slice(0, messageIndex);
      });

      // Get the last user message before the one being regenerated
      const lastUserMessage = messages.find(msg => 
        msg.sender_type === "user" && 
        new Date(msg.created_at) < new Date(messages.find(m => m.id === messageId)?.created_at || 0)
      );

      if (lastUserMessage) {
        // Resend the last user message to regenerate the response
        await sendMessage(lastUserMessage.content);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate response");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!conversation || !user || isProcessing) return;

    setIsProcessing(true);
    try {
      // Update the message in the database
      const { error } = await supabase
        .from("messages")
        .update({ content: newContent })
        .eq("id", messageId);

      if (error) throw error;

      // Update the message in the UI
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: newContent }
            : msg
        )
      );

      toast.success("Message updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update message");
    } finally {
      setIsProcessing(false);
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
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>{agent?.name || "Chat"}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Start a conversation with this agent. Ask a question or provide some information.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <MessageDisplay
                  content={message.content}
                  isUser={message.sender_type === "user"}
                  isTyping={message.content === "..."}
                 
                  onEdit={message.sender_type === "agent" ? (newContent) => handleEditMessage(message.id, newContent) : undefined}
                />
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="p-8 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
