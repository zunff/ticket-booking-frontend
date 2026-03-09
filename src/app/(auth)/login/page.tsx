"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { login } from "@/lib/api/auth";

const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(6, "密码至少6位"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/concerts";

  const { login: authLogin, isAuthenticated, _isInitialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const hasInitializedRef = useRef(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Initialize auth state once on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      useAuthStore.getState().initialize();
      hasInitializedRef.current = true;
    }
  }, []);

  // Redirect if already authenticated (only after initialization)
  useEffect(() => {
    if (_isInitialized && isAuthenticated) {
      router.replace(redirect);
    }
  }, [_isInitialized, isAuthenticated, redirect, router]);

  // Show loading while initializing
  if (!_isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Already authenticated - will redirect via useEffect
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      authLogin(response.user, response.token);
      toast.success("登录成功", {
        description: `欢迎回来，${response.user.username}！`,
      });
      // Redirect after state update
      router.replace(redirect);
    } catch (error: any) {
      toast.error("登录失败", {
        description: error.message || "用户名或密码错误",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-animated">
      <Card className="w-full max-w-md glass fade-in">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/20 glow-blue">
              <Music className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-glow-blue">
            霓虹票务
          </CardTitle>
          <CardDescription className="text-base">
            登录您的账户以继续
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                {...form.register("username")}
                disabled={isLoading}
                className="bg-card/50"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码（至少6位）"
                {...form.register("password")}
                disabled={isLoading}
                className="bg-card/50"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full btn-neon bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              还没有账户？{" "}
              <Link
                href="/register"
                className="text-primary hover:underline text-glow-blue"
              >
                立即注册
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
