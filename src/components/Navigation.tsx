import { NavLink } from "react-router-dom";
import { Home, Settings, FileText, Shield } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">PlayGround</span>
        </div>
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;