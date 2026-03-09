"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { register } from "@/lib/api/auth";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "用户名至少3位")
      .max(20, "用户名最多20位")
      .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
    password: z
      .string()
      .min(6, "密码至少6位")
      .max(20, "密码最多20位"),
    confirmPassword: z.string(),
    email: z.string().email("请输入有效的邮箱地址"),
    phone: z
      .string()
      .regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated, _isInitialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const hasInitializedRef = useRef(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
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
      router.replace("/concerts");
    }
  }, [_isInitialized, isAuthenticated, router]);

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const user = await register({
        username: data.username,
        password: data.password,
        email: data.email,
        phone: data.phone,
      });

      // Auto login after registration - use a dummy token since backend doesn't return one
      // In production, backend should return a proper token
      login(user, `Bearer temp-${user.id}`);
      toast.success("注册成功", {
        description: `欢迎加入，${user.username}！`,
      });
      // Redirect after state update
      router.replace("/concerts");
    } catch (error: any) {
      toast.error("注册失败", {
        description: error.message || "用户名可能已存在",
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
            创建账户
          </CardTitle>
          <CardDescription className="text-base">
            填写信息以注册新账户
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="3-20位字母、数字或下划线"
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
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...form.register("email")}
                disabled={isLoading}
                className="bg-card/50"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="11位手机号码"
                {...form.register("phone")}
                disabled={isLoading}
                className="bg-card/50"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少6位"
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                {...form.register("confirmPassword")}
                disabled={isLoading}
                className="bg-card/50"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
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
                  注册中...
                </>
              ) : (
                "注册"
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              已有账户？{" "}
              <Link
                href="/login"
                className="text-primary hover:underline text-glow-blue"
              >
                立即登录
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
