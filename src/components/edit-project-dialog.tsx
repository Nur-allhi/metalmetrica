
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
import type { Project } from "@/types";
import { useAuth } from "./auth-provider";

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditProject: (data: { name: string, customer: string }) => void;
  project: Project | null;
}

const formSchema = z.object({
  name: z.string().min(2, "Project name is required."),
  customer: z.string().min(2, "Customer name is required."),
});

type FormData = z.infer<typeof formSchema>;

export default function EditProjectDialog({ open, onOpenChange, onEditProject, project }: EditProjectDialogProps) {
  const { user } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      customer: "",
    },
  });
  
  useEffect(() => {
    if (project) {
        form.reset({
            name: project.name,
            customer: project.customer,
        })
    }
  }, [project, form]);


  function onSubmit(data: FormData) {
    if (!user) return;
    onEditProject(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the details for your project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Skyscraper" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                     <FormControl>
                      <Input placeholder="e.g. ACME Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
