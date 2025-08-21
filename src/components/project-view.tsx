"use client";

import React, { useState } from 'react';
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
import type { Project, Organization, SteelItem, SteelPlate, SteelPipe, SteelGirder, SteelCircular } from '@/types';
import AddItemDialog from './add-item-dialog';
import EditProjectDialog from './edit-project-dialog';
import DeleteItemDialog from './delete-item-dialog';
import { addItemToProject as addItemToProjectDb, deleteItemFromProject as deleteItemFromProjectDb, updateProject as updateProjectDb } from '@/services/firestore';
import { useToast } from "@/hooks/use-toast";
import ProjectSummaryChart from './project-summary-chart';
import { CHART_COLORS } from '@/lib/constants';

interface ProjectViewProps {
    project: Project;
    organization: Organization | null;
    onPrint: (project: Project) => void;
}

const renderItemDimensions = (item: SteelItem) => {
    switch (item.type) {
        case 'plate':
            const plate = item as SteelPlate;
            return `L:${plate.length} x W:${plate.width} x T:${plate.thickness} mm`;
        case 'pipe':
            const pipe = item as SteelPipe;
            return `L:${pipe.length} Ø:${pipe.outerDiameter} Wall:${pipe.wallThickness} mm`;
        case 'girder':
             const girder = item as SteelGirder;
            return `L:${girder.length} Flange:${girder.flangeWidth}x${girder.flangeThickness} Web:${girder.webHeight}x${girder.webThickness} mm`;
        case 'circular':
            const circular = item as SteelCircular;
            if (circular.innerDiameter && circular.innerDiameter > 0) {
                 return `T:${circular.thickness} Ø:${circular.diameter} Inner Ø:${circular.innerDiameter} mm`;
            }
            return `T:${circular.thickness} Ø:${circular.diameter} mm`;
        default:
            return '';
    }
};

export default function ProjectView({ project, organization, onPrint }: ProjectViewProps) {
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isEditProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SteelItem | null>(null);
  const { toast } = useToast();

  const totalWeight = project.items.reduce((acc, item) => acc + item.weight * item.quantity, 0) || 0;
  const totalCost = project.items.reduce((acc, item) => acc + item.cost * item.quantity, 0) || 0;

  const weightByType = project.items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = 0;
    }
    acc[item.type] += item.weight * item.quantity;
    return acc;
  }, {} as Record<string, number>) || {};

  const chartData = Object.entries(weightByType).map(([type, weight], index) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    weight: parseFloat(weight.toFixed(2)),
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const handleAddItem = async (item: Omit<SteelItem, 'id'>) => {
    try {
      await addItemToProjectDb(project.id, item);
      toast({
        title: "Item Added",
        description: `${item.name} has been added to the project.`,
      });
      setAddItemDialogOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item to the project.",
        variant: "destructive",
      });
    }
  };

  const handleEditProject = async (data: { name: string; customer: string; }) => {
    try {
        await updateProjectDb(project.id, data);
        toast({
            title: "Project Updated",
            description: "The project details have been successfully updated.",
        });
        setEditProjectDialogOpen(false);
    } catch (error) {
        console.error("Error updating project:", error);
        toast({
            title: "Error",
            description: "Failed to update project details.",
            variant: "destructive",
        });
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      // We need to find the full item object from the project state to pass to firestore
      const fullItem = project.items.find(i => i.id === itemToDelete.id);
      if(!fullItem) throw new Error("Item not found in project");

      await deleteItemFromProjectDb(project.id, fullItem);
      toast({
        title: "Item Deleted",
        description: `${itemToDelete.name} has been removed from the project.`,
      });
      setItemToDelete(null); // Close the dialog
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item from the project.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
                    <Button size="sm" variant="outline" onClick={() => setEditProjectDialogOpen(true)}>
                    <Edit />
                    Edit Details
                    </Button>
                    <Button size="sm" onClick={() => setAddItemDialogOpen(true)}>
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
                        <TableHead>Dimensions</TableHead>
                        <TableHead className="text-right">Weight (kg)</TableHead>
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
                            <TableCell className="font-medium">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">{item.type}</div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                                {renderItemDimensions(item)}
                            </TableCell>
                            <TableCell className="text-right">{(item.weight * item.quantity).toFixed(2)}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right no-print">
                                <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item)}>
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
                    <h4 className="text-sm font-medium text-center mb-2">Weight by Type</h4>
                    <ProjectSummaryChart data={chartData} />
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
    <AddItemDialog
        open={isAddItemDialogOpen}
        onOpenChange={setAddItemDialogOpen}
        onAddItem={handleAddItem}
    />
     <EditProjectDialog
        open={isEditProjectDialogOpen}
        onOpenChange={setEditProjectDialogOpen}
        onEditProject={handleEditProject}
        project={project}
     />
     <DeleteItemDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        itemName={itemToDelete?.name || ''}
      />
    </>
  )
}
