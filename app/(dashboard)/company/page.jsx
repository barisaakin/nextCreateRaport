"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { EditRowDialog } from "@/components/dialog-edit-row";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Company Title' },
  {
    accessorKey: 'companyManager',
    header: 'Manager',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5 w-20">
        {row.original.companyManager}
      </Badge>
    ),
  },
  { accessorKey: 'phoneCompany', header: 'Phone' },
  { accessorKey: 'emailCompany', header: 'Email' },
  { accessorKey: 'createdAt', header: 'Created At' },
  { accessorKey: 'updatedAt', header: 'Updated At' },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const [open, setOpen] = React.useState(false);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setOpen(true)}>
              Update
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert(`Delete: ${row.original.id}`)} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
          <EditRowDialog
            columns={columns}
            rowData={row.original}
            onSave={(updated) => alert(JSON.stringify(updated))}
            open={open}
            onOpenChange={setOpen}
          />
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
  }
];

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/companies")
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (created) => {
    try {
      const newCompany = await api.post("/companies", created);
      setData(prev => [...prev, newCompany]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (updated) => {
    try {
      const company = await api.patch(`/companies/${updated.id}`, updated);
      setData(prev => prev.map(c => c.id === company.id ? company : c));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/companies/${id}`);
      setData(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        addButtonTitle="Add Company"
        addDialogColumns={columns}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
