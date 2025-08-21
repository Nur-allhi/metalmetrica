
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
import { cn, getCurrencySymbol } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface ProjectViewProps {
    project: Project;
    organization: Organization | null;
}

const renderItemDimensions = (item: SteelItem) => {
    switch (item.type) {
        case 'plate':
            const plate = item as SteelPlate;
            return `L:${plate.length} x W:${plate.width} x T:${plate.thickness} mm`;
        case 'plate-imperial':
            const plateImperial = item as SteelPlate;
            return `L:${plateImperial.length}in x W:${plateImperial.width}in x T:${plateImperial.thickness}mm`;
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

const ItemCard = ({ item, onDelete, currencySymbol }: { item: SteelItem, onDelete: () => void, currencySymbol: string }) => {
    const girder = item as SteelGirder;
    const hasCost = item.cost !== null;
    const pricePerKg = hasCost && item.weight > 0 ? item.cost! / item.weight : null;

    const getItemTypeLabel = (type: SteelItem['type']) => {
        switch (type) {
            case 'plate':
                return 'Steel Plate (Quality)';
            case 'plate-imperial':
                return 'Steel Plate (Non-Quality)';
            default:
                return type.charAt(0).toUpperCase() + type.slice(1);
        }
    }

    const numberFormat = (value: number) => {
        return value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    }

    return (
        <Card>
            <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge variant="secondary" className="mt-1">{getItemTypeLabel(item.type)}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2" onClick={onDelete}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">{renderItemDimensions(item)}</p>

                {item.type === 'girder' && (
                  <div className="border rounded-lg p-2 text-xs text-muted-foreground space-y-1 bg-background/50">
                      <div className="grid grid-cols-3 items-center">
                          <p className='font-medium col-span-1'>Flange Weight</p>
                          <p className='font-semibold text-foreground text-center col-span-1'>{numberFormat(girder.flangeWeight!)} kg/p</p>
                          <p className='font-semibold text-foreground text-right col-span-1'>T: {numberFormat(girder.flangeWeight! * item.quantity)} kg</p>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                          <p className='font-medium col-span-1'>Web Weight</p>
                           <p className='font-semibold text-foreground text-center col-span-1'>{numberFormat(girder.webWeight!)} kg/p</p>
                           <p className='font-semibold text-foreground text-right col-span-1'>T: {numberFormat(girder.webWeight! * item.quantity)} kg</p>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                          <p className='font-medium col-span-1'>Flange Length (ft)</p>
                          <p className='font-semibold text-foreground text-center col-span-1'>{numberFormat(girder.flangeRunningFeet!)} ft/p</p>
                          <p className='font-semibold text-foreground text-right col-span-1'>T: {numberFormat(girder.flangeRunningFeet! * item.quantity)} ft</p>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                          <p className='font-medium col-span-1'>Web Length (ft)</p>
                          <p className='font-semibold text-foreground text-center col-span-1'>{numberFormat(girder.webRunningFeet!)} ft/p</p>
                          <p className='font-semibold text-foreground text-right col-span-1'>T: {numberFormat(girder.webRunningFeet! * item.quantity)} ft</p>
                      </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                    <div>
                        <p className="text-muted-foreground">Qty</p>
                        <p>{item.quantity}</p>
                    </div>
                     {hasCost && (
                         <div>
                            <p className="text-muted-foreground">Price ({currencySymbol}/kg)</p>
                            <p>{pricePerKg !== null ? `${currencySymbol}${numberFormat(pricePerKg)}` : 'N/A'}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-muted-foreground">Unit Wt (kg)</p>
                        <p>{numberFormat(item.weight)}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Unit Cost</p>
                        <p>{hasCost ? `${currencySymbol}${numberFormat(item.cost!)}` : 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Total Wt (kg)</p>
                        <p className="font-semibold">{numberFormat(item.weight * item.quantity)}</p>
                    </div>
                    {hasCost && (
                         <div>
                            <p className="text-muted-foreground">Total Cost</p>
                            <p className="font-semibold text-green-600">{currencySymbol}{numberFormat((item.cost || 0) * item.quantity)}</p>
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
  const currencySymbol = getCurrencySymbol(organization?.currency);
  
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

    html2canvas(input, { scale: 3, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const pageHeight = canvasHeight / ratio;
        
        let heightLeft = pageHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pageHeight, undefined, 'FAST');
          heightLeft -= pdfHeight;
        }

        pdf.save(`${project.name}-report.pdf`);
         toast({
            title: "Report Generated",
            description: "Your PDF report has been downloaded.",
        });
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

  const numberFormat = (value: number) => {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }

  const totalWeight = useMemo(() => project.items.reduce((acc, item) => acc + item.weight * item.quantity, 0) || 0, [project.items]);
  const hasCost = useMemo(() => project.items.some(item => item.cost !== null), [project.items]);
  const totalCost = useMemo(() => hasCost ? project.items.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0) : null, [project.items, hasCost]);


  const weightByType = project.items.reduce((acc, item) => {
    let typeName = item.type.charAt(0).toUpperCase() + item.type.slice(1);
    if(item.type === 'plate') typeName = 'Plate (Q)';
    if(item.type === 'plate-imperial') typeName = 'Plate (NQ)';

    if (!acc[typeName]) {
      acc[typeName] = 0;
    }
    acc[typeName] += item.weight * item.quantity;
    return acc;
  }, {} as Record<string, number>) || {};

  const chartData = Object.entries(weightByType).map(([type, weight], index) => ({
    type: type,
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
      <div className="grid auto-rows-max items-start gap-4 lg:grid-cols-3 lg:gap-8 w-full h-full overflow-hidden">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 h-full overflow-hidden flex-col flex">
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
          
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {project.items.length === 0 ? (
                <Card className="flex-1 flex flex-col items-center justify-center border-dashed p-10 text-center">
                  <CardTitle>No Items Yet</CardTitle>
                  <CardDescription className="mt-2">Add the first item to this project.</CardDescription>
                  <Button className="mt-4" onClick={() => setAddItemDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                  </Button>
                </Card>
            ) : (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                  <ScrollArea className="flex-1 -mr-4 pr-4">
                      <div className="grid gap-4 md:grid-cols-2">
                          {project.items.map((item) => (
                          <ItemCard key={item.id} item={item} onDelete={() => setItemToDelete(item)} currencySymbol={currencySymbol} />
                          ))}
                      </div>
                  </ScrollArea>
                  <div className="flex-shrink-0 pt-4">
                      <Button className="w-full" onClick={() => setAddItemDialogOpen(true)}>
                      <Plus />
                      Add Item
                      </Button>
                  </div>
                </div>
            )}
          </div>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Weight</span>
                <span className="font-bold">{numberFormat(totalWeight)} kg</span>
              </div>
              {hasCost && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-bold text-green-600">{currencySymbol}{numberFormat(totalCost!)}</span>
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
