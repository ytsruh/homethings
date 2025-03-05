import type { ColumnDef } from "@tanstack/table-core";
import {
  renderComponent,
  renderSnippet,
} from "$lib/components/ui/data-table/index.js";
import DocumentActions from "./DocumentActions.svelte";
import type { SelectDocument } from "@/lib/server/db/schema";
import { createRawSnippet } from "svelte";

export const columns: ColumnDef<SelectDocument>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const updatedAtCellSnippet = createRawSnippet<[string]>((getValue) => {
        const updatedAt = getValue();
        return {
          render: () => `<div class="text-left font-medium">${updatedAt}</div>`,
        };
      });
      return renderSnippet(
        updatedAtCellSnippet,
        new Date(row.getValue("updatedAt")).toLocaleString("en-GB", {
          year: "2-digit",
          month: "short",
          day: "numeric",
        }),
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return renderComponent(DocumentActions, { data: row.original });
    },
  },
];
