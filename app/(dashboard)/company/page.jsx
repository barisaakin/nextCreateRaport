"use client";
import React from "react";
import { DataTable } from "@/components/data-table";
import data from "./data.json";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";

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
      <DataTable data={data} columns={columns} addButtonTitle={'Add Company'} />
    </div>
  );
}
