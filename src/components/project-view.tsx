"use client";

import React from 'react';
import { Plus, Download, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Project, Organization } from '@/types';

interface ProjectViewProps {
    project: Project;
    organization: Organization | null;
    onPrint: (project: Project) => void;
}

export default function ProjectView({ project, organization, onPrint }: ProjectViewProps) {

  const totalWeight = project.items.reduce((acc, item) => acc + item.weight * item.quantity, 0) || 0;
  const totalCost = project.items.reduce((acc, item) => acc + item.cost * item.quantity, 0) || 0;

  const weightByType = project.items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = 0;
    }
    acc[item.type] += item.weight * item.quantity;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-3 flex-1">
        <div className="lg:col-span-2">
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                    {project.projectId} - For {project.customer}
                    </CardDescription>
                </div>
                <div className="flex gap-2 no-print">
                    <Button size="sm" variant="outline">
                    <Edit />
                    Edit Details
                    </Button>
                    <Button size="sm">
                    <Plus />
                    Add Item
                    </Button>
                </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Weight (kg)</TableHead>
                        <TableHead className="text-right">Cost ($)</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {project.items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No items in this project yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        project.items.map((item) => (
                            <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">{item.type}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{item.weight.toFixed(2)}</TableCell>
                            <TableCell className="text-right text-green-600">{item.cost.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right no-print">
                                <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
            </div>
            <div className="lg:col-span-1 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Weight</span>
                        <span className="font-bold">{totalWeight.toFixed(2)} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-bold text-green-600">${totalCost.toFixed(2)}</span>
                    </div>
                    <hr/>
                    <h4 className="text-sm font-medium">Weight by Type</h4>
                    {Object.keys(weightByType).length > 0 ? Object.entries(weightByType).map(([type, weight]) => (
                        <div key={type} className="flex items-center justify-between">
                            <span className="text-muted-foreground capitalize">{type}</span>
                            <span className="font-medium">{weight.toFixed(2)} kg</span>
                        </div>
                    )) : (
                        <p className="text-xs text-muted-foreground">No items to summarize.</p>
                    )}
                </CardContent>
                <CardFooter className="no-print">
                    <Button className="w-full" onClick={() => onPrint(project)} disabled={!project}>
                        <Download />
                        Generate Report
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}
