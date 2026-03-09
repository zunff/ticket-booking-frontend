"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Search, ShoppingCart, User, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllOrders } from "@/lib/api/orders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import type { OrderVO } from "@/types/api";
import { OrderStatus } from "@/types/enums";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderVO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getAllOrders({
        page: 1,
        size: 100,
        status: statusFilter,
        orderNo: searchQuery || undefined,
      });
      setOrders(response.records);
      setTotal(response.total);

      // Calculate total revenue from paid orders
      const revenue = response.records
        .filter((o) => o.status === OrderStatus.PAID)
        .reduce((sum, o) => sum + o.totalPrice, 0);
      setTotalRevenue(revenue);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchQuery]);

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : Number(value);
    setStatusFilter(status);
  };

  const stats = [
    {
      title: "总订单数",
      value: total,
      icon: ShoppingCart,
      color: "text-primary",
    },
    {
      title: "总收入",
      value: `¥${totalRevenue.toFixed(2)}`,
      icon: Ticket,
      color: "text-secondary",
    },
    {
      title: "待支付",
      value: orders.filter((o) => o.status === OrderStatus.PENDING).length,
      icon: Calendar,
      color: "text-accent",
    },
    {
      title: "已支付",
      value: orders.filter((o) => o.status === OrderStatus.PAID).length,
      icon: Ticket,
      color: "text-green-500",
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-glow-blue">订单管理</h1>
        <p className="text-muted-foreground">查看和管理所有订单</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-primary/10 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索订单号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50"
            />
          </div>
          <Select
            value={statusFilter?.toString() || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full sm:w-40 bg-card/50">
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

      {/* Orders Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>订单列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead>订单号</TableHead>
                    <TableHead>演唱会</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>票档</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>总价</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">
                        {order.orderNo}
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {order.concertName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">ID: {order.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.gradeName}</TableCell>
                      <TableCell>{order.quantity} 张</TableCell>
                      <TableCell className="font-semibold">
                        ¥{order.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ORDER_STATUS_COLORS[order.status] as any}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(order.createTime), "MM-dd HH:mm", {
                          locale: zhCN,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">暂无订单</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
