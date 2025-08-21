
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
import type { SteelItem } from "@/types";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: Omit<SteelItem, 'id'>) => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Item name is required."),
  type: z.enum(["plate", "pipe", "girder", "circular"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  price: z.coerce.number().min(0).optional(), // Price per kg

  // Shared dimensions
  length: z.coerce.number().optional(),
  thickness: z.coerce.number().optional(),

  // Plate dimensions
  width: z.coerce.number().optional(),

  // Pipe dimensions
  outerDiameter: z.coerce.number().optional(),
  wallThickness: z.coerce.number().optional(),

  // Girder dimensions
  flangeWidth: z.coerce.number().optional(),
  flangeThickness: z.coerce.number().optional(),
  webHeight: z.coerce.number().optional(),
  webThickness: z.coerce.number().optional(),

  // Circular dimensions
  diameter: z.coerce.number().optional(),
  innerDiameter: z.coerce.number().optional(),


}).superRefine((data, ctx) => {
    if (data.type === 'plate') {
        if (!data.length || data.length <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Length is required", path: ['length'] });
        }
        if (!data.width || data.width <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Width is required", path: ['width'] });
        }
        if (!data.thickness || data.thickness <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thickness is required", path: ['thickness'] });
        }
    }
    if (data.type === 'pipe') {
        if (!data.length || data.length <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Length is required", path: ['length'] });
        }
        if (!data.outerDiameter || data.outerDiameter <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Outer Diameter is required", path: ['outerDiameter'] });
        }
        if (!data.wallThickness || data.wallThickness <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wall Thickness is required", path: ['wallThickness'] });
        }
        if (data.outerDiameter && data.wallThickness && data.wallThickness >= data.outerDiameter / 2) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thickness too large", path: ['wallThickness'] });
        }
    }
    if (data.type === 'girder') {
        if (!data.length || data.length <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Length is required", path: ['length'] });
        }
        if (!data.flangeWidth || data.flangeWidth <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Flange Width is required", path: ['flangeWidth'] });
        }
        if (!data.flangeThickness || data.flangeThickness <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Flange Thickness is required", path: ['flangeThickness'] });
        }
        if (!data.webHeight || data.webHeight <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Web Height is required", path: ['webHeight'] });
        }
        if (!data.webThickness || data.webThickness <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Web Thickness is required", path: ['webThickness'] });
        }
    }
    if (data.type === 'circular') {
        if (!data.thickness || data.thickness <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thickness is required", path: ['thickness'] });
        }
        if (!data.diameter || data.diameter <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Diameter is required", path: ['diameter'] });
        }
        if (data.innerDiameter && data.innerDiameter <= 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Inner Diameter must be > 0", path: ['innerDiameter'] });
        }
        if (data.diameter && data.innerDiameter && data.innerDiameter >= data.diameter) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Inner diameter must be smaller than outer diameter.", path: ['innerDiameter'] });
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
      flangeWidth: undefined,
      flangeThickness: undefined,
      webHeight: undefined,
      webThickness: undefined,
      diameter: undefined,
      innerDiameter: undefined,
    },
  });

  const itemType = form.watch("type");
  
  const resetFields = () => {
    const currentValues = form.getValues();
    form.reset({
      ...currentValues,
      length: undefined,
      width: undefined,
      thickness: undefined,
      outerDiameter: undefined,
      wallThickness: undefined,
      flangeWidth: undefined,
      flangeThickness: undefined,
      webHeight: undefined,
      webThickness: undefined,
      diameter: undefined,
      innerDiameter: undefined,
    })
  }

  function onSubmit(data: FormData) {
    const { quantity, price } = data;
    const pricePerKg = price || 0;

    let newItem: Omit<SteelItem, 'id'> | null = null;
    const density = STEEL_DENSITIES.MS;

    if (data.type === "plate" && data.length && data.width && data.thickness) {
        const { length, width, thickness } = data;
        const volumeM3 = (length / 1000) * (width / 1000) * (thickness / 1000);
        const weightKg = volumeM3 * density;
        newItem = {
            name: data.name, type: 'plate', quantity, length, width, thickness,
            weight: weightKg, cost: weightKg * pricePerKg,
        };
    } else if (data.type === "pipe" && data.length && data.outerDiameter && data.wallThickness) {
        const { length, outerDiameter, wallThickness } = data;
        const innerDiameter = outerDiameter - 2 * wallThickness;
        const outerRadiusM = outerDiameter / 2 / 1000;
        const innerRadiusM = innerDiameter / 2 / 1000;
        const volumeM3 = Math.PI * (Math.pow(outerRadiusM, 2) - Math.pow(innerRadiusM, 2)) * (length / 1000);
        const weightKg = volumeM3 * density;
        newItem = {
            name: data.name, type: 'pipe', quantity, length, outerDiameter, wallThickness,
            weight: weightKg, cost: weightKg * pricePerKg,
        };
    } else if (data.type === "girder" && data.length && data.flangeWidth && data.flangeThickness && data.webHeight && data.webThickness) {
        const { length, flangeWidth, flangeThickness, webHeight, webThickness } = data;
        const lengthM = length / 1000;
        const flangeWidthM = flangeWidth / 1000;
        const flangeThicknessM = flangeThickness / 1000;
        const webHeightM = webHeight / 1000;
        const webThicknessM = webThickness / 1000;

        const flangeVolume = 2 * flangeWidthM * flangeThicknessM * lengthM;
        const webVolume = webHeightM * webThicknessM * lengthM;
        const totalVolumeM3 = flangeVolume + webVolume;
        const weightKg = totalVolumeM3 * density;
        
        newItem = {
            name: data.name, type: 'girder', quantity, length, flangeWidth, flangeThickness, webHeight, webThickness,
            weight: weightKg, cost: weightKg * pricePerKg,
        };
    } else if (data.type === "circular" && data.thickness && data.diameter) {
        const { thickness, diameter, innerDiameter } = data;
        const thicknessM = thickness / 1000;
        const outerRadiusM = diameter / 2 / 1000;
        
        let volumeM3;
        if (innerDiameter && innerDiameter > 0) {
            // Hollow Circular Section
            const innerRadiusM = innerDiameter / 2 / 1000;
            volumeM3 = Math.PI * (Math.pow(outerRadiusM, 2) - Math.pow(innerRadiusM, 2)) * thicknessM;
        } else {
            // Solid Circular Plate
            volumeM3 = Math.PI * Math.pow(outerRadiusM, 2) * thicknessM;
        }
        const weightKg = volumeM3 * density;
        newItem = {
            name: data.name, type: 'circular', quantity, thickness, diameter, innerDiameter: innerDiameter || null,
            weight: weightKg, cost: weightKg * pricePerKg,
        };
    }

    if (newItem) {
        onAddItem(newItem);
        form.reset();
        onOpenChange(false);
    }
  }
  
  const renderInput = (field: any) => <Input type="number" step="any" {...field} value={field.value ?? ''} />;


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
                    <Select onValueChange={(value) => { field.onChange(value); resetFields(); }} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select item type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="plate">Steel Plate</SelectItem>
                            <SelectItem value="pipe">Steel Pipe</SelectItem>
                            <SelectItem value="girder">Steel Girder</SelectItem>
                            <SelectItem value="circular">Circular Section</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(itemType === 'plate' || itemType === 'pipe' || itemType === 'girder') && (
                <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (mm)</FormLabel>
                        <FormControl>{renderInput(field)}</FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

               {itemType === 'plate' && (
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (mm)</FormLabel>
                          <FormControl>{renderInput(field)}</FormControl>
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
                          <FormControl>{renderInput(field)}</FormControl>
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
                          <FormControl>{renderInput(field)}</FormControl>
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
                          <FormControl>{renderInput(field)}</FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
               )}
              
               {itemType === 'girder' && (
                 <>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="flangeWidth"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Flange Width</FormLabel>
                                <FormControl>{renderInput(field)}</FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="flangeThickness"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Flange Thickness</FormLabel>
                                <FormControl>{renderInput(field)}</FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="webHeight"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Web Height</FormLabel>
                                <FormControl>{renderInput(field)}</FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="webThickness"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Web Thickness</FormLabel>
                                <FormControl>{renderInput(field)}</FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                 </>
               )}

              {itemType === 'circular' && (
                <>
                    <FormField
                      control={form.control}
                      name="thickness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thickness (mm)</FormLabel>
                          <FormControl>{renderInput(field)}</FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <FormField
                         control={form.control}
                         name="diameter"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Outer Diameter</FormLabel>
                             <FormControl>{renderInput(field)}</FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="innerDiameter"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Inner Dia. (Opt.)</FormLabel>
                             <FormControl>{renderInput(field)}</FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                    </div>
                 </>
               )}


                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>{renderInput(field)}</FormControl>
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
                            <FormControl>{renderInput(field)}</FormControl>
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
