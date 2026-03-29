"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createConcert, updateConcert } from "@/lib/api/concerts";
import { CONCERT_STATUS_LABELS } from "@/lib/constants";
import type { ConcertRequest, ConcertDetailWithStockVO } from "@/types/api";
import { ConcertStatus } from "@/types/enums";

/**
 * 将后端返回的时间字符串转换为 datetime-local 格式
 * 后端返回格式: "2026-03-30 07:00:00" (本地时间)
 * datetime-local 需要格式: "2026-03-30T07:00"
 */
function toDatetimeLocal(dateStr: string | undefined): string {
  if (!dateStr) return "";
  // 后端返回 "yyyy-MM-dd HH:mm:ss"，直接替换为 datetime-local 格式
  return dateStr.replace(" ", "T").slice(0, 16);
}

/**
 * 将 datetime-local 格式转换为后端期望的格式
 * datetime-local 格式: "2026-03-30T07:00" (本地时间)
 * 后端期望格式: "2026-03-30T07:00:00" (ISO 格式，但保持本地时间)
 */
function toBackendFormat(datetimeLocal: string): string {
  if (!datetimeLocal) return "";
  // datetime-local 格式 "yyyy-MM-ddTHH:mm"，补充秒数
  return datetimeLocal + ":00";
}

const ticketGradeSchema = z.object({
  gradeName: z.string().min(1, "请输入票档名称"),
  price: z.number().min(0, "价格不能为负数"),
  totalStock: z.number().min(0, "库存不能为负数"),
  isSelectedSeat: z.number(),
});

const concertSchema = z.object({
  name: z.string().min(1, "请输入演唱会名称"),
  venue: z.string().min(1, "请输入场馆名称"),
  showTime: z.string().min(1, "请选择演出时间"),
  startSaleTime: z.string().min(1, "请选择开始售票时间"),
  endSaleTime: z.string().min(1, "请选择结束售票时间"),
  purchaseLimit: z.number().min(1, "限购数量至少为1"),
  status: z.number(),
  ticketGrades: z.array(ticketGradeSchema).min(1, "至少添加一个票档"),
});

type ConcertFormData = z.infer<typeof concertSchema>;

interface ConcertFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  concert?: ConcertDetailWithStockVO | null;
}

