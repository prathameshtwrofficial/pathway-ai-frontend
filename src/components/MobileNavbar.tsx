import { Home, BookOpen, User, Menu, Briefcase, BarChart2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileNavbar() {
  const location = useLocation();
  const { setOpen } = useSidebar();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background md:hidden">
      <div className="grid grid-cols-5 h-16">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center ${isActive('/dashboard') && !location.pathname.includes('/dashboard/') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/dashboard/job-portal" 
          className={`flex flex-col items-center justify-center ${isActive('/dashboard/job-portal') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Briefcase className="h-5 w-5" />
          <span className="text-xs mt-1">Jobs</span>
        </Link>
        
        <button 
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center text-muted-foreground"
        >
          <div className="flex items-center justify-center h-10 w-10 bg-primary rounded-full">
            <Menu className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xs mt-1">Menu</span>
        </button>
        
        <Link 
          to="/dashboard/resources" 
          className={`flex flex-col items-center justify-center ${isActive('/dashboard/resources') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Resources</span>
        </Link>
        
        <Link 
          to="/dashboard/profile" 
          className={`flex flex-col items-center justify-center ${isActive('/dashboard/profile') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
}