"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music, Ticket, LogOut, Shield, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth, useAuthStore } from "@/stores/authStore";
import { APP_NAME } from "@/lib/constants";

export function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { _isInitialized } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const hasInitializedRef = useRef(false);

  // Prevent hydration mismatch and initialize auth
  useEffect(() => {
    setMounted(true);
    // Initialize auth state once on mount
    if (!hasInitializedRef.current) {
      useAuthStore.getState().initialize();
      hasInitializedRef.current = true;
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted || !_isInitialized) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-strong">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 transition-opacity hover:opacity-80"
        >
          <div className="p-2 rounded-lg bg-primary/20 glow-blue">
            <Music className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-glow-blue hidden sm:inline-block">
            {APP_NAME}
          </span>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {(user?.nickname || user?.username)?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block max-w-24 truncate">
                    {user?.nickname || user?.username}
                  </span>
                  {isAdmin && (
                    <Badge variant="outline" className="ml-1 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      管理员
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.nickname || user?.username}</p>
                    <p className="text-xs text-muted-foreground">
                      @{user?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      个人中心
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/concerts" className="cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          管理后台
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Ticket className="w-4 h-4 mr-2" />
                      我的订单
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild className="btn-neon">
                <Link href="/register">注册</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-strong">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
          <div className="w-24 h-6 rounded bg-muted animate-pulse hidden sm:block" />
        </div>
        <div className="w-32 h-10 rounded bg-muted animate-pulse" />
      </div>
    </header>
  );
}
