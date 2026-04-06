'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/dashboard/tasks', label: 'Tasks', icon: <ListTodo className="h-5 w-5" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

interface DashboardNavProps {
  userEmail?: string;
  onLogout?: () => void;
}

export function DashboardNav({ userEmail, onLogout }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 h-screen bg-card border-r fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b">
        <Sparkles className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">AI Business</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t">
        {userEmail && (
          <p className="text-xs text-muted-foreground mb-2 truncate px-2">{userEmail}</p>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
