"use client";
import React from "react";
import { DataTable } from "@/components/data-table";
import data from "./data.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import { EditRowDialog } from "@/components/dialog-edit-row";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  return (
    <div>
      <DataTable
        data={data}
        columns={columns}
        addButtonTitle="Add Company"
        addDialogColumns={columns}
        onAdd={(created) => alert(JSON.stringify(created))}
      />
    </div>
  );
}
