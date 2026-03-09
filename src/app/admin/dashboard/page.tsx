"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Music,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/api/admin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DashboardStats {
  totalConcerts: number;
  onSaleConcerts: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error: any) {
        toast.error("加载数据失败", {
          description: error.message || "请稍后重试",
        });
        // Set default stats on error
        setStats({
          totalConcerts: 0,
          onSaleConcerts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          todayOrders: 0,
          todayRevenue: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-glow-blue">仪表盘</h1>
          <p className="text-muted-foreground mt-1">系统数据概览</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              演唱会总数
            </CardTitle>
            <Music className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalConcerts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              在售: {stats?.onSaleConcerts || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              订单总数
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              今日新增: {stats?.todayOrders || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总收入
            </CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{((stats?.totalRevenue || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              今日: ¥{((stats?.todayRevenue || 0) / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              系统状态
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">正常</div>
            <p className="text-xs text-muted-foreground mt-1">
              所有服务运行中
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              演唱会管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              创建和管理演唱会信息，设置票档和库存
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover:border-secondary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-secondary" />
              订单管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              查看和处理用户订单，管理订单状态
            </p>
          </CardContent>
        </Card>

        <Card className="glass hover:border-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              库存管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              调整票档库存，查看库存变动记录
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
