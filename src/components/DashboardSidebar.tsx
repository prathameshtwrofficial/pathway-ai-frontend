import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Upload,
  ClipboardList,
  Target,
  TrendingUp,
  Route,
  FileText,
  MessageCircle,
  Brain
} from "lucide-react";

const menuItems = [
  { title: "Overview", url: "/dashboard", icon: Home, end: true },
  { title: "Upload Resume", url: "/dashboard/upload-resume", icon: Upload },
  { title: "Career Quiz", url: "/dashboard/career-quiz", icon: ClipboardList },
  { title: "Recommendations", url: "/dashboard/recommendations", icon: Target },
  { title: "Skill Analysis", url: "/dashboard/skill-analysis", icon: TrendingUp },
  { title: "Roadmap", url: "/dashboard/roadmap", icon: Route },
  { title: "Resume Analyzer", url: "/dashboard/resume-analyzer", icon: FileText },
  { title: "Interview Coach", url: "/dashboard/interview-coach", icon: MessageCircle },
];

export function DashboardSidebar() {
  const { open, setOpen, isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
        <SidebarContent>
        {state !== "collapsed" && (
          <div className="p-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">AI Career Compass</span>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-smooth ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`
                      }
                      >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {state !== "collapsed" && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}