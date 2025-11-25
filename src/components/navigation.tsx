"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dumbbell, Home, ListChecks, Plus } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/workouts", label: "Workouts", icon: ListChecks },
  { href: "/workouts/new", label: "Log Workout", icon: Plus },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-lg md:relative md:border-r md:border-t-0">
      <div className="flex items-center justify-around py-2 md:flex-col md:items-stretch md:justify-start md:gap-1 md:p-4">
        <div className="hidden md:block md:mb-8">
          <div className="flex items-center gap-2 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Lifts</span>
          </div>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href) && item.href !== "/workouts/new");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors md:flex-row md:gap-3 md:text-sm",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="md:font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

