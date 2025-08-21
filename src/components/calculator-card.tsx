
"use client"

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { STEEL_DENSITIES, KG_TO_LBS } from "@/lib/constants";

const formSchema = z.object({
  type: z.enum(["plate", "pipe", "girder", "circular", "plate-imperial"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  price: z.union([z.coerce.number().min(0), z.literal('')]).optional().transform(v => v === '' ? null : v),

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
    if (data.type === 'plate-imperial') {
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

interface CalculationResult {
  totalWeight: number;
  totalCost: number | null;
  weightPerPiece: number;
  costPerPiece: number | null;
  unit: 'kg' | 'lbs';
  // Girder specific
  flangeWeight?: number;
  webWeight?: number;
  flangeRunningFeet?: number;
  webRunningFeet?: number;
  quantity: number;
}

export default function CalculatorCard() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "plate",
      quantity: 1,
      price: undefined,
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
    const currentType = form.getValues("type");
    form.reset({
      type: currentType,
      quantity: 1,
      price: undefined,
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
    });
    setResult(null);
  }

  function onSubmit(data: FormData) {
    const { quantity, price } = data;
    const pricePerKg = typeof price === 'number' ? price : null;
    const density = STEEL_DENSITIES.MS;

    let weightKg = 0;
    let girderDetails: Partial<CalculationResult> = {};

    if (data.type === "plate" && data.length && data.width && data.thickness) {
        const { length, width, thickness } = data;
        const volumeM3 = (length / 1000) * (width / 1000) * (thickness / 1000);
        weightKg = volumeM3 * density;
    } else if (data.type === "plate-imperial" && data.length && data.width && data.thickness) {
        const { length, width, thickness } = data; // length/width in IN, thickness in MM
        const thicknessIn = thickness / 25.4;
        const weightLbs = length * width * thicknessIn * 0.284; // Using standard steel density
        weightKg = weightLbs / KG_TO_LBS;
    } else if (data.type === "pipe" && data.length && data.outerDiameter && data.wallThickness) {
        const { length, outerDiameter, wallThickness } = data;
        const innerDiameter = outerDiameter - 2 * wallThickness;
        const outerRadiusM = outerDiameter / 2 / 1000;
        const innerRadiusM = innerDiameter / 2 / 1000;
        const volumeM3 = Math.PI * (Math.pow(outerRadiusM, 2) - Math.pow(innerRadiusM, 2)) * (length / 1000);
        weightKg = volumeM3 * density;
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
    }

    const costPerPiece = pricePerKg !== null ? weightKg * pricePerKg : null;

    setResult({
        totalWeight: weightKg * quantity,
        totalCost: costPerPiece !== null ? costPerPiece * quantity : null,
        weightPerPiece: weightKg,
        costPerPiece: costPerPiece,
        unit: itemType === 'plate-imperial' ? 'lbs' : 'kg',
        quantity,
        ...girderDetails
    });
  }
  
  const renderInput = (field: any) => <Input type="number" step="any" {...field} value={field.value ?? ''} />;

  const getLengthUnit = () => (itemType === 'plate-imperial' ? 'in' : 'mm');
  const getWidthUnit = () => (itemType === 'plate-imperial' ? 'in' : 'mm');
  const getThicknessUnit = () => 'mm';
  const getPriceUnit = () => (itemType === 'plate-imperial' ? 'lbs' : 'kg');

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Single Item Calculator</CardTitle>
        <CardDescription>Calculate the weight and cost of a single steel item.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-6">
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
                            <FormLabel>Price ($/{getPriceUnit()}) (Opt.)</FormLabel>
                            <FormControl>{renderInput(field)}</FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            
               {result && (
                <Card className="bg-muted/50">
                    <CardHeader className='pb-4'>
                        <CardTitle className='text-xl'>Calculation Result</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Weight</p>
                                <p className="text-2xl font-bold">
                                    {(result.unit === 'lbs' ? result.totalWeight * KG_TO_LBS : result.totalWeight).toFixed(2)} {result.unit}
                                </p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Total Cost</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {result.totalCost !== null ? `$${result.totalCost.toFixed(2)}` : 'N/A'}
                                </p>
                            </div>
                        </div>

                         <div className="border-t pt-4 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Weight / piece</p>
                                <p className="text-lg font-semibold">
                                     {(result.unit === 'lbs' ? result.weightPerPiece * KG_TO_LBS : result.weightPerPiece).toFixed(2)} {result.unit}
                                </p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Cost / piece</p>
                                <p className="text-lg font-semibold text-green-600">
                                    {result.costPerPiece !== null ? `$${result.costPerPiece.toFixed(2)}` : 'N/A'}
                                </p>
                            </div>
                         </div>
                         
                         {itemType === 'girder' && result.flangeWeight !== undefined && (
                            <div className="border-t pt-4 text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                                <p>Flange Wt:</p><p className="text-right font-medium text-foreground">{(result.flangeWeight).toFixed(2)} kg (Total: {(result.flangeWeight * result.quantity).toFixed(2)} kg)</p>
                                <p>Web Wt:</p><p className="text-right font-medium text-foreground">{(result.webWeight!).toFixed(2)} kg (Total: {(result.webWeight! * result.quantity).toFixed(2)} kg)</p>
                                <p>Flange Running Ft:</p><p className="text-right font-medium text-foreground">{(result.flangeRunningFeet!).toFixed(2)} (Total: {(result.flangeRunningFeet! * result.quantity).toFixed(2)})</p>
                                <p>Web Running Ft:</p><p className="text-right font-medium text-foreground">{(result.webRunningFeet!).toFixed(2)} (Total: {(result.webRunningFeet! * result.quantity).toFixed(2)})</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
               )}

            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={resetFields}>Reset</Button>
              <Button type="submit">Calculate</Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    