import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditRowDialog({ columns, rowData, onSave, children, open, onOpenChange }) {
  const [form, setForm] = useState(() =>
    columns.reduce((acc, col) => {
      if (col.accessorKey) acc[col.accessorKey] = rowData[col.accessorKey];
      return acc;
    }, {})
  );

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
          <DialogTitle>Edit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {columns.filter(col => col.accessorKey && col.accessorKey !== "id").map(col => (
            <div key={col.accessorKey} className="flex flex-col gap-1">
              <Label htmlFor={col.accessorKey}>{col.header}</Label>
              <Input
                id={col.accessorKey}
                value={form[col.accessorKey] ?? ""}
                onChange={e => handleChange(col.accessorKey, e.target.value)}
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" className="w-full">Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 