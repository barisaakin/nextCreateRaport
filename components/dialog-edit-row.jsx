import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export function EditRowDialog({ columns, rowData, onSave, children, open, onOpenChange }) {
  const [form, setForm] = useState(() => ({
    ...rowData,
    ...columns.reduce((acc, col) => {
      if (col.accessorKey) acc[col.accessorKey] = rowData[col.accessorKey];
      return acc;
    }, {})
  }));

  const [showPassword, setShowPassword] = useState(false);
  const isAdd = !rowData || !rowData.id;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form);
  };

  return (
    <Dialog {...(open !== undefined ? { open, onOpenChange } : {})}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAdd ? "Ekle" : "Düzenle"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {columns.filter(col => col.accessorKey && col.accessorKey !== "id").map(col => {
            // Şifre alanı sadece eklemede gösterilsin
            if (col.accessorKey === "password" && !isAdd) return null;
            return (
              <div key={col.accessorKey} className="flex flex-col gap-1">
                <Label htmlFor={col.accessorKey}>{col.header}</Label>
                {col.type === "select" ? (
                  <Select
                    value={form[col.accessorKey]?.toString() || ""}
                    onValueChange={value => handleChange(col.accessorKey, value)}
                  >
                    <SelectTrigger className={col.selectProps?.className || "w-full"}>
                      <SelectValue placeholder={col.header} />
                    </SelectTrigger>
                    <SelectContent>
                      {col.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : col.type === "password" ? (
                  <div className="relative">
                    <Input
                      id={col.accessorKey}
                      type={showPassword ? "text" : "password"}
                      value={form[col.accessorKey] ?? ""}
                      onChange={e => handleChange(col.accessorKey, e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      tabIndex={-1}
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </button>
                  </div>
                ) : (
                  <Input
                    id={col.accessorKey}
                    value={form[col.accessorKey] ?? ""}
                    onChange={e => handleChange(col.accessorKey, e.target.value)}
                  />
                )}
              </div>
            );
          })}
          <DialogFooter>
            <Button type="submit" className="w-full">Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 