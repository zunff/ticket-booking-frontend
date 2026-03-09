"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Music,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteConcert } from "@/lib/api/concerts";
import { CONCERT_STATUS_LABELS, CONCERT_STATUS_COLORS } from "@/lib/constants";
import type { ConcertVO } from "@/types/api";

interface ConcertTableProps {
  concerts: ConcertVO[];
  onEdit: (concert: ConcertVO) => void;
  onDelete: () => void;
}

export function ConcertTable({
  concerts,
  onEdit,
  onDelete,
}: ConcertTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    concert: ConcertVO | null;
  }>({ open: false, concert: null });

  const handleDelete = async () => {
    if (!deleteDialog.concert) return;

    try {
      await deleteConcert(deleteDialog.concert.id);
      toast.success("删除成功", {
        description: `演唱会"${deleteDialog.concert.name}"已删除`,
      });
      setDeleteDialog({ open: false, concert: null });
      onDelete();
    } catch (error: any) {
      toast.error("删除失败", {
        description: error.message || "删除失败，请稍后重试",
      });
    }
  };

  if (concerts.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg border-dashed">
        <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground">暂无演唱会</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border/50 overflow-hidden glass">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="w-16">ID</TableHead>
                <TableHead>演唱会名称</TableHead>
                <TableHead>场馆</TableHead>
                <TableHead>演出时间</TableHead>
                <TableHead>售票时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {concerts.map((concert) => (
                <TableRow key={concert.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">
                    #{concert.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium max-w-48 truncate">
                      {concert.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-32 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{concert.venue}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-primary" />
                      {format(new Date(concert.showTime), "MM-dd HH:mm", {
                        locale: zhCN,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>
                        开:{" "}
                        {format(
                          new Date(concert.startSaleTime),
                          "MM-dd HH:mm",
                          { locale: zhCN }
                        )}
                      </div>
                      <div>
                        止:{" "}
                        {format(new Date(concert.endSaleTime), "MM-dd HH:mm", {
                          locale: zhCN,
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        CONCERT_STATUS_COLORS[concert.status] as any
                      }
                    >
                      {CONCERT_STATUS_LABELS[concert.status] || concert.statusText || "未知"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEdit(concert)}
                          className="cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          编辑
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            setDeleteDialog({ open: true, concert })
                          }
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, concert: deleteDialog.concert })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除演唱会"
              {deleteDialog.concert?.name}
              "吗？此操作不可撤销，相关的票档和库存数据也将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
