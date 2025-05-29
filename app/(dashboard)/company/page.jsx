"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { EditRowDialog } from "@/components/dialog-edit-row";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Loader from "@/components/ui/skeleton";

function handleUpdateWrapper(handleUpdate) {
  return (updated) => handleUpdate(updated);
}

function handleDeleteWrapper(handleDelete, id) {
  return () => handleDelete(id);
}

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [editOpenId, setEditOpenId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const companies = await api.get("/companies");
      setData(companies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAdd = async (created) => {
    setActionLoading(true);
    try {
      const body = {
        name: created.name,
        phoneOfRepresentative: created.phoneOfRepresentative,
        emailOfRepresentative: created.emailOfRepresentative,
      };
      await api.post("/companies", body);
      toast.success("Şirket oluşturuldu");
      setAddOpen(false);
      await fetchCompanies();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (updated) => {
    setActionLoading(true);
    try {
      const body = {
        name: updated.name,
        phoneOfRepresentative: updated.phoneOfRepresentative,
        emailOfRepresentative: updated.emailOfRepresentative,
      };
      await api.patch(`/companies/${updated.id}`, body);
      toast.success("Şirket güncellendi");
      setEditOpenId(null);
      await fetchCompanies();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await api.delete(`/companies/${id}`);
      toast.success("Şirket silindi");
      setEditOpenId(null);
      await fetchCompanies();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { accessorKey: 'name', header: 'Şirket Adı' },
    { accessorKey: 'phoneOfRepresentative', header: 'Temsilci Telefonu' },
    { accessorKey: 'emailOfRepresentative', header: 'Temsilci Emaili' },
    { accessorKey: 'createdAt', header: 'Oluşturulma Tarihi', cell: ({ row }) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : "-" },
    { accessorKey: 'updatedAt', header: 'Güncellenme Tarihi', cell: ({ row }) => row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleString() : "-" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const open = editOpenId === row.original.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDotsVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpenId(row.original.id)}>
                Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
            <EditRowDialog
              columns={modalColumns}
              rowData={{ ...row.original, id: row.original.id }}
              onSave={handleUpdate}
              open={open}
              onOpenChange={(v) => setEditOpenId(v ? row.original.id : null)}
            />
            {open && console.log('EditRowDialog açıldı, id:', row.original.id)}
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ];

  // Modalda sadece düzenlenebilir alanlar (id yok)
  const modalColumns = [
    { accessorKey: 'name', header: 'Company Name' },
    { accessorKey: 'phoneOfRepresentative', header: 'Phone of Representative' },
    { accessorKey: 'emailOfRepresentative', header: 'Email of Representative' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader size={64} />
    </div>
  );
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        addButtonTitle="Add Company"
        addDialogColumns={modalColumns}
        onAdd={handleAdd}
        addDialogOpen={addOpen}
        onAddDialogOpenChange={setAddOpen}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
}
