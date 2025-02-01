"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, } from "lucide-react";
import { Button } from "../ui/button";


export type AduitLogs = {
    id: number;
    description: string;
    sessionUserName: string;
    audit_type: string;
    dateTime: Date;
}
export const auditcolumns: ColumnDef<AduitLogs>[] = [
    {
        accessorKey: "audit_type",
        header: "Audit Type",
        cell: ({ row }) => (
            <div>
                <span className="text-sm ">{row.original.audit_type}</span>
            </div>
        ),
    },
    {
        accessorKey: "sessionUserName",
        header: "User Name",
        cell: ({ row }) => (
            <div>
                <span className="text-sm ">{row.original.sessionUserName}</span>
            </div>
        ),
    },
    {
        accessorKey: "dateTime",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc" ? false : true)}
            >
                Date Time
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div>
                <span className="text-sm ">{row.original.description}</span>
            </div>
        ),
    },


];

