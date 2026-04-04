"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStockStore } from "@/stores/stockStore";
import { BOOKING } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StockIndicatorProps {
  concertId: number;
  gradeId: number;
  totalStock: number;
  showLabel?: boolean;
  compact?: boolean;
}

export function StockIndicator({
  concertId,
  gradeId,
  totalStock,
  showLabel = true,
  compact = false,
}: StockIndicatorProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const getStock = useStockStore((state) => state.getStock);
  const subscribePolling = useStockStore((state) => state.subscribePolling);

  const stock = getStock(concertId, gradeId);

  useEffect(() => {
    // 订阅轮询，使用引用计数确保同一 concertId 只有一个轮询实例
    const cleanup = subscribePolling(concertId);
    setIsInitialized(true);

    return cleanup;
  }, [concertId, subscribePolling]);

  if (!isInitialized) {
    return compact ? (
      <Skeleton className="h-4 w-16" />
    ) : (
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  if (stock === undefined) {
    return (
      <span className="text-sm text-muted-foreground">库存加载中...</span>
    );
  }

  const percentage = totalStock > 0 ? (stock / totalStock) * 100 : 0;
  const isSoldOut = stock === 0;
  const isLowStock = stock > 0 && stock <= BOOKING.LOW_STOCK_THRESHOLD;

  // Determine badge variant based on stock level
  const getBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isSoldOut) return "outline";
    if (isLowStock) return "destructive";
    return "default";
  };

  return (
    <div className={cn("space-y-1", compact && "flex items-center gap-2")}>
      {showLabel && !compact && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">剩余库存</span>
          <span className="font-medium">{stock}</span>
        </div>
      )}

      {!compact && (
        <Progress
          value={percentage}
          className={cn(
            "h-2",
            isSoldOut && "opacity-50",
            isLowStock && !isSoldOut && "animate-pulse"
          )}
        />
      )}

      {(isSoldOut || isLowStock || compact) && (
        <Badge
          variant={getBadgeVariant()}
          className={cn(
            "text-xs",
            isLowStock && !isSoldOut && "animate-pulse"
          )}
        >
          {isSoldOut ? "已售罄" : isLowStock ? `仅剩 ${stock} 张` : `${stock} 张`}
        </Badge>
      )}

      {!isSoldOut && !isLowStock && !showLabel && !compact && (
        <span className="text-xs text-muted-foreground">
          {stock} / {totalStock}
        </span>
      )}
    </div>
  );
}
