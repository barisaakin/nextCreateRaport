"use client";
import React, { useEffect, useState } from "react";
import ReportFormatBuilder from "@/components/report-format-builder";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Page(props) {
  const router = useRouter();
  const [format, setFormat] = useState(null);
  const { id } = props.params;

  useEffect(() => {
    const fetchFormat = async () => {
      try {
        const data = await api.get(`/reports/${id}`);
        setFormat(data);
      } catch (err) {
        router.push("/reports");
      }
    };
    fetchFormat();
  }, [id, router]);

  const handleSave = async (updatedFormat) => {
    try {
      await api.patch(`/reports/${id}`, updatedFormat);
      router.push("/reports");
    } catch (err) {
      alert(err.message);
    }
  };

  if (!format) {
    return <div>Yükleniyor...</div>;
  }

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