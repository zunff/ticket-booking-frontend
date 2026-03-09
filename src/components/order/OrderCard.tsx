"use client";

import { Ticket, Music, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderVO } from "@/types/api";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface OrderCardProps {
  order: OrderVO;
}

export function OrderCard({ order }: OrderCardProps) {
  const statusColor = ORDER_STATUS_COLORS[order.status] || "default";
  const statusLabel = ORDER_STATUS_LABELS[order.status] || "未知";

  return (
    <Card className="glass hover:glow-sm transition-all duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">{order.concertName}</h3>
            </div>
            <p className="text-sm text-muted-foreground">订单号: {order.orderNo}</p>
          </div>
          <Badge variant={statusColor as any} className="glass-strong">
            {statusLabel}
          </Badge>
        </div>

        <Separator className="my-4" />

        {/* Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">票档</p>
            <p className="font-medium">{order.gradeName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">数量</p>
            <p className="font-medium">{order.quantity} 张</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">单价</p>
            <p className="font-medium">
              ¥{(order.totalPrice / order.quantity).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">总价</p>
            <p className="font-semibold text-lg text-primary">
              ¥{order.totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(order.createTime), "yyyy-MM-dd HH:mm", {
              locale: zhCN,
            })}
          </div>
          {order.status === 1 && (
            <Button size="sm" variant="outline">
              去支付
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
