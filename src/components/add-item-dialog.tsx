
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
import type { SteelItem, SteelPlate, SteelPipe } from "@/types";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: Omit<SteelItem, 'id'>) => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Item name is required."),
  type: z.enum(["plate", "pipe", "girder"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  price: z.coerce.number().min(0).optional(), // Price per kg

  // Plate dimensions
  length: z.coerce.number().min(0.1, "Required"),
  width: z.coerce.number().optional(),
  thickness: z.coerce.number().optional(),

  // Pipe dimensions
  outerDiameter: z.coerce.number().optional(),
  wallThickness: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
    if (data.type === 'plate') {
        if (!data.width) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Width is required", path: ['width'] });
        }
        if (!data.thickness) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thickness is required", path: ['thickness'] });
        }
    }
    if (data.type === 'pipe') {
        if (!data.outerDiameter) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Outer Diameter is required", path: ['outerDiameter'] });
        }
        if (!data.wallThickness) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wall Thickness is required", path: ['wallThickness'] });
        }
        if (data.outerDiameter && data.wallThickness && data.wallThickness >= data.outerDiameter / 2) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thickness too large", path: ['wallThickness'] });
        }
    }
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
      length: undefined,
      width: undefined,
      thickness: undefined,
      outerDiameter: undefined,
      wallThickness: undefined,
    },
  });

  const itemType = form.watch("type");

  function onSubmit(data: FormData) {
    const { quantity, price } = data;
    const pricePerKg = price || 0;

    if (data.type === "plate" && data.length && data.width && data.thickness) {
        const { length, width, thickness } = data;

        const lengthM = length / 1000;
        const widthM = width / 1000;
        const thicknessM = thickness / 1000;

        const volumeM3 = lengthM * widthM * thicknessM;
        const weightKg = volumeM3 * STEEL_DENSITIES.MS;
        const cost = weightKg * pricePerKg;

        const newItem: Omit<SteelPlate, 'id'> = {
            name: data.name,
            type: 'plate',
            quantity,
            length,
            width,
            thickness,
            weight: weightKg,
            cost: cost,
        };
        onAddItem(newItem);
        form.reset();
        onOpenChange(false);
    } else if (data.type === "pipe" && data.length && data.outerDiameter && data.wallThickness) {
        const { length, outerDiameter, wallThickness } = data;
        const innerDiameter = outerDiameter - 2 * wallThickness;

        const lengthM = length / 1000;
        const outerRadiusM = outerDiameter / 2 / 1000;
        const innerRadiusM = innerDiameter / 2 / 1000;
        
        const volumeM3 = Math.PI * (Math.pow(outerRadiusM, 2) - Math.pow(innerRadiusM, 2)) * lengthM;
        const weightKg = volumeM3 * STEEL_DENSITIES.MS;
        const cost = weightKg * pricePerKg;

        const newItem: Omit<SteelPipe, 'id'> = {
            name: data.name,
            type: 'pipe',
            quantity,
            length,
            outerDiameter,
            wallThickness,
            weight: weightKg,
            cost: cost,
        };
        onAddItem(newItem);
        form.reset();
        onOpenChange(false);
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
                Select the item type and enter its specifications. All dimensions in mm.
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
                            <SelectItem value="pipe">Steel Pipe</SelectItem>
                            <SelectItem value="girder" disabled>Girder (coming soon)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

               {itemType === 'plate' && (
                 <div className="grid grid-cols-2 gap-4">
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
               )}

              {itemType === 'pipe' && (
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="outerDiameter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outer Dia. (mm)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="wallThickness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wall Thick. (mm)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
               )}

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
