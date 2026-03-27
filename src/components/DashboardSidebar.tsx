import { NavLink, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
  Layout,
  Upload,
  ClipboardList,
  Target,
  TrendingUp,
  Route,
  FileText,
  Brain,
  Briefcase,
  CheckSquare,
  BarChart2,
  BookOpen,
  Menu,
  X,
  ArrowLeft,
  User
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Layout, end: true },
  { title: "Upload Resume", url: "/dashboard/upload-resume", icon: Upload },
  { title: "Career Quiz", url: "/dashboard/career-quiz", icon: ClipboardList },
  { title: "Assessment", url: "/dashboard/assessment", icon: CheckSquare },
  { title: "Recommendations", url: "/dashboard/recommendations", icon: Target },
  { title: "Skill Analysis", url: "/dashboard/skill-analysis", icon: TrendingUp },
  { title: "Roadmap", url: "/dashboard/roadmap", icon: Route },
  { title: "Resume Analyzer", url: "/dashboard/resume-analyzer", icon: FileText },
  { title: "Job Portal", url: "/dashboard/job-portal", icon: Briefcase },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart2 },
  { title: "Resources", url: "/dashboard/resources", icon: BookOpen },
];

interface DashboardSidebarProps {
  collapsed?: boolean;
  userSettings?: {
    sidebarOrder?: string[];
  };
}

export function DashboardSidebar({ collapsed = false, userSettings }: DashboardSidebarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Reorder menu items based on user preferences
  const getOrderedMenuItems = () => {
    // Always start with default menu items to ensure Dashboard is included
    const defaultItems = [...menuItems];

    if (!userSettings?.sidebarOrder || userSettings.sidebarOrder.length === 0) {
      return defaultItems;
    }

    // Create a map of menu items by their URL identifier
    const menuMap = new Map();
    defaultItems.forEach(item => {
      // Convert URL to identifier (remove /dashboard/ prefix)
      let identifier = item.url.replace('/dashboard/', '');
      if (identifier === '') identifier = 'overview'; // special case for home
      menuMap.set(identifier, item);
    });

    // Start with user's preferred order, but filter out invalid items
    let userOrder = userSettings.sidebarOrder.filter(identifier =>
      menuMap.has(identifier)
    );

    // Ensure 'overview' (Dashboard) is always first
    const overviewIndex = userOrder.indexOf('overview');
    if (overviewIndex > 0) {
      // Remove from current position
      userOrder.splice(overviewIndex, 1);
    }
    // Always put overview at the beginning
    if (!userOrder.includes('overview')) {
      userOrder.unshift('overview');
    }

    // Add any other missing default items at the end
    const allIdentifiers = Array.from(menuMap.keys());
    allIdentifiers.forEach(identifier => {
      if (!userOrder.includes(identifier)) {
        userOrder.push(identifier);
      }
    });

    // Reorder based on final order
    const orderedItems = userOrder
      .map(identifier => menuMap.get(identifier))
      .filter(Boolean); // Remove any undefined items

    return orderedItems;
  };

  const orderedMenuItems = getOrderedMenuItems();

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean } = {}) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b bg-background">
        <div className="flex items-center justify-between w-full">
          <div className={`flex items-center space-x-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            {!collapsed && <span className="font-bold text-lg text-foreground truncate">AI Career Compass</span>}
          </div>
          {/* Close button for mobile sidebar */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden hover:bg-destructive/10 hover:text-destructive font-bold"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5 font-bold" />
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {!collapsed && (
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dashboard
            </h3>
          )}
          <nav className="space-y-1">
            {orderedMenuItems.map((item) => {
              const active = isActive(item.url, item.end);
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    collapsed ? "justify-center" : "space-x-3",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                  )} />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                  {active && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                  )}
                  {active && collapsed && (
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </ScrollArea>
    </div>
  );

  // Main navigation items for mobile bottom nav (limited to 5 for better UX)
  const mobileNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: Layout, end: true },
    { title: "Quiz", url: "/dashboard/career-quiz", icon: ClipboardList },
    { title: "Upload", url: "/dashboard/upload-resume", icon: Upload },
    { title: "Profile", url: "/dashboard/profile", icon: User },
    {
      title: "Menu",
      url: "#",
      icon: Menu,
      action: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMobileOpen(true);
      }
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-background border-r border-border transition-all duration-300 ease-in-out ${
        collapsed ? 'md:w-16' : 'md:w-64'
      }`}>
        <SidebarContent collapsed={collapsed} />
      </div>

      {/* Mobile Bottom Navigation Bar - App-like experience */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg mobile-nav">
        <div className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
          {mobileNavItems.map((item) => {
            const active = item.url !== "#" && isActive(item.url, item.end);
            const isMenuButton = item.title === "Menu";

            if (isMenuButton) {
              // Menu button doesn't need navigation
              return (
                <button
                  key={item.title}
                  onClick={item.action}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 relative",
                    "text-muted-foreground hover:text-foreground active:scale-95"
                  )}
                >
                  <item.icon className="h-5 w-5 transition-transform duration-200" />
                  <span className="text-xs font-medium truncate">{item.title}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.end}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 relative",
                  active
                    ? "text-primary transform scale-105"
                    : "text-muted-foreground hover:text-foreground active:scale-95"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "transform scale-110"
                )} />
                <span className="text-xs font-medium truncate">{item.title}</span>
                {active && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Safe area for devices with home indicators */}
        <div className="h-safe-area-inset-bottom bg-background" />
      </div>

      {/* Mobile Full Sidebar (accessed via Menu button) */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50 md:hidden shadow-xl animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}