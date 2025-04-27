"use client";
import React from "react";
import { DataTable } from "@/components/data-table";
import data from "@/app/(dashboard)/users/data.json";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconCircleCheck, IconCircleX } from "@tabler/icons-react";

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
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => alert(`Edit id: ${row.original.id}`)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert(`Delete id: ${row.original.id}`)}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  }
];

export default function Page() {
  return (
    <div>
      <DataTable data={data} columns={columns} addButtonTitle={'Add User'} />
    </div>
  );
}