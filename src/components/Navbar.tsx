import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-smooth">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground">AI Career Compass</span>
        </Link>

        {!isAuthPage && (
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};