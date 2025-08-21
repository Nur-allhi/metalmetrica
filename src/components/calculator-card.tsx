"use client"

import React, { useState, useMemo } from 'react';
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { UnitSystem } from "@/types";
import { STEEL_DENSITIES, KG_TO_LBS, MM_TO_IN, M_TO_FT } from "@/lib/constants";

const formSchema = z.object({
  length: z.coerce.number().min(1, "Length is required."),
  width: z.coerce.number().min(1, "Width is required."),
  thickness: z.coerce.number().min(0.1, "Thickness is required."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  density: z.coerce.number().min(1, "Density is required."),
  price: z.coerce.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CalculatorCard() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [steelType, setSteelType] = useState<string>("MS");
  const [result, setResult] = useState<{ weight: number; cost: number } | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      density: STEEL_DENSITIES.MS,
      price: 0.8,
    },
  });

  const dimUnit = useMemo(() => unitSystem === 'metric' ? 'mm' : 'in', [unitSystem]);
  const priceUnit = useMemo(() => unitSystem === 'metric' ? 'kg' : 'lbs', [unitSystem]);

  const handleSteelTypeChange = (type: string) => {
    setSteelType(type);
    if (type === "MS" || type === "SS") {
      setValue("density", STEEL_DENSITIES[type as keyof typeof STEEL_DENSITIES]);
    }
  };
  
  const onSubmit = (data: FormData) => {
    const { length, width, thickness, quantity, density, price } = data;

    // All calculations are done in metric then converted if needed.
    const lengthM = unitSystem === 'metric' ? length / 1000 : length * 0.0254;
    const widthM = unitSystem === 'metric' ? width / 1000 : width * 0.0254;
    const thicknessM = unitSystem === 'metric' ? thickness / 1000 : thickness * 0.0254;

    const volumeM3 = lengthM * widthM * thicknessM;
    const weightKg = volumeM3 * density;
    const totalWeightKg = weightKg * quantity;

    const pricePerKg = unitSystem === 'metric' ? (price || 0) : (price || 0) / KG_TO_LBS;
    const totalCost = totalWeightKg * pricePerKg;

    if (unitSystem === 'imperial') {
        setResult({
            weight: totalWeightKg * KG_TO_LBS,
            cost: totalCost,
        });
    } else {
        setResult({
            weight: totalWeightKg,
            cost: totalCost,
        });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Single Item Calculator</CardTitle>
        <CardDescription>Calculate the weight and cost of a single steel item.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Unit System</Label>
                <RadioGroup defaultValue="metric" onValueChange={(val) => setUnitSystem(val as UnitSystem)} className="mt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="metric" id="metric" />
                        <Label htmlFor="metric">Metric (mm, kg)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="imperial" id="imperial" />
                        <Label htmlFor="imperial">Imperial (in, lbs)</Label>
                    </div>
                </RadioGroup>
              </div>
               <div>
                  <Label>Steel Type</Label>
                  <Select onValueChange={handleSteelTypeChange} defaultValue="MS">
                      <SelectTrigger>
                          <SelectValue placeholder="Select steel type" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="MS">Mild Steel</SelectItem>
                          <SelectItem value="SS">Stainless Steel</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                  </Select>
               </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Length ({dimUnit})</Label>
              <Input id="length" type="number" step="any" {...register("length")} />
              {errors.length && <p className="text-destructive text-xs mt-1">{errors.length.message}</p>}
            </div>
            <div>
              <Label htmlFor="width">Width ({dimUnit})</Label>
              <Input id="width" type="number" step="any" {...register("width")} />
               {errors.width && <p className="text-destructive text-xs mt-1">{errors.width.message}</p>}
            </div>
            <div>
              <Label htmlFor="thickness">Thickness ({dimUnit})</Label>
              <Input id="thickness" type="number" step="any" {...register("thickness")} />
              {errors.thickness && <p className="text-destructive text-xs mt-1">{errors.thickness.message}</p>}
            </div>
             <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" {...register("quantity")} />
              {errors.quantity && <p className="text-destructive text-xs mt-1">{errors.quantity.message}</p>}
            </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <Label htmlFor="density">Density ({unitSystem === 'metric' ? 'kg/m³' : 'lb/ft³'})</Label>
                <Input id="density" type="number" step="any" {...register("density")} readOnly={steelType !== 'Custom'} />
                {errors.density && <p className="text-destructive text-xs mt-1">{errors.density.message}</p>}
             </div>
             <div>
                <Label htmlFor="price">Price ($ per {priceUnit})</Label>
                <Input id="price" type="number" step="any" {...register("price")} />
             </div>
           </div>
           
           {result && (
            <Card className="bg-muted/50">
                <CardContent className="p-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Weight</p>
                        <p className="text-2xl font-bold">{result.weight.toFixed(2)} {priceUnit}</p>
                    </div>
                     <div>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-2xl font-bold text-green-600">${result.cost.toFixed(2)}</p>
                    </div>
                </CardContent>
            </Card>
           )}

        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit">Calculate</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
