
"use client";

import React, { useState, useRef } from 'react';
import { Plus, Download, Trash2, Edit } from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project, Organization, SteelItem, SteelPlate, SteelPipe, SteelGirder, SteelCircular } from '@/types';
import AddItemDialog from './add-item-dialog';
import EditProjectDialog from './edit-project-dialog';
import DeleteItemDialog from './delete-item-dialog';
import { addItemToProject as addItemToProjectDb, deleteItemFromProject as deleteItemFromProjectDb, updateProject as updateProjectDb } from '@/services/firestore';
import { useToast } from "@/hooks/use-toast";
import ProjectSummaryChart from './project-summary-chart';
import { CHART_COLORS } from '@/lib/constants';
import ProjectReport from './project-report';
import { cn } from '@/lib/utils';

interface ProjectViewProps {
    project: Project;
    organization: Organization | null;
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

const ItemCard = ({ item, onDelete }: { item: SteelItem, onDelete: () => void }) => (
    <Card>
        <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant="secondary" className="capitalize mt-1">{item.type}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">{renderItemDimensions(item)}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Qty</p>
                    <p>{item.quantity}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Unit Wt (kg)</p>
                    <p>{item.weight.toFixed(2)}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground">Total Wt (kg)</p>
                    <p className="font-semibold">{(item.weight * item.quantity).toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Total Cost</p>
                    <p className="font-semibold text-green-600">${(item.cost * item.quantity).toFixed(2)}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function ProjectView({ project, organization }: ProjectViewProps) {
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isEditProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SteelItem | null>(null);
  const { toast } = useToast();
  
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
      content: () => reportRef.current,
  });

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
      const fullItem = project.items.find(i => i.id === itemToDelete.id);
      if(!fullItem) throw new Error("Item not found in project");

      await deleteItemFromProjectDb(project.id, fullItem);
      toast({
        title: "Item Deleted",
        description: `${itemToDelete.name} has been removed from the project.`,
      });
      setItemToDelete(null); 
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
        <div style={{ display: "none" }}>
            {project && organization && (
                <ProjectReport ref={reportRef} project={project} organization={organization} />
            )}
        </div>
        <div className="grid gap-6 md:gap-8 flex-1">
            <div>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>
                        {project.projectId} - For {project.customer}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditProjectDialogOpen(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                    </CardHeader>
                </Card>

                {project.items.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-10 text-center bg-transparent border-dashed mt-4">
                        <CardTitle>No Items Yet</CardTitle>
                        <CardDescription className="mt-2">Add the first item to this project.</CardDescription>
                        <Button className="mt-4" onClick={() => setAddItemDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                            {project.items.map((item) => (
                                <ItemCard key={item.id} item={item} onDelete={() => setItemToDelete(item)} />
                            ))}
                        </div>
                         <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm py-4 -mx-4 -mb-4 mt-4 px-4 md:px-0">
                            <Button className="w-full" onClick={() => setAddItemDialogOpen(true)}>
                                <Plus />
                                Add Item
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <div>
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
                    <CardFooter>
                         <button
                            className={cn(buttonVariants(), "w-full")}
                            disabled={!project || !organization}
                            onClick={handlePrint}
                            title={!organization ? "Please set up an organization first" : ""}
                        >
                            <Download />
                            Generate Report
                        </button>
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
