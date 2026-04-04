"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar, AdminHeader } from "@/components/layout/AdminSidebar";
import { useAuth, useAuthStore } from "@/stores/authStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useAuth();
  const _isInitialized = useAuthStore((state) => state._isInitialized);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasInitializedRef = useRef(false);

  // Initialize auth state once on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      useAuthStore.getState().initialize();
      hasInitializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    // Only redirect after initialization is complete
    if (!_isInitialized) {
      return;
    }

    if (isRedirecting) {
      return;
    }

    if (!isAuthenticated) {
      setIsRedirecting(true);
      // Use setTimeout to ensure state update completes before navigation
      setTimeout(() => {
        router.replace("/login");
      }, 0);
    } else if (!isAdmin) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.replace("/concerts");
      }, 0);
    }
  }, [_isInitialized, isAuthenticated, isAdmin, router, isRedirecting]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Show loading while waiting for initialization
  if (!_isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirecting - show loading state instead of blank
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated or not admin - will redirect via useEffect
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
