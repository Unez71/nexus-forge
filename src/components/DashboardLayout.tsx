
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Brain, MessageCircle, User } from "lucide-react";

export function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation header */}
      <header className="bg-white shadow border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-gray-900">Agent Nexus Forge</span>
              </Link>
            </div>
            
            {/* Navigation links */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link 
                to="/create-agent" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Create Agent
              </Link>
              <Link 
                to="/conversations" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                My Conversations
              </Link>
            </nav>
            
            {/* User menu */}
            <div className="flex items-center">
              <div className="ml-3 relative flex items-center gap-3">
                <div className="text-sm text-gray-700">
                  {user?.email}
                </div>
                <Button 
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className="md:hidden bg-white border-b border-gray-200 p-2 flex justify-around">
        <Link to="/dashboard" className="flex flex-col items-center p-2">
          <User className="h-5 w-5" />
          <span className="text-xs">Dashboard</span>
        </Link>
        <Link to="/create-agent" className="flex flex-col items-center p-2">
          <Brain className="h-5 w-5" />
          <span className="text-xs">Create</span>
        </Link>
        <Link to="/conversations" className="flex flex-col items-center p-2">
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs">Chat</span>
        </Link>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