export function ConcertForm({
  open,
  onClose,
  onSuccess,
  concert,
}: ConcertFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!concert;

  const form = useForm<ConcertFormData>({
    resolver: zodResolver(concertSchema),
    defaultValues: {
      name: concert?.name || "",
      venue: concert?.venue || "",
      showTime: toDatetimeLocal(concert?.showTime),
      startSaleTime: toDatetimeLocal(concert?.startSaleTime),
      endSaleTime: toDatetimeLocal(concert?.endSaleTime),
      purchaseLimit: concert?.purchaseLimit ?? 5,
      status: concert?.status ?? ConcertStatus.CLOSED,
      // API 层已将分转为元，直接使用
      ticketGrades: concert?.ticketGrades?.map((g) => ({
        gradeName: g.gradeName,
        price: g.price,
        totalStock: g.totalStock,
        isSelectedSeat: g.isSelectedSeat,
      })) || [
        {
          gradeName: "",
          price: 0,
          totalStock: 0,
          isSelectedSeat: 0,
        },
      ],
    },
  });

  useEffect(() => {
    if (concert) {
      form.reset({
        name: concert.name,
        venue: concert.venue,
        showTime: toDatetimeLocal(concert.showTime),
        startSaleTime: toDatetimeLocal(concert.startSaleTime),
        endSaleTime: toDatetimeLocal(concert.endSaleTime),
        purchaseLimit: concert.purchaseLimit ?? 5,
        status: concert.status,
        // API 层已将分转为元，直接使用
        ticketGrades: concert.ticketGrades?.map((g) => ({
          gradeName: g.gradeName,
          price: g.price,
          totalStock: g.totalStock,
          isSelectedSeat: g.isSelectedSeat,
        })) || [],
      });
    } else {
      form.reset({
        name: "",
        venue: "",
        showTime: "",
        startSaleTime: "",
        endSaleTime: "",
        purchaseLimit: 5,
        status: ConcertStatus.CLOSED,
        ticketGrades: [
          {
            gradeName: "",
            price: 0,
            totalStock: 0,
            isSelectedSeat: 0,
          },
        ],
      });
    }
  }, [concert, form]);

  const onSubmit = async (data: ConcertFormData) => {
    setIsLoading(true);
    try {
      const payload: ConcertRequest = {
        id: concert?.id,
        name: data.name,
        venue: data.venue,
        showTime: toBackendFormat(data.showTime),
        startSaleTime: toBackendFormat(data.startSaleTime),
        endSaleTime: toBackendFormat(data.endSaleTime),
        purchaseLimit: data.purchaseLimit,
        status: data.status,
        ticketGrades: data.ticketGrades,
      };

      if (isEditing) {
        await updateConcert(concert!.id, payload);
        toast.success("更新成功", {
          description: "演唱会信息已更新",
        });
      } else {
        await createConcert(payload);
        toast.success("创建成功", {
          description: "新演唱会已创建",
        });
      }

      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(isEditing ? "更新失败" : "创建失败", {
        description: error.message || "操作失败，请稍后重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTicketGrade = () => {
    const current = form.getValues("ticketGrades");
    form.setValue("ticketGrades", [
      ...current,
      {
        gradeName: "",
        price: 0,
        totalStock: 0,
        isSelectedSeat: 0,
      },
    ]);
  };

  const removeTicketGrade = (index: number) => {
    const current = form.getValues("ticketGrades");
    if (current.length > 1) {
      form.setValue(
        "ticketGrades",
        current.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑演唱会" : "创建演唱会"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "修改演唱会信息和票档" : "填写演唱会信息并设置票档"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">演唱会名称 *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="例如：2024周杰伦巡回演唱会"
                disabled={isLoading}
                className="bg-card/50"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">场馆 *</Label>
              <Input
                id="venue"
                {...form.register("venue")}
                placeholder="例如：北京国家体育场（鸟巢）"
                disabled={isLoading}
                className="bg-card/50"
              />
              {form.formState.errors.venue && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.venue.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="showTime">演出时间 *</Label>
              <Input
                id="showTime"
                type="datetime-local"
                {...form.register("showTime")}
                disabled={isLoading}
                className="bg-card/50"
              />
              {form.formState.errors.showTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.showTime.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">状态 *</Label>
                <Select
                  value={form.watch("status")?.toString()}
                  onValueChange={(v) => form.setValue("status", Number(v))}
                >
                  <SelectTrigger className="bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONCERT_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseLimit">限购数量 *</Label>
                <Input
                  id="purchaseLimit"
                  type="number"
                  min={1}
                  {...form.register("purchaseLimit", { valueAsNumber: true })}
                  placeholder="每人限购票数"
                  disabled={isLoading}
                  className="bg-card/50"
                />
                {form.formState.errors.purchaseLimit && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.purchaseLimit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startSaleTime">开始售票时间 *</Label>
                <Input
                  id="startSaleTime"
                  type="datetime-local"
                  {...form.register("startSaleTime")}
                  disabled={isLoading}
                  className="bg-card/50"
                />
                {form.formState.errors.startSaleTime && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.startSaleTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endSaleTime">结束售票时间 *</Label>
                <Input
                  id="endSaleTime"
                  type="datetime-local"
                  {...form.register("endSaleTime")}
                  disabled={isLoading}
                  className="bg-card/50"
                />
                {form.formState.errors.endSaleTime && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.endSaleTime.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Ticket Grades */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>票档设置 *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTicketGrade}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                添加票档
              </Button>
            </div>

            {form.formState.errors.ticketGrades && (
              <p className="text-sm text-destructive">
                {form.formState.errors.ticketGrades.message}
              </p>
            )}

            <div className="space-y-4">
              {form.watch("ticketGrades")?.map((_, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">票档 {index + 1}</Badge>
                    {form.watch("ticketGrades")?.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeTicketGrade(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">票档名称</Label>
                      <Input
                        {...form.register(
                          `ticketGrades.${index}.gradeName`
                        )}
                        placeholder="例如：VIP"
                        disabled={isLoading}
                        className="bg-card/50 h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">选座类型</Label>
                      <Select
                        value={form.watch(
                          `ticketGrades.${index}.isSelectedSeat`
                        )?.toString()}
                        onValueChange={(v) =>
                          form.setValue(
                            `ticketGrades.${index}.isSelectedSeat`,
                            Number(v)
                          )
                        }
                      >
                        <SelectTrigger className="bg-card/50 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">不选座</SelectItem>
                          <SelectItem value="1">选座</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">价格（元）</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(
                          `ticketGrades.${index}.price`,
                          { valueAsNumber: true }
                        )}
                        placeholder="0.00"
                        disabled={isLoading}
                        className="bg-card/50 h-9"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">总库存</Label>
                      <Input
                        type="number"
                        {...form.register(
                          `ticketGrades.${index}.totalStock`,
                          { valueAsNumber: true }
                        )}
                        placeholder="0"
                        disabled={isLoading}
                        className="bg-card/50 h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading} className="btn-neon">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "保存中..." : "创建中..."}
                </>
              ) : (
                isEditing ? "保存" : "创建"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
