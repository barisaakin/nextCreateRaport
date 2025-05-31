"use client";
import React, { useEffect, useState, use } from "react";
import ReportFormatBuilder from "@/components/report-format-builder";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Loader from "@/components/ui/skeleton";

export default function Page(props) {
  const router = useRouter();
  const [format, setFormat] = useState(null);
  const [loading, setLoading] = useState(true);
  const unwrappedParams = use(props.params);
  const { id } = unwrappedParams;

  useEffect(() => {
    let isMounted = true;
    if (!id || isNaN(Number(id))) {
      setLoading(false);
      return;
    }
    const fetchFormat = async () => {
      try {
        const data = await api.get(`/reports/${id}`);
        if (isMounted) setFormat(data);
      } catch (err) {
        if (isMounted) {
          toast.error("Rapor yüklenirken bir hata oluştu");
          router.push("/reports");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFormat();
    return () => {
      isMounted = false;
    };
  }, [id, router]);

  const handleSave = async (updatedFormat) => {
    setLoading(true);
    try {
      await api.patch(`/reports/${id}`, updatedFormat);
      toast.success("Rapor başarıyla güncellendi");
      router.push("/reports");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size={64} />;
  if (!format) return null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Formatı Düzenle: {format.name}</h1>
      </div>
      <ReportFormatBuilder 
        onSave={handleSave} 
        initialFormat={format}
      />
    </div>
  );
} 