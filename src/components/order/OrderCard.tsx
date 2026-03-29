"use client";

import { Ticket, Music, Calendar, AlertCircle, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderVO } from "@/types/api";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_BG } from "@/lib/constants";
import { cn, format, parseDateTime } from "@/lib/utils";
import { zhCN } from "date-fns/locale";

interface OrderCardProps {
  order: OrderVO;
}

/**
 * 获取订单状态图标
 */
function getStatusIcon(status: number) {
  switch (status) {
    case 0: // 处理中
      return <Loader2 className="w-4 h-4 animate-spin" />;
    case 1: // 待支付
      return <Clock className="w-4 h-4" />;
    case 2: // 已支付
      return <CheckCircle className="w-4 h-4" />;
    case 3: // 已取消
      return <XCircle className="w-4 h-4" />;
    case 4: // 失败
      return <AlertCircle className="w-4 h-4" />;
    default:
      return null;
  }
}

export function OrderCard({ order }: OrderCardProps) {
  const statusColor = ORDER_STATUS_COLORS[order.status] || "default";
  const statusLabel = ORDER_STATUS_LABELS[order.status] || "未知";
  const statusBg = ORDER_STATUS_BG[order.status] || "";
  const isFailed = order.status === 4;
  const isProcessing = order.status === 0;

  return (
    <Card className={cn(
      "glass hover:glow-sm transition-all duration-300",
      statusBg && "border",
      statusBg
    )}>
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
          <Badge variant={statusColor as any} className="glass-strong flex items-center gap-1">
            {getStatusIcon(order.status)}
            {statusLabel}
          </Badge>
        </div>

        {/* 失败原因提示 */}
        {isFailed && order.failReason && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">订单失败</p>
                <p className="text-sm text-muted-foreground mt-1">{order.failReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* 处理中提示 */}
        {isProcessing && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-muted">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">订单正在处理中，请稍候...</p>
            </div>
          </div>
        )}

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
            {format(parseDateTime(order.createTime), "yyyy-MM-dd HH:mm", {
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
