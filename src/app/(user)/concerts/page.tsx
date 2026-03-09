"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConcertCard } from "@/components/concert/ConcertCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getConcerts } from "@/lib/api/concerts";
import { useConcertStore } from "@/stores/concertStore";
import type { ConcertVO, ConcertQueryRequest } from "@/types/api";
import { PAGINATION } from "@/lib/constants";

// 动态状态筛选类型
type DynamicStatus = "upcoming" | "on-sale" | "ended" | undefined;

const DYNAMIC_STATUS_LABELS: Record<DynamicStatus, string> = {
  upcoming: "即将开售",
  "on-sale": "开售中",
  ended: "已结束",
};

export default function ConcertsPage() {
  const router = useRouter();
  const { concerts, setConcerts, setPagination, isLoading, setLoading } =
    useConcertStore();

  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [size, setSize] = useState(PAGINATION.DEFAULT_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<DynamicStatus>("on-sale"); // 默认只显示开售中
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [allConcerts, setAllConcerts] = useState<ConcertVO[]>([]); // 存储所有未关闭的演唱会

  // 根据时间动态计算演唱会状态
  const getDynamicStatus = (concert: ConcertVO): DynamicStatus => {
    const now = new Date();
    const startSaleTime = new Date(concert.startSaleTime);
    const endSaleTime = new Date(concert.endSaleTime);

    if (now < startSaleTime) {
      return "upcoming";
    } else if (now < endSaleTime) {
      return "on-sale";
    } else {
      return "ended";
    }
  };

  // 根据筛选条件过滤演唱会
  const filteredConcerts = useMemo(() => {
    if (!statusFilter) {
      return allConcerts;
    }
    return allConcerts.filter((concert) => getDynamicStatus(concert) === statusFilter);
  }, [allConcerts, statusFilter]);

  const fetchConcerts = async () => {
    setLoading(true);
    try {
      // 只获取 status = 1（开售中）的演唱会，不包括已关闭的
      const params: ConcertQueryRequest = {
        page: 1,
        size: 100, // 获取较多数据用于前端筛选
        status: 1, // 只获取未关闭的演唱会
        name: searchQuery || undefined,
      };

      const response = await getConcerts(params);
      setAllConcerts(response.records);
      setTotal(response.records.length); // 使用筛选后的数量
    } catch (error: any) {
      console.error("Failed to fetch concerts:", error);
      setAllConcerts([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, [searchQuery]);

  useEffect(() => {
    // 更新当前显示的演唱会列表
    setConcerts(filteredConcerts);
  }, [filteredConcerts, setConcerts]);

  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? undefined : (value as DynamicStatus);
    setStatusFilter(newStatus);
    setPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsis = totalPages > 7;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - 1 && i <= page + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={
                page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pages.map((p, index) =>
            p === "..." ? (
              <PaginationEllipsis key={`ellipsis-${index}`} />
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => setPage(Number(p))}
                  isActive={page === p}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={
                page === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 flex-1 sm:w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-glow-blue">演唱会</h1>
        <p className="text-muted-foreground">
          发现并预订您喜爱的演唱会门票
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center glass p-4 rounded-lg">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索演唱会名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40 bg-card/50">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {Object.entries(DYNAMIC_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 <span className="font-semibold text-foreground">{concerts.length}</span> 场演唱会
        </p>
        {(statusFilter && statusFilter !== "on-sale") || searchQuery ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("on-sale");
              setSearchQuery("");
            }}
          >
            清除筛选
          </Button>
        ) : null}
      </div>

      {/* Concert Grid */}
      {concerts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {concerts.map((concert) => (
            <ConcertCard key={concert.id} concert={concert} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Filter className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">暂无演唱会</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter
              ? "没有找到符合条件的演唱会，请尝试其他搜索条件"
              : "暂时没有可用的演唱会"}
          </p>
          {(searchQuery || statusFilter) && (
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter("on-sale");
                setSearchQuery("");
              }}
            >
              清除筛选条件
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
