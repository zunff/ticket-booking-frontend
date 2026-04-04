"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  ArrowLeft,
  Shield,
  Calendar,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/stores/authStore";
import { updateProfile, changePassword } from "@/lib/api/auth";
import { toast } from "sonner";

// Profile form schema
const profileSchema = z.object({
  nickname: z.string().max(20, "昵称最多20个字符").optional().or(z.literal("")),
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号").optional().or(z.literal("")),
});

// Password form schema
const passwordSchema = z.object({
  oldPassword: z.string().min(6, "密码至少6位"),
  newPassword: z.string().min(6, "密码至少6位"),
  confirmPassword: z.string().min(6, "密码至少6位"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: "",
      email: "",
      phone: "",
    },
  });

  // Sync form values when user data is available
  useEffect(() => {
    if (user) {
      profileForm.reset({
        nickname: user.nickname || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, profileForm]);

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      const updatedUser = await updateProfile({
        nickname: data.nickname || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
      });
      updateUser(updatedUser);
      toast.success("个人信息更新成功");
    } catch (error: any) {
      toast.error(error?.message || "更新失败");
    } finally {
      setIsUpdating(false);
    }
  };

  // Change password
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success("密码修改成功");
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error?.message || "修改失败");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">个人中心</h1>
          <p className="text-muted-foreground">管理您的账户信息</p>
        </div>
      </div>

      {/* User Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {user.nickname || user.username}
                </h2>
                {user.isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    管理员
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">@{user.username}</p>
              <p className="text-muted-foreground text-sm">{user.email || "未设置邮箱"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">基本信息</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>更新您的个人信息</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                {/* Username (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={user.username}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">用户名不可修改</p>
                </div>

                {/* Nickname */}
                <div className="space-y-2">
                  <Label htmlFor="nickname">昵称</Label>
                  <div className="relative">
                    <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nickname"
                      placeholder="请输入昵称"
                      className="pl-10"
                      {...profileForm.register("nickname")}
                    />
                  </div>
                  {profileForm.formState.errors.nickname && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.nickname.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入邮箱"
                      className="pl-10"
                      {...profileForm.register("email")}
                    />
                  </div>
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入手机号"
                      className="pl-10"
                      {...profileForm.register("phone")}
                    />
                  </div>
                  {profileForm.formState.errors.phone && (
                    <p className="text-xs text-destructive">
                      {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Account Info */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>注册时间: {user.createTime || "未知"}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isUpdating}>
                  {isUpdating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      保存中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      保存修改
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>定期修改密码可以提高账户安全性</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                {/* Old Password */}
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">当前密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="oldPassword"
                      type="password"
                      placeholder="请输入当前密码"
                      className="pl-10"
                      {...passwordForm.register("oldPassword")}
                    />
                  </div>
                  {passwordForm.formState.errors.oldPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.oldPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="请输入新密码（至少6位）"
                      className="pl-10"
                      {...passwordForm.register("newPassword")}
                    />
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="请再次输入新密码"
                      className="pl-10"
                      {...passwordForm.register("confirmPassword")}
                    />
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      修改中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      修改密码
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
