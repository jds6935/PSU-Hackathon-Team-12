
import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Dumbbell, 
  Calendar, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = () => {
    // Here we would connect to Supabase auth signOut
    toast.info("Logged out successfully");
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/workouts", label: "Workouts", icon: Dumbbell },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-wolf-dark">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-wolf-charcoal border-wolf-purple/20 text-wolf-purple"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out glass-card md:relative 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="mb-8 flex items-center justify-center py-4">
            <h1 className="text-2xl font-extrabold wolf-text-gradient">WOLF PACK</h1>
          </div>
          
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-wolf-purple/20 text-wolf-purple"
                    : "text-wolf-silver hover:bg-wolf-charcoal hover:text-wolf-purple"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-wolf-silver hover:bg-wolf-charcoal hover:text-wolf-purple"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
