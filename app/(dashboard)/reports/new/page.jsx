"use client";
import React from "react";
import ReportFormatBuilder from "@/components/report-format-builder";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();

  const handleSave = async (format) => {
    try {
      await api.post("/reports", format);
      toast.success("Rapor oluşturuldu");
      router.push("/reports");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yeni Rapor Formatı</h1>
      </div>
      <ReportFormatBuilder onSave={handleSave} />
    </div>
  );
} 