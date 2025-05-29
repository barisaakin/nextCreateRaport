"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { EditRowDialog } from "@/components/dialog-edit-row";
import { api } from "@/lib/api";

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'firstName', header: 'First Name' },
  { accessorKey: 'lastName', header: 'Last Name' },
  { accessorKey: 'companyName', header: 'Company Name' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'isActive',
    header: 'Durum',
    cell: ({ row }) => (
      row.original.isActive ? (
        <Button
          variant="outline"
          className="w-25 border-green-500 text-green-600 flex items-center gap-1 cursor-default"
          style={{ borderColor: "#22c55e", color: "#22c55e" }}
          disabled
        >
          <IconCircleCheck size={18} className="text-green-500" />
          Aktif
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-25 border-red-500 text-red-600 flex items-center gap-1 cursor-default"
          style={{ borderColor: "#ef4444", color: "#ef4444" }}
          disabled
        >
          <IconCircleX size={18} className="text-red-500" />
          Deaktif
        </Button>
      )
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5 w-20">
        {row.original.role}
      </Badge>
    ),
  },
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
    api.get("/users")
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (created) => {
    try {
      const newUser = await api.post("/users", created);
      setData(prev => [...prev, newUser]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (updated) => {
    try {
      const user = await api.patch(`/users/${updated.id}`, updated);
      setData(prev => prev.map(u => u.id === user.id ? user : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setData(prev => prev.filter(u => u.id !== id));
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
        addButtonTitle="Add User"
        addDialogColumns={columns}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}