"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { EditRowDialog } from "@/components/dialog-edit-row";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Loader from "@/components/ui/skeleton";

export default function Page() {
  const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpenId, setEditOpenId] = useState(null);

  const modalColumns = [
    { accessorKey: 'firstName', header: 'Ad' },
    { accessorKey: 'lastName', header: 'Soyad' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol', type: 'select', options: [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'USER', label: 'Kullanıcı' },
    ] },
  ];

  const addDialogColumns = [
    ...modalColumns,
    { accessorKey: 'companyId', header: 'Şirket', type: 'select', options: companies.map(c => ({ value: c.id, label: c.name })) },
    { accessorKey: 'password', header: 'Şifre', type: 'password' },
  ];

  const columns = [
    { accessorKey: 'firstName', header: 'Ad' },
    { accessorKey: 'lastName', header: 'Soyad' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol', cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5 w-20">{row.original.role}</Badge>
    ) },
    { accessorKey: 'companyName', header: 'Şirket' },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <IconDotsVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpenId(row.original.id)}>
                Güncelle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-600">
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
            <EditRowDialog
              columns={modalColumns}
              rowData={{ ...row.original, id: row.original.id }}
              onSave={handleUpdate}
              open={editOpenId === row.original.id}
              onOpenChange={(v) => setEditOpenId(v ? row.original.id : null)}
            />
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    }
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await api.get("/users");
      const mapped = users.map(u => ({
        ...u,
        companyName: companies.find(c => c.id === u.companyId)?.name || "-"
      }));
      setData(mapped);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const companies = await api.get("/companies");
      setCompanies(companies);
    } catch (err) {
      toast.error("Şirketler yüklenemedi");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (companies.length > 0) fetchUsers();
  }, [companies]);

  const handleAdd = async (created) => {
    setActionLoading(true);
    try {
      const body = {
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        password: created.password,
        role: created.role,
        companyId: Number(created.companyId),
      };
      await api.post("/users", body);
      toast.success("Kullanıcı oluşturuldu");
      setAddOpen(false);
      await fetchUsers();
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
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
      };
      await api.patch(`/users/${updated.id}`, body);
      toast.success("Kullanıcı güncellendi");
      setEditOpenId(null);
      await fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await api.delete(`/users/${id}`);
      toast.success("Kullanıcı silindi");
      setEditOpenId(null);
      await fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

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
        addButtonTitle="Kullanıcı Ekle"
        addDialogColumns={addDialogColumns}
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