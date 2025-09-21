"use client";

import { GetRoomsDocument } from "@/graphql/generated/graphql";
import { useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  createRoomAction,
  createTableAction,
  deleteRoomAction,
  deleteTableAction,
} from "@/app/(mainapp)/settings/tables/action";

const addRoomSchema = z.object({
  name: z.string().min(1).max(50),
  code: z.string().min(1).max(10),
});

const addTableSchema = z.object({
  roomId: z.string().nonempty(),
  label: z.string().min(1).max(20),
  seats: z.string().refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 1 && num <= 20;
  }, "Seats must be a number between 1 and 20"),
  // Allowing multiple tables creation at once is a planned feature
  // in the UI, but for now we keep it simple and create one table at a time.
  // To implement this, we would uncomment the count field and add a corresponding
  // input in the form.
  //count: z.number().min(1).max(100),
});

const deleteRoomSchema = z.object({
  roomId: z.string().nonempty(),
});

const deleteTableSchema = z.object({
  roomId: z.string().nonempty(),
  tableId: z.string().nonempty(),
});

function RoomsSettingsForm() {
  const { data, loading, error, refetch } = useQuery(GetRoomsDocument, {
    variables: { first: 100, page: 1 },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [isDialogRoomOpen, setIsDialogRoomOpen] = useState(false);
  const [isDialogTableOpen, setIsDialogTableOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false);

  const addRoomForm = useForm<z.infer<typeof addRoomSchema>>({
    resolver: zodResolver(addRoomSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const addTableForm = useForm<z.infer<typeof addTableSchema>>({
    resolver: zodResolver(addTableSchema),
    defaultValues: {
      roomId: "",
      label: "",
      seats: "4",
      //count: 1,
    },
  });

  const deleteRoomForm = useForm<z.infer<typeof deleteRoomSchema>>({
    resolver: zodResolver(deleteRoomSchema),
    defaultValues: {
      roomId: "",
    },
  });

  const deleteTableForm = useForm<z.infer<typeof deleteTableSchema>>({
    resolver: zodResolver(deleteTableSchema),
    defaultValues: {
      roomId: "",
      tableId: "",
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-khp-primary" />
        </div>
      </div>
    );
  }

  console.log("Rooms data:", data);
  const rooms = data?.rooms?.data || [];

  if (error || rooms.length === 0) {
    //TODO Handle error state
  }

  const onAddRoomSubmit = async (data: z.infer<typeof addRoomSchema>) => {
    try {
      const result = await createRoomAction({
        name: data.name,
        code: data.code,
      });

      if (result.success) {
        await refetch();
        setIsDialogRoomOpen(false);
        addRoomForm.reset();
      } else {
        addRoomForm.setError("root", {
          message: result.error || "Error updating quick access button",
        });
      }
    } catch {
      addRoomForm.setError("root", {
        message: "Error updating quick access button",
      });
    }
  };

  const onAddTableSubmit = async (data: z.infer<typeof addTableSchema>) => {
    try {
      const result = await createTableAction(parseInt(data.roomId, 10), {
        label: data.label,
        seats: parseInt(data.seats, 10),
      });

      if (result.success) {
        await refetch();
        setIsDialogTableOpen(false);
        addTableForm.reset();
      } else {
        addTableForm.setError("root", {
          message: result.error || "Error updating quick access button",
        });
      }
    } catch {
      addTableForm.setError("root", {
        message: "Error updating quick access button",
      });
    }
  };

  const handleDeleteRoom = async (data: z.infer<typeof deleteRoomSchema>) => {
    try {
      const result = await deleteRoomAction({
        roomId: data.roomId,
      });

      if (result.success) {
        await refetch();
        setIsDeleteDialogOpen(false);
        deleteRoomForm.reset();
      } else {
        deleteRoomForm.setError("root", {
          message: result.error || "Error updating quick access button",
        });
      }
    } catch {
      deleteRoomForm.setError("root", {
        message: "Error updating quick access button",
      });
    }
  };

  const handleDeleteTable = async (data: z.infer<typeof deleteTableSchema>) => {
    try {
      const result = await deleteTableAction({
        roomId: data.roomId,
        tableId: data.tableId,
      });

      if (result.success) {
        await refetch();
        setIsDeleteTableDialogOpen(false);
        deleteTableForm.reset();
      } else {
        deleteTableForm.setError("root", {
          message: result.error || "Error updating quick access button",
        });
      }
    } catch {
      deleteTableForm.setError("root", {
        message: "Error updating quick access button",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {rooms.map((room) => {
        const tables = room.tables || [];
        const tableCount = tables.length;
        return (
          <Card key={room.code}>
            <div className="mb-4 flex items-center px-4 pt-4 w-full flex-start">
              <CardHeader className="flex-1 p-0">
                <h2 className="text-lg font-semibold mb-2">{room.name}</h2>
                <p className="text-sm text-khp-text-secondary">
                  Code: {room.code} | Tables: {tableCount}
                </p>
              </CardHeader>
              <Button
                variant="khp-destructive"
                size="sm"
                onClick={() => {
                  deleteRoomForm.setValue("roomId", room.id.toString());
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="max-h-64 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.length > 0 ? (
                tables.map((table) => (
                  <Card
                    key={table.id}
                    className="mb-2 p-2 border border-khp-border rounded"
                  >
                    <h3 className="font-medium">{table.label}</h3>
                    <p className="text-sm text-khp-text-secondary">
                      Seats: {table.seats}
                    </p>
                    <Button
                      variant="khp-destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        deleteTableForm.setValue("roomId", room.id.toString());
                        deleteTableForm.setValue(
                          "tableId",
                          table.id.toString()
                        );
                        setIsDeleteTableDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </Card>
                ))
              ) : (
                <Card className="p-4 border border-khp-border rounded">
                  <p className="text-sm text-khp-text-secondary">
                    No tables in this room.
                  </p>
                </Card>
              )}
              <Card
                className="mb-2 p-2 border border-khp-border rounded flex flex-col items-center justify-center cursor-pointer hover:bg-khp-primary/5 transition"
                onClick={() => {
                  addTableForm.setValue("roomId", room.id);
                  setIsDialogTableOpen(true);
                }}
              >
                <Plus className="h-6 w-6 text-khp-primary" />
                <p className="ml-2 text-khp-primary font-medium">Add Table</p>
              </Card>
            </CardContent>
          </Card>
        );
      })}
      <Card
        onClick={() => {
          setIsDialogRoomOpen(true);
        }}
        className="flex-1 w-full md:w-auto cursor-pointer hover:bg-khp-primary/5 transition"
      >
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <Plus className="h-8 w-8 text-khp-primary mb-2" />
          <p className="text-khp-primary font-medium">Add Room</p>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogRoomOpen}
        onOpenChange={(open) => {
          setIsDialogRoomOpen(open);
          if (!open) {
            addRoomForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new room.
            </DialogDescription>
          </DialogHeader>
          <Form {...addRoomForm}>
            <form
              onSubmit={addRoomForm.handleSubmit(onAddRoomSubmit)}
              className="space-y-8"
            >
              {addRoomForm.formState.errors.root && (
                <p className="text-sm text-red-600">
                  {addRoomForm.formState.errors.root.message}
                </p>
              )}
              <FormField
                control={addRoomForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addRoomForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full"
                  variant="khp-default"
                  disabled={loading || addRoomForm.formState.isSubmitting}
                >
                  {loading || addRoomForm.formState.isSubmitting
                    ? "Creating..."
                    : "Create Room"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDialogTableOpen}
        onOpenChange={(open) => {
          setIsDialogTableOpen(open);
          if (!open) {
            addTableForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new table.
            </DialogDescription>
          </DialogHeader>
          <Form {...addTableForm}>
            <form
              onSubmit={addTableForm.handleSubmit(onAddTableSubmit)}
              className="space-y-8"
            >
              {addTableForm.formState.errors.root && (
                <p className="text-sm text-red-600">
                  {addTableForm.formState.errors.root.message}
                </p>
              )}
              <FormField
                control={addTableForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addTableForm.control}
                name="seats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Seats</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full"
                  variant="khp-default"
                  disabled={loading || addTableForm.formState.isSubmitting}
                >
                  {loading || addTableForm.formState.isSubmitting
                    ? "Creating..."
                    : "Create Table"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            deleteRoomForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {
                rooms.find(
                  (r) => r.id.toString() === deleteRoomForm.getValues("roomId")
                )?.name
              }
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="khp-destructive"
              onClick={deleteRoomForm.handleSubmit(handleDeleteRoom)}
              disabled={loading || deleteRoomForm.formState.isSubmitting}
            >
              {loading || deleteRoomForm.formState.isSubmitting
                ? "Deleting..."
                : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteTableDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteTableDialogOpen(open);
          if (!open) {
            deleteTableForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete Table{" "}
              {
                rooms
                  .find(
                    (r) =>
                      r.id.toString() === deleteTableForm.getValues("roomId")
                  )
                  ?.tables?.find(
                    (t) =>
                      t.id.toString() === deleteTableForm.getValues("tableId")
                  )?.label
              }
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this table? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="khp-destructive"
              onClick={deleteTableForm.handleSubmit(handleDeleteTable)}
              disabled={loading || deleteTableForm.formState.isSubmitting}
            >
              {loading || deleteTableForm.formState.isSubmitting
                ? "Deleting..."
                : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RoomsSettingsForm;
