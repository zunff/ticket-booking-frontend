"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getStock } from "@/lib/api/stock";
import { BOOKING, STOCK_LEVEL_COLORS } from "@/lib/constants";
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
  const [stock, setStock] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchStock = async () => {
      try {
        const availableStock = await getStock(concertId, gradeId);
        if (mounted) {
          setStock(availableStock);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch stock:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStock();

    // Poll for stock updates every 3 seconds
    const interval = setInterval(fetchStock, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [concertId, gradeId]);

  if (isLoading) {
    return compact ? (
      <Skeleton className="h-4 w-16" />
    ) : (
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  if (stock === null) {
    return (
      <span className="text-sm text-muted-foreground">库存加载失败</span>
    );
  }

  const percentage = totalStock > 0 ? (stock / totalStock) * 100 : 0;
  const isSoldOut = stock === 0;
  const isLowStock = stock > 0 && stock <= BOOKING.LOW_STOCK_THRESHOLD;

  let levelColor = STOCK_LEVEL_COLORS.HIGH;
  if (isSoldOut) {
    levelColor = STOCK_LEVEL_COLORS.OUT;
  } else if (isLowStock) {
    levelColor = STOCK_LEVEL_COLORS.LOW;
  } else if (percentage < 50) {
    levelColor = STOCK_LEVEL_COLORS.MEDIUM;
  }

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
          variant={isSoldOut ? "secondary" : isLowStock ? "destructive" : "outline"}
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
