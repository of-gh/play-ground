import { NavLink } from "react-router-dom";
import { Home, Settings, FileText, Shield, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">PlayGround</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Home className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink
                to="/config"
                className={({ isActive }) => 
                  `flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Settings className="h-4 w-4" />
                Config
              </NavLink>
              <NavLink
                to="/logs"
                className={({ isActive }) => 
                  `flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <FileText className="h-4 w-4" />
                Audit Logs
              </NavLink>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="hover:bg-accent/20 rounded-lg p-1"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <User className="h-4 w-4" />
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;