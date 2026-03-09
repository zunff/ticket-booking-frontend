"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Music,
  ShoppingCart,
  Package,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const NavItems = () => (
    <div className="space-y-1 px-3 py-2">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon === "LayoutDashboard"
          ? LayoutDashboard
          : item.icon === "Music"
          ? Music
          : item.icon === "ShoppingCart"
          ? ShoppingCart
          : Package;

        return (
          <Link key={item.href} href={item.href} onClick={onClose}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-primary/20 text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.title}
            </Button>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 border-r border-border/50 transition-transform duration-300 lg:translate-x-0",
          "lg:glass-strong bg-background lg:bg-card/50", // Use solid bg on mobile, glass on desktop
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20 glow-blue">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <span className="text-lg font-bold hidden sm:inline-block">
                管理后台
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <NavItems />
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border/50">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/50 glass-strong">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              返回前台
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm">管理后台</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-muted-foreground">管理员</p>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-underline sm:hidden"
          >
            前台
          </Link>
        </div>
      </div>
    </header>
  );
}
