
"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from 'lucide-react';

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
import type { AdditionalCost } from "@/types";
import { getCurrencySymbol } from "@/lib/utils";


interface AdditionalCostsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (costs: AdditionalCost[]) => void;
  currencyCode: string;
}

const formSchema = z.object({
  costs: z.array(z.object({
    description: z.string().min(1, "Description is required."),
    amount: z.coerce.number().min(0, "Amount must be positive."),
  })),
});

type FormData = z.infer<typeof formSchema>;

export default function AdditionalCostsDialog({ open, onOpenChange, onConfirm, currencyCode }: AdditionalCostsDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "costs",
  });
  
  const currencySymbol = getCurrencySymbol(currencyCode);

  function onSubmit(data: FormData) {
    const costsWithIds = data.costs.map((cost, index) => ({
        ...cost,
        id: `cost_${Date.now()}_${index}`
    }));
    onConfirm(costsWithIds);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if(!isOpen) form.reset();
        onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Additional Costs</DialogTitle>
              <DialogDescription>
                Add any additional costs like transport, labor, or taxes. These will be added to the report.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto pr-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[2fr_1fr_auto] items-end gap-2 p-2 border rounded-md">
                        <FormField
                            control={form.control}
                            name={`costs.${index}.description`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Transportation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`costs.${index}.amount`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs">Amount ({currencySymbol})</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="any" placeholder="100.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={() => append({ description: '', amount: 0 })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Cost
                </Button>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Generate with Costs</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
