
"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Plus, Download, Trash2, Edit } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

const ItemCard = ({ item, onDelete }: { item: SteelItem, onDelete: () => void }) => {
    const girder = item as SteelGirder;
    const hasCost = item.cost !== null;

    return (
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

                {item.type === 'girder' && (
                  <div className="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                    <p>Flange Wt:</p><p className="text-right font-medium">{(girder.flangeWeight)?.toFixed(2)} kg (Total: {(girder.flangeWeight! * item.quantity).toFixed(2)} kg)</p>
                    <p>Web Wt:</p><p className="text-right font-medium">{(girder.webWeight)?.toFixed(2)} kg (Total: {(girder.webWeight! * item.quantity).toFixed(2)} kg)</p>
                    <p>Flange Running Ft:</p><p className="text-right font-medium">{(girder.flangeRunningFeet)?.toFixed(2)} (Total: {(girder.flangeRunningFeet! * item.quantity).toFixed(2)})</p>
                    <p>Web Running Ft:</p><p className="text-right font-medium">{(girder.webRunningFeet)?.toFixed(2)} (Total: {(girder.webRunningFeet! * item.quantity).toFixed(2)})</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
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
                    {hasCost && (
                         <div>
                            <p className="text-muted-foreground">Total Cost</p>
                            <p className="font-semibold text-green-600">${((item.cost || 0) * item.quantity).toFixed(2)}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
};

export default function ProjectView({ project, organization }: ProjectViewProps) {
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isEditProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SteelItem | null>(null);
  const { toast } = useToast();
  
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGeneratePdf = () => {
    const input = reportRef.current;
    if (!input) {
      toast({
        title: "Error",
        description: "Could not generate report.",
        variant: "destructive",
      });
      return;
    }

    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let width = pdfWidth;
        let height = width / ratio;

        if (height > pdfHeight) {
            height = pdfHeight;
            width = height * ratio;
        }

        const marginX = (pdfWidth - width) / 2;
        const marginY = (pdfHeight - height) / 2;
        
        pdf.addImage(imgData, 'JPEG', marginX, marginY, width, height, undefined, 'MEDIUM');
        
        pdf.save(`${project.name}-report.pdf`);
      })
      .catch(err => {
        console.error("Error generating PDF:", err);
        toast({
            title: "Error",
            description: "Failed to generate PDF report.",
            variant: "destructive",
        });
      });
  };

  const totalWeight = useMemo(() => project.items.reduce((acc, item) => acc + item.weight * item.quantity, 0) || 0, [project.items]);
  const hasCost = useMemo(() => project.items.some(item => item.cost !== null), [project.items]);
  const totalCost = useMemo(() => hasCost ? project.items.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0) : null, [project.items, hasCost]);


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
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '210mm' }}>
        {project && (
          <ProjectReport ref={reportRef} project={project} organization={organization} />
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
        <div className="lg:col-span-2 xl:col-span-3">
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
                  <span className="sr-only">Edit Project</span>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {project.items.length === 0 ? (
            <Card className="mt-4 flex flex-col items-center justify-center border-dashed p-10 text-center">
              <CardTitle>No Items Yet</CardTitle>
              <CardDescription className="mt-2">Add the first item to this project.</CardDescription>
              <Button className="mt-4" onClick={() => setAddItemDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </Card>
          ) : (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {project.items.map((item) => (
                  <ItemCard key={item.id} item={item} onDelete={() => setItemToDelete(item)} />
                ))}
              </div>
              <div className="sticky bottom-0 mt-4 bg-background/95 py-4 backdrop-blur-sm">
                <Button className="w-full" onClick={() => setAddItemDialogOpen(true)}>
                  <Plus />
                  Add Item
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="lg:col-span-1 xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Weight</span>
                <span className="font-bold">{totalWeight.toFixed(2)} kg</span>
              </div>
              {hasCost && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-bold text-green-600">${totalCost?.toFixed(2)}</span>
                </div>
              )}
              <hr />
              <h4 className="mb-2 text-center text-sm font-medium">Weight by Type</h4>
              <ProjectSummaryChart data={chartData} />
            </CardContent>
            <CardFooter>
              <Button
                  className="w-full"
                  disabled={!project || !organization}
                  onClick={handleGeneratePdf}
                  title={!organization ? "Please set up an organization first" : ""}
              >
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

    