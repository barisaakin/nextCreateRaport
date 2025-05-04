"use client";
import React from "react";
import ReportFormatBuilder from "@/components/report-format-builder";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleSave = (format) => {
    // Mevcut formatları al
    const savedFormats = localStorage.getItem('reportFormats');
    const formats = savedFormats ? JSON.parse(savedFormats) : [];
    
    // Yeni formatı ekle
    const newFormat = {
      ...format,
      id: Date.now(), // Benzersiz ID oluştur
      description: format.description || "Açıklama yok"
    };
    
    formats.push(newFormat);
    
    // Formatları kaydet
    localStorage.setItem('reportFormats', JSON.stringify(formats));
    
    // Reports sayfasına yönlendir
    router.push("/reports");
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