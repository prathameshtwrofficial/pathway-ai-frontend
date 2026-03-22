import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function DashboardHeader({ sidebarCollapsed, onToggleSidebar }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, userData, logout } = useAuth();
  const { setUserTheme } = useTheme();

  const handleLogout = async () => {
    try {
      // Reset user theme to default before logging out
      setUserTheme('light');

      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b bg-background/95 backdrop-blur relative z-20">
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle Button - Hidden on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex h-9 w-9 hover:bg-accent"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back to your career journey</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser?.photoURL || userData?.photoURL || "/placeholder-avatar.png"} alt={currentUser?.displayName || userData?.displayName || "User avatar"} />
                <AvatarFallback className="bg-gradient-primary text-white">{(currentUser?.displayName || userData?.displayName || "U")[0]}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser?.displayName || userData?.displayName || "My Account"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser?.email || userData?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}