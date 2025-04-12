
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Agent Nexus Forge</span>
          </div>
          <div className="flex gap-4">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth?register=true">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </nav>

        {/* Hero section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Build & Connect<br />AI Agents
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Create, customize, and connect modular AI agents for any task. Design powerful workflows with drag-and-drop simplicity.
            </p>
            <div className="flex gap-4">
              <Link to="/auth?register=true">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg opacity-75 blur"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold">Research Assistant</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  I can search the web, analyze data, and provide comprehensive research reports.
                </p>
                <hr className="my-4" />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Modules: Search, Analysis, Memory</span>
                  <span className="text-sm font-medium text-primary">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Modular Design</h3>
              <p className="text-gray-600">
                Build custom AI agents using interchangeable, specialized modules.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Editor</h3>
              <p className="text-gray-600">
                Drag and drop interface for connecting nodes and defining workflows.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Full control over your data with secure authentication and storage.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-gray-500" />
              <span className="font-medium">Agent Nexus Forge</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Agent Nexus Forge. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
