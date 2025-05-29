"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Page() {
  const router = useRouter();
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/reports")
      .then(setFormats)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateFormat = () => {
    router.push("/reports/new");
  };

  const handleEditFormat = (id) => {
    router.push(`/reports/edit/${id}`);
  };

  const handleDeleteFormat = async (id) => {
    try {
      await api.delete(`/reports/${id}`);
      setFormats(prev => prev.filter(format => format.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFillFormat = (id) => {
    router.push(`/reports/fill/${id}`);
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rapor Formatları</h1>
        <Button onClick={handleCreateFormat} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Format
        </Button>
      </div>

      {formats.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
          <p className="text-lg text-muted-foreground mb-4">Henüz hiç format oluşturulmamış</p>
          <Button onClick={handleCreateFormat} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Format Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {formats.map((format) => (
            <div key={format.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{format.name}</h3>
                <p className="text-sm text-muted-foreground">{format.description || "Açıklama yok"}</p>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Oluşturulma: {new Date(format.createdAt).toLocaleDateString()}</span>
                  <span>Güncelleme: {new Date(format.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleFillFormat(format.id)}
                  title="Formatı Doldur"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEditFormat(format.id)}
                  title="Formatı Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteFormat(format.id)}
                  title="Formatı Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
