"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Music,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getConcertDetail } from "@/lib/api/concerts";
import { bookTicket } from "@/lib/api/orders";
import { useStockStore } from "@/stores/stockStore";
import { StockIndicator } from "@/components/concert/StockIndicator";
import { CONCERT_STATUS_LABELS, CONCERT_STATUS_COLORS } from "@/lib/constants";
import type { ConcertDetailVO } from "@/types/api";
import { cn, format, parseDateTime } from "@/lib/utils";
import { zhCN } from "date-fns/locale";

export default function ConcertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const concertId = Number(params.id);
  const [concert, setConcert] = useState<ConcertDetailVO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  // Stock store
  const { getStock } = useStockStore();

  useEffect(() => {
    const fetchConcertDetail = async () => {
      if (!concertId || isNaN(concertId)) {
        router.push("/concerts");
        return;
      }

      setIsLoading(true);
      try {
        const data = await getConcertDetail(concertId);
        setConcert(data);
      } catch (error: any) {
        toast.error("加载失败", {
          description: error.message || "演唱会信息加载失败",
        });
        router.push("/concerts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConcertDetail();
  }, [concertId, router]);

  const handleBookClick = (gradeId: number) => {
    const stock = getStock(concertId, gradeId);
    if (stock === 0) {
      toast.error("该票档已售罄", {
        description: "请选择其他票档或稍后再试",
      });
      return;
    }

    setSelectedGrade(gradeId);
    setQuantity(1);
    setShowBookingDialog(true);
  };

  const handleBookingSubmit = async () => {
    if (!concert || !selectedGrade) return;

    setIsBooking(true);
    try {
      const orderNo = await bookTicket({
        concertId: concert.id,
        gradeId: selectedGrade,
        quantity,
      });

      toast.success("抢票成功！", {
        description: `订单号：${orderNo}`,
      });

      setShowBookingDialog(false);

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        router.push("/orders");
      }, 2000);
    } catch (error: any) {
      toast.error("抢票失败", {
        description: error.message || "库存不足或系统繁忙，请稍后再试",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">演唱会不存在</h2>
        <Button onClick={() => router.push("/concerts")}>返回列表</Button>
      </div>
    );
  }

  // 根据时间动态计算状态（与列表页一致）
  // 后端 status: 0-已关闭, 1-正常
  // 前端动态状态: 根据售票时间判断
  const now = new Date();
  const startSaleTime = parseDateTime(concert.startSaleTime);
  const endSaleTime = parseDateTime(concert.endSaleTime);

  // 如果后端状态是已关闭，直接显示已关闭
  const isClosed = concert.status === 0;
  // 根据时间判断动态状态
  const isUpcoming = !isClosed && now < startSaleTime;
  const isOnSale = !isClosed && now >= startSaleTime && now < endSaleTime;
  const isEnded = isClosed || now >= endSaleTime;

  // 动态状态标签
  const dynamicStatus = isClosed ? "closed" : isUpcoming ? "upcoming" : isOnSale ? "on-sale" : "ended";
  const DYNAMIC_STATUS_LABELS: Record<string, string> = {
    "closed": "已关闭",
    "upcoming": "即将开售",
    "on-sale": "开售中",
    "ended": "已结束",
  };
  const DYNAMIC_STATUS_COLORS: Record<string, "secondary" | "default" | "success"> = {
    "closed": "secondary",
    "upcoming": "default",
    "on-sale": "success",
    "ended": "secondary",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回列表
      </Button>

      {/* Hero Section */}
      <Card className="glass-strong overflow-hidden">
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="w-32 h-32 text-primary/20" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-glow-blue">
                    {concert.name}
                  </h1>
                  <Badge
                    variant={DYNAMIC_STATUS_COLORS[dynamicStatus] as any}
                    className="glass-strong"
                  >
                    {DYNAMIC_STATUS_LABELS[dynamicStatus]}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm sm:text-base text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{concert.venue}</span>
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
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Details Section */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="sm:col-span-2 glass">
          <CardHeader>
            <CardTitle>票档信息</CardTitle>
          </CardHeader>
          <CardContent>
            {!concert.ticketGrades || concert.ticketGrades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                暂无票档信息
              </p>
            ) : (
              <div className="space-y-4">
                {concert.ticketGrades?.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{grade.gradeName}</h3>
                        <Badge variant="outline">¥{grade.price}</Badge>
                        {grade.isSelectedSeat === 1 && (
                          <Badge variant="secondary" className="text-xs">
                            选座
                          </Badge>
                        )}
                      </div>
                      <StockIndicator
                        concertId={concert.id}
                        gradeId={grade.id}
                        totalStock={grade.totalStock}
                        compact
                      />
                    </div>
                    <Button
                      onClick={() => handleBookClick(grade.id)}
                      disabled={!isOnSale || grade.availableStock === 0}
                      className={cn(
                        "btn-neon w-full sm:w-auto",
                        isOnSale && grade.availableStock > 0 && "bg-primary text-primary-foreground"
                      )}
                    >
                      {isClosed
                        ? "已关闭"
                        : isEnded
                        ? "已结束"
                        : isUpcoming
                        ? "即将开售"
                        : grade.availableStock === 0
                        ? "已售罄"
                        : "立即抢票"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">售票时间</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">开始</p>
                  <p className="font-medium">
                    {format(parseDateTime(concert.startSaleTime), "MM月dd日 HH:mm", {
                      locale: zhCN,
                    })}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-secondary mt-0.5" />
                <div>
                  <p className="text-muted-foreground">结束</p>
                  <p className="font-medium">
                    {format(parseDateTime(concert.endSaleTime), "MM月dd日 HH:mm", {
                      locale: zhCN,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">购买须知</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• 每人限购{concert.purchaseLimit || 5}张门票</p>
              <p>• 选座票档需要在线选座</p>
              <p>• 抢票成功后请在规定时间内完成支付</p>
              <p>• 演唱会开始前48小时停止售票</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认订单</DialogTitle>
            <DialogDescription>
              请选择您要购买的数量
            </DialogDescription>
          </DialogHeader>

          {concert && selectedGrade && (
            <div className="space-y-6">
              {/* Selected Grade Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">演唱会</span>
                  <span className="font-medium">{concert.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">票档</span>
                  <span className="font-medium">
                    {concert.ticketGrades?.find((g) => g.id === selectedGrade)
                      ?.gradeName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">单价</span>
                  <span className="font-medium">
                    ¥
                    {concert.ticketGrades?.find((g) => g.id === selectedGrade)
                      ?.price || 0}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium">购买数量</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-16 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const maxStock =
                        concert.ticketGrades?.find((g) => g.id === selectedGrade)
                          ?.availableStock || 0;
                      const purchaseLimit = concert.purchaseLimit || 5;
                      const userPurchased = concert.userPurchasedCount || 0;
                      const maxCanBuy = Math.max(0, purchaseLimit - userPurchased);
                      setQuantity((q) => Math.min(maxCanBuy, maxStock, q + 1));
                    }}
                    disabled={
                      quantity >=
                      Math.min(
                        Math.max(0, (concert.purchaseLimit || 5) - (concert.userPurchasedCount || 0)),
                        concert.ticketGrades?.find((g) => g.id === selectedGrade)
                          ?.availableStock || 0
                      )
                    }
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  每人限购{concert.purchaseLimit || 5}张
                  {(concert.userPurchasedCount || 0) > 0 && (
                    <>，已购{concert.userPurchasedCount}张</>
                  )}
                  ，当前库存：{" "}
                  {concert.ticketGrades?.find((g) => g.id === selectedGrade)
                    ?.availableStock || 0}
                </p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">总计</span>
                <span className="text-2xl font-bold text-primary">
                  ¥
                  {quantity *
                    (concert.ticketGrades?.find((g) => g.id === selectedGrade)
                      ?.price || 0)}
                </span>
              </div>

              {/* Submit */}
              <Button
                onClick={handleBookingSubmit}
                disabled={isBooking}
                className="w-full btn-neon bg-primary text-primary-foreground"
                size="lg"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    抢票中...
                  </>
                ) : (
                  "确认抢票"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
