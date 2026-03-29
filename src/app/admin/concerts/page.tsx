"use client";

import { useState, useEffect } from "react";
import { Plus, Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConcertForm } from "@/components/admin/ConcertForm";
import { ConcertTable } from "@/components/admin/ConcertTable";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminConcerts, getAdminConcertDetail } from "@/lib/api/concerts";
import type { ConcertVO, ConcertDetailVO } from "@/types/api";

export default function AdminConcertsPage() {
  const [concerts, setConcerts] = useState<ConcertVO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConcert, setEditingConcert] =
    useState<ConcertDetailVO | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConcerts = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminConcerts({
        current: 1,
        size: 100,
        name: searchQuery || undefined,
      });
      setConcerts(response.records);
    } catch (error: any) {
      console.error("Failed to fetch concerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchConcerts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleEdit = async (concert: ConcertVO) => {
    try {
      const detail = await getAdminConcertDetail(concert.id);
      setEditingConcert(detail);
      setIsFormOpen(true);
    } catch (error) {
      console.error("Failed to fetch concert detail:", error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingConcert(null);
  };

  const handleFormSuccess = () => {
    fetchConcerts();
  };

  const handleCreate = () => {
    setEditingConcert(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-glow-blue">演唱会管理</h1>
          <p className="text-muted-foreground">
            管理演唱会信息、票档和库存
          </p>
        </div>
        <Button onClick={handleCreate} className="btn-neon gap-2">
          <Plus className="w-4 h-4" />
          创建演唱会
        </Button>
      </div>

      {/* Search */}
      <div className="glass p-4 rounded-lg">
        <div className="relative max-w-md">
          <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索演唱会名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <ConcertTable
          concerts={concerts}
          onEdit={handleEdit}
          onDelete={fetchConcerts}
        />
      )}

      {/* Form Dialog */}
      <ConcertForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        concert={editingConcert}
      />
    </div>
  );
}
