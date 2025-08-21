
"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Organization } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import useLocalStorage from "@/hooks/use-local-storage";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Please enter a valid email." }).optional().or(z.literal('')),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  termsAndConditions: z.array(z.object({
    text: z.string().min(1, "Term cannot be empty."),
  })).optional(),
  currency: z.string().optional(),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [organization, setOrganization] = useLocalStorage<Organization | null>(
    "metalmetrica-org",
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      email: "",
      address: "",
      contactNumber: "",
      termsAndConditions: [],
      currency: "USD",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "termsAndConditions",
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        logoUrl: organization.logoUrl || "",
        email: organization.email || "",
        address: organization.address || "",
        contactNumber: organization.contactNumber || "",
        termsAndConditions: organization.termsAndConditions || [],
        currency: organization.currency || "USD",
      });
    }
  }, [organization, form]);

  const logoUrl = form.watch("logoUrl");

  function onSubmit(values: z.infer<typeof formSchema>) {
    setOrganization(values);
    toast({
      title: "Organization saved!",
      description: "Your details have been saved for future reports.",
    });
    router.push("/");
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-6">
      <div className="w-full max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Organization Settings</CardTitle>
                  <CardDescription>
                    {organization ? "Update your organization details." : "Set up your organization details to be used in reports."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company LLC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="123 Main St, Anytown, USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                     <FormLabel>Terms & Conditions</FormLabel>
                     <div className="grid gap-2 pt-2">
                        {fields.map((field, index) => (
                           <div key={field.id} className="flex items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name={`termsAndConditions.${index}.text`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input placeholder={`Term ${index + 1}`} {...field} />
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
                        <Button type="button" variant="outline" onClick={() => append({ text: '' })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Term
                        </Button>
                     </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a currency" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                <SelectItem value="JPY">JPY (¥)</SelectItem>
                                <SelectItem value="INR">INR (₹)</SelectItem>
                                <SelectItem value="BDT">BDT (৳)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://placehold.co/150x50.png"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {logoUrl && (
                      <div className="flex flex-col items-center">
                        <Label className="mb-2">Logo Preview</Label>
                        <Image
                          src={logoUrl}
                          alt="Logo preview"
                          width={150}
                          height={50}
                          className="rounded-md border object-contain"
                          data-ai-hint="company logo"
                        />
                      </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                   <Button variant="outline" asChild>
                     <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Link>
                   </Button>
                  <Button type="submit">Save</Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
      </div>
    </div>
  );
}
