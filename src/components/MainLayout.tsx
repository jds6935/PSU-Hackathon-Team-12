
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
  X,
  Users
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
    { path: "/pack", label: "Pack", icon: Users },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-wolf-dark">
      {/* Desktop sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out glass-card hidden md:relative md:block`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="mb-8 flex items-center justify-center py-4">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 text-wolf-purple"
            >
              <path d="M16 16c1-1 2-3 2-5" />
              <path d="M12 8c-1 2-1 4.5 0 6" />
              <path d="M8 16c-1-1-2-3-2-5" />
              <path d="M18 5c-.5-1.5-2-2-3.5-2" />
              <path d="M19.5 7.5C22 10 22 14 19.5 16.5" />
              <path d="M15.5 17c-1 1-2.5 1-3.5 0" />
              <path d="M8.5 17c-1-1-2.5-1-3.5 0" />
              <path d="M15.5 3C13 0.5 11 0.5 8.5 3" />
              <path d="M6 5c-.5-1.5-2-2-3.5-2" />
              <path d="M4.5 7.5C2 10 2 14 4.5 16.5" />
            </svg>
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

      {/* Mobile slide-out sidebar for small screens */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}>
          <aside 
            className="fixed inset-y-0 left-0 z-30 w-64 glass-card transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col p-4">
              <div className="mb-8 flex items-center justify-between py-4">
                <div className="flex items-center">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-wolf-purple"
                  >
                    <path d="M16 16c1-1 2-3 2-5" />
                    <path d="M12 8c-1 2-1 4.5 0 6" />
                    <path d="M8 16c-1-1-2-3-2-5" />
                    <path d="M18 5c-.5-1.5-2-2-3.5-2" />
                    <path d="M19.5 7.5C22 10 22 14 19.5 16.5" />
                    <path d="M15.5 17c-1 1-2.5 1-3.5 0" />
                    <path d="M8.5 17c-1-1-2.5-1-3.5 0" />
                    <path d="M15.5 3C13 0.5 11 0.5 8.5 3" />
                    <path d="M6 5c-.5-1.5-2-2-3.5-2" />
                    <path d="M4.5 7.5C2 10 2 14 4.5 16.5" />
                  </svg>
                  <h1 className="text-2xl font-extrabold wolf-text-gradient">WOLF PACK</h1>
                </div>
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-wolf-purple hover:bg-wolf-charcoal/50"
                >
                  <X className="h-5 w-5" />
                </Button>
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
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-wolf-dark border-t border-wolf-charcoal md:hidden z-20">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive(item.path)
                  ? "text-wolf-purple"
                  : "text-wolf-silver"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
