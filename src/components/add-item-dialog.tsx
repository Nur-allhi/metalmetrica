
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STEEL_DENSITIES } from "@/lib/constants";
import type { SteelItem, SteelPlate } from "@/types";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: Omit<SteelItem, 'id'>) => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Item name is required."),
  type: z.enum(["plate", "girder", "pipe"]),
  length: z.coerce.number().min(1, "Length is required."),
  width: z.coerce.number().min(1, "Width is required."),
  thickness: z.coerce.number().min(0.1, "Thickness is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  price: z.coerce.number().min(0).optional(), // Price per kg
});

type FormData = z.infer<typeof formSchema>;

export default function AddItemDialog({ open, onOpenChange, onAddItem }: AddItemDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "plate",
      quantity: 1,
      price: 0.8,
    },
  });

  function onSubmit(data: FormData) {
    // For now, only plate is implemented
    if (data.type === "plate") {
        const { length, width, thickness, quantity, price } = data;

        // Calculations are in metric (mm -> m)
        const lengthM = length / 1000;
        const widthM = width / 1000;
        const thicknessM = thickness / 1000;

        const volumeM3 = lengthM * widthM * thicknessM;
        const weightKg = volumeM3 * STEEL_DENSITIES.MS; // Using MS density for now
        const cost = weightKg * (price || 0);

        const newItem: Omit<SteelPlate, 'id'> = {
            name: data.name,
            type: 'plate',
            quantity: quantity,
            length: length,
            width: width,
            thickness: thickness,
            weight: weightKg,
            cost: cost,
        };
        onAddItem(newItem);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Select the item type and enter its specifications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Base Plate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select item type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="plate">Steel Plate</SelectItem>
                            <SelectItem value="girder" disabled>Girder (coming soon)</SelectItem>
                            <SelectItem value="pipe" disabled>Pipe (coming soon)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="grid grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (mm)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (mm)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="thickness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thickness (mm)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price ($/kg)</FormLabel>
                            <FormControl><Input type="number" step="any" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
