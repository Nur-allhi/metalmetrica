
"use client";

import React, { useEffect } from "react";
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
import { STEEL_DENSITIES, KG_TO_LBS } from "@/lib/constants";
import type { SteelItem, SteelGirder } from "@/types";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditItem: (item: SteelItem) => void;
  item: SteelItem | null;
}

const formSchema = z.object({
  name: z.string().min(2, "Item name is required."),
  type: z.enum(["plate", "pipe", "girder", "circular", "plate-imperial"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  price: z.union([z.coerce.number().min(0), z.literal('')]).optional().transform(v => v === '' ? undefined : v),

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
    if (data.type === 'plate' || data.type === 'plate-imperial') {
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

export default function EditItemDialog({ open, onOpenChange, onEditItem, item }: EditItemDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (item) {
        const pricePerKg = item.cost !== null && item.weight > 0 ? item.cost / item.weight : undefined;
        form.reset({
            name: item.name,
            type: item.type,
            quantity: item.quantity,
            price: pricePerKg,
            ...('length' in item && { length: item.length }),
            ...('width' in item && { width: item.width }),
            ...('thickness' in item && { thickness: item.thickness }),
            ...('outerDiameter' in item && { outerDiameter: item.outerDiameter }),
            ...('wallThickness' in item && { wallThickness: item.wallThickness }),
            ...('flangeWidth' in item && { flangeWidth: item.flangeWidth }),
            ...('flangeThickness' in item && { flangeThickness: item.flangeThickness }),
            ...('webHeight' in item && { webHeight: item.webHeight }),
            ...('webThickness' in item && { webThickness: item.webThickness }),
            ...('diameter' in item && { diameter: item.diameter }),
            ...('innerDiameter' in item && { innerDiameter: item.innerDiameter }),
        });
    }
  }, [item, form]);

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
    if (!item) return;

    const { quantity } = data;
    const pricePerKg = typeof data.price === 'number' ? data.price : null;

    let updatedItem: SteelItem | null = null;
    const density = STEEL_DENSITIES.MS;

    let weightKg = 0;
    let girderDetails: Partial<SteelGirder> = {};

    if (data.type === "plate" && data.length && data.width && data.thickness) {
        const { length, width, thickness } = data;
        const volumeM3 = (length / 1000) * (width / 1000) * (thickness / 1000);
        weightKg = volumeM3 * density;
        updatedItem = { ...item, type: 'plate', name: data.name, quantity, length, width, thickness, weight: weightKg };
    } else if (data.type === "plate-imperial" && data.length && data.width && data.thickness) {
        const { length, width, thickness } = data;
        const thicknessIn = thickness / 25.4;
        const weightLbs = length * width * thicknessIn * 0.284;
        weightKg = weightLbs / KG_TO_LBS;
        updatedItem = { ...item, type: 'plate-imperial', name: data.name, quantity, length, width, thickness, weight: weightKg };
    } else if (data.type === "pipe" && data.length && data.outerDiameter && data.wallThickness) {
        const { length, outerDiameter, wallThickness } = data;
        const innerDiameter = outerDiameter - 2 * wallThickness;
        const outerRadiusM = outerDiameter / 2 / 1000;
        const innerRadiusM = innerDiameter / 2 / 1000;
        const volumeM3 = Math.PI * (Math.pow(outerRadiusM, 2) - Math.pow(innerRadiusM, 2)) * (length / 1000);
        weightKg = volumeM3 * density;
        updatedItem = { ...item, type: 'pipe', name: data.name, quantity, length, outerDiameter, wallThickness, weight: weightKg };
    } else if (data.type === "girder" && data.length && data.flangeWidth && data.flangeThickness && data.webHeight && data.webThickness) {
        const { length, flangeWidth, flangeThickness, webHeight, webThickness } = data;
        
        const MM_TO_M = 1 / 1000;
        const MM_TO_FT = 1 / 304.8;
        
        const flangeVolumeM3 = (flangeWidth * MM_TO_M) * (flangeThickness * MM_TO_M) * (length * MM_TO_M) * 2;
        const webVolumeM3 = (webHeight * MM_TO_M) * (webThickness * MM_TO_M) * (length * MM_TO_M);

        const flangeWeight = flangeVolumeM3 * density;
        const webWeight = webVolumeM3 * density;
        weightKg = flangeWeight + webWeight;

        const flangeRunningFeet = (length * MM_TO_FT * flangeWidth * 2) / 12;
        const webRunningFeet = (length * MM_TO_FT * webHeight) / 12;

        girderDetails = { flangeWeight, webWeight, flangeRunningFeet, webRunningFeet };
        updatedItem = { 
            ...item, 
            type: 'girder',
            name: data.name, quantity, length, flangeWidth, flangeThickness, webHeight, webThickness,
            weight: weightKg, ...girderDetails
        };

    } else if (data.type === "circular" && data.thickness && data.diameter) {
        const { thickness, diameter, innerDiameter } = data;
        const thicknessM = thickness / 1000;
        const outerRadiusM = diameter / 2 / 1000;
        
        let volumeM3;
        if (innerDiameter && innerDiameter > 0) {
            const innerRadiusM = innerDiameter / 2 / 1000;
            volumeM3 = Math.PI * (Math.pow(outerRadiusM, 2) - Math.pow(innerRadiusM, 2)) * thicknessM;
        } else {
            volumeM3 = Math.PI * Math.pow(outerRadiusM, 2) * thicknessM;
        }
        weightKg = volumeM3 * density;
        updatedItem = { ...item, type: 'circular', name: data.name, quantity, thickness, diameter, innerDiameter: innerDiameter || null, weight: weightKg };
    }

    if (updatedItem) {
        updatedItem.cost = pricePerKg !== null ? updatedItem.weight * pricePerKg : null;
        onEditItem(updatedItem);
        onOpenChange(false);
    }
  }
  
  const renderInput = (field: any) => <Input type="number" step="any" {...field} value={field.value ?? ''} />;

  const getLengthUnit = () => {
    return itemType === 'plate-imperial' ? 'in' : 'mm';
  }
  
  const getWidthUnit = () => {
    return itemType === 'plate-imperial' ? 'in' : 'mm';
  }

  const getThicknessUnit = () => 'mm';


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Update the item's specifications.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-6">
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
                    <Select onValueChange={(value) => { field.onChange(value); resetFields(); }} value={field.value} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select item type" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="plate">Steel Plate (Quality)</SelectItem>
                            <SelectItem value="plate-imperial">Steel Plate (Non-Quality)</SelectItem>
                            <SelectItem value="pipe">Steel Pipe</SelectItem>
                            <SelectItem value="girder">Steel Girder</SelectItem>
                            <SelectItem value="circular">Circular Section</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(itemType === 'plate' || itemType === 'pipe' || itemType === 'girder' || itemType === 'plate-imperial') && (
                <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length ({getLengthUnit()})</FormLabel>
                        <FormControl>{renderInput(field)}</FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              )}

               {(itemType === 'plate' || itemType === 'plate-imperial') && (
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width ({getWidthUnit()})</FormLabel>
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
                          <FormLabel>Thickness ({getThicknessUnit()})</FormLabel>
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
                                <FormLabel>Flange Width (mm)</FormLabel>
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
                                <FormLabel>Flange Thick. (mm)</FormLabel>
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
                                <FormLabel>Web Height (mm)</FormLabel>
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
                                <FormLabel>Web Thick. (mm)</FormLabel>
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
                             <FormLabel>Outer Dia. (mm)</FormLabel>
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
                             <FormLabel>Inner Dia. (mm) (Opt.)</FormLabel>
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
                            <FormLabel>Price ($/kg) (Opt.)</FormLabel>
                            <FormControl>{renderInput(field)}</FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
