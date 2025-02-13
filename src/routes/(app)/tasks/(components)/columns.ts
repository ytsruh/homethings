import type { ColumnDef } from "@tanstack/table-core";
import type { Task } from "../(data)/schemas.js";
import {
  DataTableColumnHeader,
  DataTablePriorityCell,
  DataTableRowActions,
  DataTableStatusCell,
  DataTableTitleCell,
  DataTableLabel,
} from "./index.js";
import { renderComponent } from "$lib/components/ui/data-table/index.js";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: ({ column }) =>
      renderComponent(DataTableColumnHeader<Task, unknown>, {
        column,
        title: "Title",
      }),
    cell: ({ row }) => {
      return renderComponent(DataTableTitleCell, {
        value: row.original.title,
      });
    },
  },
  {
    accessorKey: "label",
    header: ({ column }) => {
      return renderComponent(DataTableColumnHeader<Task, unknown>, {
        column,
        title: "Label",
      });
    },
    cell: ({ row }) => {
      return renderComponent(DataTableLabel, {
        labelValue: row.original.label,
      });
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) =>
      renderComponent(DataTableColumnHeader<Task, unknown>, {
        column,
        title: "Status",
      }),
    cell: ({ row }) => {
      return renderComponent(DataTableStatusCell, {
        value: row.original.status,
      });
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return renderComponent(DataTableColumnHeader<Task, unknown>, {
        title: "Priority",
        column,
      });
    },
    cell: ({ row }) => {
      return renderComponent(DataTablePriorityCell, {
        value: row.original.priority,
      });
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => renderComponent(DataTableRowActions<Task>, { row }),
  },
];
