"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getOrderDetail, initiatePayment } from "@/lib/api/orders";
import { useAuth } from "@/stores/authStore";
import { PAY_CHANNELS } from "@/lib/constants";
import type { OrderVO } from "@/types/api";
import { OrderStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

// 轮询间隔与上限：依据对接文档 §6（500ms~1s，最多约 10 次）
const POLL_INTERVAL = 1000;
const MAX_POLL_ATTEMPTS = 10;

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderNo = params.orderNo as string;
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState<OrderVO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [channel, setChannel] = useState<string>(PAY_CHANNELS[0].channel);
  const [paying, setPaying] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  // 支付宝等渠道的 payUrl 是自动提交表单 HTML（需渲染而非跳转）
  const [payUrlIsHtml, setPayUrlIsHtml] = useState(false);
  // 轮询超过上限后引导手动刷新
  const [pollExhausted, setPollExhausted] = useState(false);
  const pollCountRef = useRef(0);

  const loadOrder = useCallback(
    async (initial = false) => {
      try {
        const data = await getOrderDetail(orderNo);
        setOrder(data);
        setNotFound(false);
      } catch {
        if (initial) {
          setNotFound(true);
        }
      } finally {
        if (initial) setIsLoading(false);
      }
    },
    [orderNo]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!orderNo) return;
    loadOrder(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNo, isAuthenticated]);

  // 订单处理中 / 支付完成后轮询订单状态（间隔 1s，最多约 10 次）
  useEffect(() => {
    if (!order) return;
    const waitingPrepay = order.status === OrderStatus.PROCESSING;
    const waitingPay = paymentStarted && order.status === OrderStatus.PENDING;
    if (!waitingPrepay && !waitingPay) return;

    pollCountRef.current = 0;
    setPollExhausted(false);

    const timer = setInterval(() => {
      pollCountRef.current += 1;
      if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
        clearInterval(timer);
        setPollExhausted(true);
        return;
      }
      loadOrder(false);
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
    // 仅依赖订单状态变化重置轮询，避免每次拉取后重建定时器
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status, paymentStarted, loadOrder]);

  // 打开支付入口：URL 直接新窗口跳转；支付宝等返回的是自动提交表单 HTML，写入新窗口渲染
  const openPaymentEntry = (entry: string, isHtml: boolean) => {
    const win = window.open("", "_blank");
    if (!win) {
      toast.warning("浏览器拦截了弹窗", {
        description: "请允许弹窗或手动点击下方按钮",
      });
      return false;
    }
    if (isHtml) {
      win.document.open();
      win.document.write(entry);
      win.document.close();
    } else {
      win.location.href = entry;
    }
    return true;
  };

  const handlePay = async () => {
    if (!order) return;
    const selected = PAY_CHANNELS.find((c) => c.channel === channel);
    setPaying(true);
    try {
      const res = await initiatePayment(order.orderNo, {
        channel,
        payMode: selected?.payMode,
      });

      setPaymentStarted(true);
      setPayUrl(null);
      setPayUrlIsHtml(false);

      if (res.payUrl) {
        // 支付宝等渠道返回自动提交表单 HTML（以 < 开头），需渲染而非当 URL 跳转
        const isHtml = res.payUrl.trimStart().startsWith("<");
        setPayUrl(res.payUrl);
        setPayUrlIsHtml(isHtml);
        const opened = openPaymentEntry(res.payUrl, isHtml);
        if (opened) {
          toast.success("收银台已打开", {
            description: "请在弹出的窗口中完成支付",
          });
        }
      } else {
        // 同步渠道（mock_quick_*）prepay 即到达终态，轮询会捕获状态变化
        toast.info("支付处理中", {
          description: "正在确认支付结果...",
        });
      }
    } catch (error: any) {
      toast.error("发起支付失败", {
        description: error.message || "请稍后重试",
      });
    } finally {
      setPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">订单不存在</h2>
        <Button onClick={() => router.push("/orders")}>返回订单列表</Button>
      </div>
    );
  }

  const isProcessing = order.status === OrderStatus.PROCESSING;
  const isPending = order.status === OrderStatus.PENDING;
  const isPaid = order.status === OrderStatus.PAID;
  const isCancelled = order.status === OrderStatus.CANCELLED;
  const isFailed = order.status === OrderStatus.FAILED;
  const unitPrice = order.quantity ? order.totalPrice / order.quantity : 0;

  // 已支付
  if (isPaid) {
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <Card className="glass-strong">
          <CardContent className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">支付成功</h2>
            <p className="text-muted-foreground mb-6">
              订单号：{order.orderNo}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push("/orders")}>
                查看订单
              </Button>
              <Button variant="outline" onClick={() => router.push("/concerts")}>
                继续购票
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 已取消 / 已失败
  if (isCancelled || isFailed) {
    const cancelled = isCancelled;
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <Card className="glass-strong">
          <CardContent className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/15 mb-4">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {cancelled ? "订单已取消" : "订单已失败"}
            </h2>
            <p className="text-muted-foreground mb-2">
              订单号：{order.orderNo}
            </p>
            {!cancelled && order.failReason && (
              <p className="text-sm text-destructive mb-6">{order.failReason}</p>
            )}
            {cancelled && (
              <p className="text-muted-foreground mb-6">
                该订单已无法支付，请重新下单
              </p>
            )}
            <Button onClick={() => router.push("/concerts")}>重新购票</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 待支付 / 处理中 → 收银台
  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回订单
      </Button>

      {/* 处理中提示 */}
      {isProcessing && (
        <Card className="glass border-primary/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              订单正在处理中，请稍候，可支付后将自动激活...
            </p>
          </CardContent>
        </Card>
      )}

      {/* 订单信息 */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            订单信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">演唱会</span>
            <span className="font-medium">{order.concertName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">票档</span>
            <span className="font-medium">{order.gradeName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">数量</span>
            <span className="font-medium">{order.quantity} 张</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">单价</span>
            <span className="font-medium">¥{unitPrice.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm text-muted-foreground">订单号</span>
            <span className="text-sm font-mono">{order.orderNo}</span>
          </div>
        </CardContent>
      </Card>

      {/* 支付方式 */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              选择支付方式
            </span>
            <Badge variant="default" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              30 分钟内完成
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PAY_CHANNELS.map((c) => {
            const selected = c.channel === channel;
            return (
              <button
                key={c.channel}
                type="button"
                disabled={isProcessing}
                onClick={() => setChannel(c.channel)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  selected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0",
                    selected ? "border-primary" : "border-muted-foreground/40"
                  )}
                >
                  {selected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </button>
            );
          })}

          <Separator className="my-2" />

          {/* 应付金额 */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">应付金额</span>
            <span className="text-2xl font-bold text-primary">
              ¥{order.totalPrice.toFixed(2)}
            </span>
          </div>

          {/* 发起支付 */}
          <Button
            onClick={handlePay}
            disabled={isProcessing || paying}
            className="w-full btn-neon bg-primary text-primary-foreground"
            size="lg"
          >
            {paying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在发起支付...
              </>
            ) : (
              `确认支付 ¥${order.totalPrice.toFixed(2)}`
            )}
          </Button>

          {/* 支付等待区 */}
          {paymentStarted && isPending && (
            <div className="mt-2 p-4 rounded-lg bg-muted/50 border border-muted space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                等待支付结果，正在自动刷新...
              </div>
              {pollExhausted && (
                <p className="text-xs text-amber-500">
                  自动刷新超时，请点击下方按钮手动确认支付结果。
                </p>
              )}
              {payUrl && !payUrlIsHtml && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openPaymentEntry(payUrl, false)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  前往收银台
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => loadOrder(false)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                我已完成支付，刷新状态
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
