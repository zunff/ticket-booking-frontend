"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Package, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getConcerts } from "@/lib/api/concerts";
import { adjustStock, getStockLogs } from "@/lib/api/stock";
import type { ConcertDetailVO, StockLogVO } from "@/types/api";
import { StockOperationType } from "@/types/enums";

export default function AdminStockPage() {
  const [concerts, setConcerts] = useState<ConcertDetailVO[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLogVO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState<number | undefined>(
    undefined
  );
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);

  // Adjust stock form state
  const [adjustForm, setAdjustForm] = useState({
    concertId: 0,
    gradeId: 0,
    quantity: 0,
    operation: "SET" as StockOperationType,
    reason: "",
  });
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchConcerts = async () => {
    setIsLoading(true);
    try {
      const response = await getConcerts({ page: 1, size: 100 });
      setConcerts(response.records as ConcertDetailVO[]);
    } catch (error: any) {
      console.error("Failed to fetch concerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockLogs = async () => {
    try {
      const response = await getStockLogs({
        concertId: selectedConcert,
        page: 1,
        size: 50,
      });
      setStockLogs(response.records);
    } catch (error: any) {
      console.error("Failed to fetch stock logs:", error);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  useEffect(() => {
    fetchStockLogs();
  }, [selectedConcert]);

  const selectedConcertData = concerts.find((c) => c.id === selectedConcert);

  const handleAdjustStock = async () => {
    if (!adjustForm.concertId || !adjustForm.gradeId) {
      toast.error("请选择演唱会和票档");
      return;
    }

    if (!adjustForm.reason.trim()) {
      toast.error("请填写调整原因");
      return;
    }

    setIsAdjusting(true);
    try {
      await adjustStock({
        concertId: adjustForm.concertId,
        gradeId: adjustForm.gradeId,
        quantity: adjustForm.quantity,
        operation: adjustForm.operation,
        reason: adjustForm.reason,
      });

      toast.success("库存调整成功");
      setIsAdjustDialogOpen(false);
      setAdjustForm({
        concertId: 0,
        gradeId: 0,
        quantity: 0,
        operation: "SET",
        reason: "",
      });

      // Refresh data
      fetchConcerts();
      fetchStockLogs();
    } catch (error: any) {
      toast.error("调整失败", {
        description: error.message || "库存调整失败，请稍后重试",
      });
    } finally {
      setIsAdjusting(false);
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case "INCREASE":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "DECREASE":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "SET":
        return <Minus className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getOperationLabel = (operation: string) => {
    switch (operation) {
      case "INCREASE":
        return "增加";
      case "DECREASE":
        return "减少";
      case "SET":
        return "设置";
      default:
        return operation;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "INCREASE":
        return "text-green-500";
      case "DECREASE":
        return "text-red-500";
      case "SET":
        return "text-blue-500";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-glow-blue">库存管理</h1>
          <p className="text-muted-foreground">查看和调整演唱会票档库存</p>
        </div>
      </div>

      {/* Concert Selector */}
      <div className="glass p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <Label>选择演唱会</Label>
            <Select
              value={selectedConcert?.toString() || ""}
              onValueChange={(v) => setSelectedConcert(Number(v))}
            >
              <SelectTrigger className="bg-card/50">
                <SelectValue placeholder="选择要管理的演唱会" />
              </SelectTrigger>
              <SelectContent>
                {concerts.map((concert) => (
                  <SelectItem key={concert.id} value={concert.id.toString()}>
                    {concert.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedConcert && (
            <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-neon">
                  <Package className="w-4 h-4 mr-2" />
                  调整库存
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>调整库存</DialogTitle>
                  <DialogDescription>
                    修改指定票档的库存数量
                  </DialogDescription>
                </DialogHeader>

                {selectedConcertData && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>票档 *</Label>
                      <Select
                        value={adjustForm.gradeId.toString() || ""}
                        onValueChange={(v) =>
                          setAdjustForm({ ...adjustForm, gradeId: Number(v) })
                        }
                      >
                        <SelectTrigger className="bg-card/50">
                          <SelectValue placeholder="选择票档" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedConcertData.ticketGrades.map((grade) => (
                            <SelectItem
                              key={grade.id}
                              value={grade.id.toString()}
                            >
                              {grade.gradeName} - 当前库存:{" "}
                              {grade.availableStock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>操作类型 *</Label>
                      <Select
                        value={adjustForm.operation}
                        onValueChange={(v: any) =>
                          setAdjustForm({ ...adjustForm, operation: v })
                        }
                      >
                        <SelectTrigger className="bg-card/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SET">设置库存</SelectItem>
                          <SelectItem value="INCREASE">增加库存</SelectItem>
                          <SelectItem value="DECREASE">减少库存</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>数量 *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={adjustForm.quantity}
                        onChange={(e) =>
                          setAdjustForm({
                            ...adjustForm,
                            quantity: Number(e.target.value),
                          })
                        }
                        placeholder="输入数量"
                        className="bg-card/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>调整原因 *</Label>
                      <Textarea
                        value={adjustForm.reason}
                        onChange={(e) =>
                          setAdjustForm({ ...adjustForm, reason: e.target.value })
                        }
                        placeholder="请说明库存调整的原因"
                        className="bg-card/50 resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAdjustDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={() => {
                          setAdjustForm({
                            ...adjustForm,
                            concertId: selectedConcert,
                          });
                          handleAdjustStock();
                        }}
                        disabled={isAdjusting}
                        className="btn-neon"
                      >
                        {isAdjusting ? "调整中..." : "确认调整"}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stock Overview */}
      {selectedConcertData && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>当前库存概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedConcertData.ticketGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{grade.gradeName}</h3>
                      <Badge variant="outline">¥{grade.price}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>总库存: {grade.totalStock}</span>
                      <span>可用: {grade.availableStock}</span>
                      <span>
                        已售: {grade.totalStock - grade.availableStock}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div
                      className={`text-2xl font-bold ${
                        grade.availableStock === 0
                          ? "text-destructive"
                          : grade.availableStock < 10
                          ? "text-accent"
                          : "text-primary"
                      }`}
                    >
                      {grade.availableStock}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {grade.availableStock === 0
                        ? "已售罄"
                        : grade.availableStock < 10
                        ? "库存紧张"
                        : "充足"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Logs */}
      {selectedConcert && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>调整记录</CardTitle>
          </CardHeader>
          <CardContent>
            {stockLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                      <TableHead>时间</TableHead>
                      <TableHead>演唱会</TableHead>
                      <TableHead>票档</TableHead>
                      <TableHead>操作</TableHead>
                      <TableHead>变化量</TableHead>
                      <TableHead>调整前</TableHead>
                      <TableHead>调整后</TableHead>
                      <TableHead>操作人</TableHead>
                      <TableHead>原因</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30">
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(log.createTime), "MM-dd HH:mm", {
                            locale: zhCN,
                          })}
                        </TableCell>
                        <TableCell className="max-w-32 truncate">
                          {log.concertName}
                        </TableCell>
                        <TableCell>{log.gradeName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getOperationIcon(log.operationType)}
                            <span className={getOperationColor(log.operationType)}>
                              {getOperationLabel(log.operationType)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`font-medium ${
                            log.changeQuantity > 0
                              ? "text-green-500"
                              : log.changeQuantity < 0
                              ? "text-red-500"
                              : ""
                          }`}
                        >
                          {log.changeQuantity > 0 ? "+" : ""}
                          {log.changeQuantity}
                        </TableCell>
                        <TableCell>{log.beforeStock}</TableCell>
                        <TableCell className="font-semibold">
                          {log.afterStock}
                        </TableCell>
                        <TableCell>{log.operator}</TableCell>
                        <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
                          {log.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">暂无调整记录</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedConcert && !isLoading && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">选择演唱会</h3>
          <p className="text-muted-foreground">
            请从上方选择一个演唱会以查看和管理其库存
          </p>
        </div>
      )}
    </div>
  );
}
