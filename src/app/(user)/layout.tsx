"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/stores/authStore";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, _isInitialized } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (!hasInitializedRef.current) {
      useAuthStore.getState().initialize();
      hasInitializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    // Only redirect after initialization is complete
    if (_isInitialized && !isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      router.replace("/login");
    }
  }, [_isInitialized, isAuthenticated, router, isRedirecting]);

  // Show loading while waiting for initialization
  if (!_isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirecting to login
  if (isRedirecting || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
