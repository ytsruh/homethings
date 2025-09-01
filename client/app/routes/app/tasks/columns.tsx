import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { type Task } from "~/lib/schema";
import { stripHtmlAndTruncate } from "~/lib/utils";
import { Link } from "react-router";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-left mx-2">
          {stripHtmlAndTruncate(row.getValue("title"))}
        </div>
      );
    },
    enableHiding: false, // disable column hiding for this column
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-left mx-2">
          {stripHtmlAndTruncate(row.getValue("description"))}
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <Badge className="text-left mx-2 capitalize">
          {row.getValue("priority")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      return (
        <Button variant="ghost" className="h-8 w-8 p-0" asChild>
          <Link to={`/app/tasks/${task.id}`}>
            <span className="sr-only">Open menu</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
    enableHiding: false, // disable column hiding for this column
  },
];
