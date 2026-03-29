"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Music } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConcertVO } from "@/types/api";
import { cn, format, parseDateTime } from "@/lib/utils";
import { zhCN } from "date-fns/locale";

interface ConcertCardProps {
  concert: ConcertVO;
}

// 动态状态类型
type DynamicStatus = "upcoming" | "on-sale" | "ended";

const DYNAMIC_STATUS_LABELS: Record<DynamicStatus, string> = {
  "upcoming": "即将开售",
  "on-sale": "开售中",
  "ended": "已结束",
};

const DYNAMIC_STATUS_COLORS: Record<DynamicStatus, string> = {
  "upcoming": "default",
  "on-sale": "success",
  "ended": "secondary",
};

export function ConcertCard({ concert }: ConcertCardProps) {
  // 根据时间动态计算状态
  const getDynamicStatus = (): DynamicStatus => {
    const now = new Date();
    const startSaleTime = parseDateTime(concert.startSaleTime);
    const endSaleTime = parseDateTime(concert.endSaleTime);

    if (now < startSaleTime) {
      return "upcoming";
    } else if (now < endSaleTime) {
      return "on-sale";
    } else {
      return "ended";
    }
  };

  const dynamicStatus = getDynamicStatus();
  const statusLabel = DYNAMIC_STATUS_LABELS[dynamicStatus];
  const statusColor = DYNAMIC_STATUS_COLORS[dynamicStatus];

  // 按钮文本和状态
  const getButtonText = () => {
    switch (dynamicStatus) {
      case "upcoming":
        return "即将开售";
      case "on-sale":
        return "立即抢票";
      case "ended":
        return "已结束";
    }
  };

  const isDisabled = dynamicStatus === "ended";
  const isPrimary = dynamicStatus === "on-sale";

  return (
    <Card className="group overflow-hidden glass hover:glow-md transition-all duration-300 hover:-translate-y-1">
      {/* Poster Image Area */}
      <Link href={`/concerts/${concert.id}`}>
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="w-20 h-20 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              variant={statusColor as any}
              className="glass-strong"
            >
              {statusLabel}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        <Link href={`/concerts/${concert.id}`}>
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {concert.name}
          </h3>
        </Link>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="line-clamp-1">{concert.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <span>
              {format(parseDateTime(concert.showTime), "yyyy年MM月dd日 HH:mm", {
                locale: zhCN,
              })}
            </span>
          </div>
        </div>

        {/* 即将开售时显示开售时间 */}
        {dynamicStatus === "upcoming" && (
          <div className="text-xs text-muted-foreground">
            开售时间：{" "}
            {format(parseDateTime(concert.startSaleTime), "MM月dd日 HH:mm", {
              locale: zhCN
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/concerts/${concert.id}`} className="w-full">
          <Button
            variant={isPrimary ? "default" : "outline"}
            className={cn(
              "w-full btn-neon",
              isPrimary && "bg-primary text-primary-foreground"
            )}
            disabled={isDisabled}
          >
            {getButtonText()}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
