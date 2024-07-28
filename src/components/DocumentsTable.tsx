import React from "react";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Document } from "@/types";
import { getToken, queryClient } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Title
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="capitalize">{row.getValue("description")}</div>,
  },
  {
    accessorKey: "updatedAt",
    header: () => <div className="text-right">Last Updated</div>,
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt as number;
      // Format the amount as a dollar amount
      const formatted = new Date(updatedAt).toLocaleString("en-GB", {
        year: "2-digit",
        month: "short",
        day: "numeric",
      });

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original;
      async function download(filename: string) {
        const response = await fetch(`/api/documents/url?fileName=${filename}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
        });
        if (!response.ok) {
          throw new Error("Failed to get S3 url");
        }
        const res: { url: string } = await response.json();
        window.open(res.url, "_blank", "noreferrer");
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => download(data.fileName as string)}>Download</DropdownMenuItem>
            <a href={`/documents/${data.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </a>
            <DropdownMenuSeparator />
            <DeleteModal id={data.id as string} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type DeleteDocumentResponse = {
  message: string;
};
function DeleteModal(props: { id: string }) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation<DeleteDocumentResponse, Error>({
    mutationFn: async (input) => {
      const response = await fetch(`/api/documents/${props.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Success",
        description: "Your document has been deleted successfully.",
      });
      navigate("/documents", { replace: false });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className="w-full">
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this document and it cannot be
            recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DocumentsTable(props: { data: Document[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: props.data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter documents by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-zinc-950 dark:text-zinc-50">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
