"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderCard } from "@/components/order/OrderCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserOrders } from "@/lib/api/orders";
import { useAuth } from "@/stores/authStore";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderVO } from "@/types/api";
import { OrderStatus } from "@/types/enums";

export default function OrdersPage() {
  const router = useRouter();
  const { userId, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderVO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined
  );
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await getUserOrders(userId, {
        status: statusFilter,
        current: 1,
        size: 100,
      });
      setOrders(response.records || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchOrders();
  }, [userId, statusFilter, isAuthenticated, router]);

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : Number(value);
    setStatusFilter(status);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-glow-blue">我的订单</h1>
        <p className="text-muted-foreground">查看和管理您的订单</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center glass p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          <span className="text-sm">
            共 <span className="font-semibold">{total}</span> 个订单
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select
            value={statusFilter?.toString() || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-40 bg-card/50">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Ticket className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">暂无订单</h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter
              ? "没有找到符合条件的订单"
              : "您还没有任何订单"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/concerts")}
            >
              浏览演唱会
            </Button>
            {statusFilter && (
              <Button
                variant="ghost"
                onClick={() => setStatusFilter(undefined)}
              >
                清除筛选
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
