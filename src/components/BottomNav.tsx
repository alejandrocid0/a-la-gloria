import { Home, Play, Trophy, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/jugar", icon: Play, label: "Jugar" },
    { to: "/ranking", icon: Trophy, label: "Ranking" },
    { to: "/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary border-t border-accent z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-accent"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
