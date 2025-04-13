import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center">
          <Link to="/" className="text-lg font-semibold">
            Nexus Forge
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/agents"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/agents") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Agents
            </Link>
            <Link
              to="/blocks"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/blocks") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Blocks
            </Link>
            <Link
              to="/conversations"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/conversations") ? "text-primary" : "text-muted-foreground"
              )}
            >
              Conversations
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </nav>
  );
} 