import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [{
  title: "Anti-Portfolio",
  url: "/",
  icon: "📊"
}, {
  title: "Portfolio Comparison",
  url: "/comparison",
  icon: "⚖️"
}, {
  title: "All Rejected",
  url: "/all-rejected",
  icon: "❌"
}, {
  title: "Integrations",
  url: "/integrations",
  icon: "🔗"
}];

const adminItems = [{
  title: "User Management",
  url: "/users",
  icon: "👥"
}];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  return <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className={`font-bold text-lg text-white ${collapsed ? "hidden" : "block"}`}>
            <span className="font-mono">phantom-growth</span>
          </h2>
          <div className={`text-xs text-white/70 mt-1 ${collapsed ? "hidden" : "block"}`}>
            Anti-Portfolio Tracker
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={`text-white ${collapsed ? "hidden" : "block"}`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="">
                      <span className="text-lg mr-3">{item.icon}</span>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className={`text-white ${collapsed ? "hidden" : "block"}`}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map(item => <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className="">
                        <span className="text-lg mr-3">{item.icon}</span>
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>;
}