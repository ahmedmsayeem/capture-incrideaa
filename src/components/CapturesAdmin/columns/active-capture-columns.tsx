"use client"

/**
 * Column definitions for active captures table
 * Includes event name, category, image preview, and delete action
 */

import { Status } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../ui/button";
import { ArrowUpDown, } from "lucide-react";
import DeleteComponent from "../_components/delete-component";

/**
 * Type definition for capture data structure
 */
export type Capture = {
    state?: Status;
    id?: number;
    event_name?: string | null;
    event_category: string;
    compressed_path: string;
    upload_type?: string;
    image_path?: string;
    clicked_by_id?: number;
    date_time?: Date;
}

/**
 * Column configurations for active captures
 * Includes sortable columns and image preview
 */
export const activeCapturecolumns: ColumnDef<Capture>[] = [
    {
        accessorKey: "event_name",
        header: "Event Name",
        cell: ({ row }) => (
            row.original.event_name || ""
        ),
    },
    {
        accessorKey: "event_category",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "compressed_path",
        header: "Image",
        cell: ({ row }) => (
            <img
                src={row.original.compressed_path}
                alt="Capture"
                className="w-20 h-20 md:h-24 md:w-24 object-cover rounded-md"
            />
        ),
    },
    {
        id: "actions",
        header: "Delete",
        cell: ({ row }) => (
            <DeleteComponent id={row.original.id!} />
        )
    },
];

