"use client";
import React, { useEffect, useState } from "react";
import ReportFormatBuilder from "@/components/report-format-builder";
import { useRouter } from "next/navigation";

export default function Page(props) {
  const router = useRouter();
  const [format, setFormat] = useState(null);

  useEffect(() => {
    // Formatı localStorage'dan al
    const savedFormats = localStorage.getItem('reportFormats');
    if (savedFormats) {
      const formats = JSON.parse(savedFormats);
      const foundFormat = formats.find(f => f.id === parseInt(props.params.id));
      if (foundFormat) {
        setFormat(foundFormat);
      } else {
        router.push("/reports");
      }
    } else {
      router.push("/reports");
    }
  }, [props.params.id, router]);

  const handleSave = (updatedFormat) => {
    // Mevcut formatları al
    const savedFormats = localStorage.getItem('reportFormats');
    const formats = savedFormats ? JSON.parse(savedFormats) : [];
    
    // Formatı güncelle
    const updatedFormats = formats.map(f => 
      f.id === parseInt(props.params.id) 
        ? { ...updatedFormat, id: f.id, updatedAt: new Date().toISOString() }
        : f
    );
    
    // Formatları kaydet
    localStorage.setItem('reportFormats', JSON.stringify(updatedFormats));
    
    // Reports sayfasına yönlendir
    router.push("/reports");
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