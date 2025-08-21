
"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Download, Trash2, Edit, FilePlus2, Receipt } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project, Organization, SteelItem, SteelPlate, SteelPipe, SteelGirder, SteelCircular, AdditionalCost } from '@/types';
import AddItemDialog from './add-item-dialog';
import EditProjectDialog from './edit-project-dialog';
import DeleteItemDialog from './delete-item-dialog';
import EditItemDialog from './edit-item-dialog';
import AdditionalCostsDialog from './additional-costs-dialog';
import { addItemToProject, deleteItemFromProject, updateItemInProject, updateProject } from '@/services/firestore';
import { useToast } from "@/hooks/use-toast";
import ProjectSummaryChart from './project-summary-chart';
import { CHART_COLORS } from '@/lib/constants';
import { getCurrencySymbol } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from './auth-provider';

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
            return `L:${girder.length} | Flange:${girder.flangeWidth}x${girder.flangeThickness} | Web:${girder.webHeight}x${girder.webThickness} mm`;
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

const getItemTypeLabel = (type: SteelItem['type']) => {
    switch (type) {
        case 'plate':
            return 'Steel Plate (Quality)';
        case 'plate-imperial':
            return 'Steel Plate (Non-Quality)';
        case 'pipe':
            return 'Steel Pipe';
        case 'girder':
            return 'Steel Girder';
        case 'circular':
            return 'Circular Section';
        default:
            const itemType = type as string;
            return itemType.charAt(0).toUpperCase() + itemType.slice(1);
    }
}


const ItemCard = ({ item, onDelete, onEdit, organization }: { item: SteelItem, onDelete: () => void, onEdit: () => void, organization: Organization | null }) => {
    const girder = item as SteelGirder;
    const hasCost = item.cost !== null;
    
    const currencyCode = organization?.currency || "USD";
    const currencySymbol = getCurrencySymbol(currencyCode);
    const pricePerKg = hasCost && item.weight > 0 ? (item.cost || 0) / item.weight : null;


    const numberFormat = (value: number) => {
        return value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    }

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
            <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="secondary" className="mt-1">{getItemTypeLabel(item.type)}</Badge>
                    </div>
                    <div className="flex">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground break-words">{renderItemDimensions(item)}</div>

                 {item.type === 'girder' && girder.flangeWeight && girder.webWeight && (
                  <div className="border rounded-lg p-2 text-xs text-muted-foreground space-y-2 bg-background/50 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex justify-between items-center">
                          <p className='font-medium'>Flange Wt:</p>
                          <p className='font-semibold text-foreground text-right'>{numberFormat(girder.flangeWeight!)} kg/p | T: {numberFormat(girder.flangeWeight! * item.quantity)} kg</p>
                      </div>
                      <div className="flex justify-between items-center">
                          <p className='font-medium'>Web Wt:</p>
                           <p className='font-semibold text-foreground text-right'>{numberFormat(girder.webWeight!)} kg/p | T: {numberFormat(girder.webWeight! * item.quantity)} kg</p>
                      </div>
                      <div className="flex justify-between items-center">
                          <p className='font-medium'>Flange (ft):</p>
                          <p className='font-semibold text-foreground text-right'>{numberFormat(girder.flangeRunningFeet!)} ft/p | T: {numberFormat(girder.flangeRunningFeet! * item.quantity)} ft</p>
                      </div>
                      <div className="flex justify-between items-center">
                          <p className='font-medium'>Web (ft):</p>
                          <p className='font-semibold text-foreground text-right'>{numberFormat(girder.webRunningFeet!)} ft/p | T: {numberFormat(girder.webRunningFeet! * item.quantity)} ft</p>
                      </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                        <p className="text-muted-foreground text-xs">Qty</p>
                        <p className="font-medium text-sm">{item.quantity}</p>
                    </div>
                     {hasCost && (
                         <div>
                            <p className="text-muted-foreground text-xs">Price ({currencySymbol}/kg)</p>
                            <p className="font-medium text-sm">{pricePerKg !== null ? `${currencySymbol}${numberFormat(pricePerKg)}` : 'N/A'}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-muted-foreground text-xs">Unit Wt (kg)</p>
                        <p className="font-medium text-sm">{numberFormat(item.weight)}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground text-xs">Unit Cost</p>
                        <p className="font-medium text-sm">{hasCost ? `${currencySymbol}${numberFormat(item.cost!)}` : 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground text-xs">Total Wt (kg)</p>
                        <p className="font-semibold text-sm">{numberFormat(item.weight * item.quantity)}</p>
                    </div>
                    {hasCost && (
                         <div>
                            <p className="text-muted-foreground text-xs">Total Cost</p>
                            <p className="font-semibold text-green-600 text-sm">{currencySymbol} {numberFormat((item.cost || 0) * item.quantity)}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
};

export default function ProjectView({ project, organization }: ProjectViewProps) {
  const { user } = useAuth();
  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isEditProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [isCostsDialogOpen, setCostsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SteelItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<SteelItem | null>(null);
  const { toast } = useToast();
  
  const handleGeneratePdf = () => {
    if (!user) return;
    const additionalCosts = project.additionalCosts || [];
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    const currencyCode = organization?.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currencyCode, true);
    
    const numberFormat = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    
    // Margins
    const pageMargin = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = pageMargin;

    // Logo
    if (organization?.logoUrl) {
        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = organization.logoUrl;
            img.onload = () => {
                 doc.addImage(img, 'PNG', pageWidth - pageMargin - 30, pageMargin, 30, 15);
                 generateHeaderAndContent();
                 finalizePdf();
            }
            img.onerror = () => {
                console.error("Could not load image for PDF");
                generateHeaderAndContent();
                finalizePdf();
            }
        } catch (e) {
            console.error("Error with image for PDF:", e);
            generateHeaderAndContent();
            finalizePdf();
        }
    } else {
        generateHeaderAndContent();
        finalizePdf();
    }


    function generateHeaderAndContent() {
        // Header
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(organization?.name || "MetalMetrica", pageMargin, currentY);
        currentY += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        if(organization?.address) {
            doc.text(organization.address, pageMargin, currentY);
            currentY += 5;
        }
        
        let contactLine = '';
        if(organization?.email) {
            contactLine += `Email: ${organization.email}`;
        }
        if(organization?.contactNumber) {
            if (contactLine) contactLine += ` | `;
            contactLine += `Contact: ${organization.contactNumber}`;
        }
        if(contactLine) {
            doc.text(contactLine, pageMargin, currentY);
            currentY += 5;
        }

        doc.setLineWidth(0.5);
        doc.line(pageMargin, currentY, pageWidth - pageMargin, currentY);
        currentY += 10;
        
        // Project Details
        doc.setFontSize(10);
        doc.text(`Project Name: ${project.name}`, pageMargin, currentY);
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY);
        currentY += 5;
        doc.text(`Client: ${project.customer}`, pageMargin, currentY);
        doc.text(`Project ID: ${project.projectId}`, pageWidth / 2, currentY);
        currentY += 10;

        // Table
        const hasCost = project.items.some(item => item.cost !== null);
        
        const head = [[
            'S.No.',
            'Name & Dimensions',
            'Unit Wt (kg)',
            ...(hasCost ? [`Unit Cost (${currencySymbol})`] : []),
            'Qty',
            'Total Wt (kg)',
            ...(hasCost ? [`Total Cost (${currencySymbol})`] : [])
        ]];
        
        const body = project.items.map((item, index) => {
            const totalWeight = item.weight * item.quantity;
            const totalCost = item.cost !== null ? item.cost * item.quantity : null;
            
            let nameAndDims;
            const nameAndType = `${item.name}`;
            const itemDims = renderItemDimensions(item);

            if (item.type === 'girder') {
                const girder = item as SteelGirder;
                const weights = `Flange Wt: ${numberFormat(girder.flangeWeight!)} kg | Web Wt: ${numberFormat(girder.webWeight!)} kg`;
                const feets = `Flange Ft: ${numberFormat(girder.flangeRunningFeet!)} ft | Web Ft: ${numberFormat(girder.webRunningFeet!)} ft`;
                nameAndDims = `${nameAndType}\n${itemDims}\n${weights}\n${feets}`;
            } else {
                 nameAndDims = `${nameAndType}\n${itemDims}`;
            }

            const rowData: (string|number)[] = [
                (index + 1).toString(),
                nameAndDims,
                numberFormat(item.weight),
            ];
            
            if (hasCost) {
                rowData.push(item.cost !== null ? numberFormat(item.cost) : 'N/A');
            }

            rowData.push(
                item.quantity,
                numberFormat(totalWeight),
            );
            
            if (hasCost) {
                rowData.push(totalCost !== null ? numberFormat(totalCost) : 'N/A');
            }
            return rowData;
        });

        const totalWeight = project.items.reduce((acc, item) => acc + item.weight * item.quantity, 0);
        const subTotalCost = hasCost ? project.items.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0) : null;
        
        const footerRows = [];
        const rightAlignBold = { halign: 'right', fontStyle: 'bold' };
        const rightAlign = { halign: 'right' };

        if (hasCost && subTotalCost !== null) {
            const subTotalRow = [
                { content: 'Sub-Total', colSpan: 5, styles: rightAlignBold },
                { content: `${numberFormat(totalWeight)}\nkg`, styles: rightAlignBold },
                { content: `${numberFormat(subTotalCost)}\n${currencySymbol}`, styles: rightAlignBold },
            ];
            footerRows.push(subTotalRow);
        } else {
             const subTotalRow = [
                { content: 'Sub-Total', colSpan: 5, styles: rightAlignBold },
                { content: `${numberFormat(totalWeight)}\nkg`, styles: rightAlignBold },
                ...(hasCost ? [{ content: '', styles: rightAlignBold }] : [])
            ];
             footerRows.push(subTotalRow);
        }
        
        let grandTotal = subTotalCost;
        if (hasCost && grandTotal !== null) {
            additionalCosts.forEach(cost => {
                const additionalCostRow = [
                   { content: cost.description, colSpan: 6, styles: rightAlign },
                   { content: `${numberFormat(cost.amount)}\n${currencySymbol}`, styles: rightAlign }
                ];
                footerRows.push(additionalCostRow);
            });
            
            const additionalCostTotal = additionalCosts.reduce((acc, cost) => acc + cost.amount, 0);
            grandTotal += additionalCostTotal;

            if(additionalCosts.length > 0) {
                 const grandTotalRow = [
                    { content: 'Grand Total', colSpan: 6, styles: rightAlignBold },
                    { content: `${numberFormat(grandTotal)}\n${currencySymbol}`, styles: rightAlignBold },
                 ]
                 footerRows.push(grandTotalRow);
            }
        }


        (doc as any).autoTable({
            startY: currentY,
            head: head,
            body: body,
            foot: footerRows,
            theme: 'grid',
            margin: { horizontal: pageMargin },
            tableWidth: 'auto',
            styles: {
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak',
                font: 'helvetica',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
            },
            bodyStyles: {
                textColor: [0, 0, 0],
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 10,
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
            },
            footStyles: {
                fillColor: [255, 255, 255],
                textColor: 0,
                fontSize: 10,
                lineWidth: 0.1,
                lineColor: [0, 0, 0]
            },
            columnStyles: {
              0: { halign: 'center', cellWidth: '6%' },    // S.No
              1: { cellWidth: 'auto' },  // Name & Dims
              2: { halign: 'right', cellWidth: '12%' },  // Unit Wt
              3: { halign: 'right', cellWidth: '13%' },  // Unit Cost
              4: { halign: 'center', cellWidth: '8%' },   // Qty
              5: { halign: 'right', cellWidth: '14%' },  // Total Wt
              6: { halign: 'right', cellWidth: '14%' },  // Total Cost
            },
            didDrawPage: (data: any) => {
                currentY = data.cursor.y;
            }
        });
        
        let finalY = (doc as any).lastAutoTable.finalY;
        currentY = finalY;


        if (organization?.termsAndConditions) {
            const termsHeight = doc.getTextDimensions(organization.termsAndConditions, { maxWidth: pageWidth - pageMargin * 2 }).h;
            if (currentY + termsHeight + 20 > pageHeight) {
                doc.addPage();
                currentY = pageMargin;
            }
            currentY += 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Terms & Conditions", pageMargin, currentY);
            currentY += 5;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(organization.termsAndConditions, pageMargin, currentY, { maxWidth: pageWidth - pageMargin * 2 });
        }
    }


    function finalizePdf() {
        const pageCount = (doc as any).internal.getNumberOfPages();
        const now = new Date();
        const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        const footerText = `System generated by MetalMetrica on ${timestamp}`;

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(footerText, pageMargin, pageHeight - 10);
        }

        doc.save(`${project.name}-report.pdf`);
        toast({
            title: "Report Generated",
            description: "Your PDF report has been downloaded.",
        });
    }
  };


  const numberFormat = (value: number) => {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }

  const totalWeight = useMemo(() => project.items.reduce((acc, item) => acc + item.weight * item.quantity, 0) || 0, [project.items]);
  const hasCost = useMemo(() => project.items.some(item => item.cost !== null) || (project.additionalCosts && project.additionalCosts.length > 0), [project.items, project.additionalCosts]);
  
  const subTotalCost = useMemo(() => project.items.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0), [project.items]);
  const additionalCostsTotal = useMemo(() => (project.additionalCosts || []).reduce((acc, cost) => acc + cost.amount, 0), [project.additionalCosts]);
  const totalCost = useMemo(() => hasCost ? subTotalCost + additionalCostsTotal : null, [hasCost, subTotalCost, additionalCostsTotal]);

  const currencyCode = organization?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currencyCode);

  const summaryData = useMemo(() => {
    const summary = project.items.reduce((acc, item) => {
        let typeName = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        if (item.type === 'plate') typeName = 'Plate (Q)';
        if (item.type === 'plate-imperial') typeName = 'Plate (NQ)';

        if (!acc[typeName]) {
            acc[typeName] = { weight: 0, cost: 0, count: 0 };
        }
        acc[typeName].weight += item.weight * item.quantity;
        acc[typeName].cost += (item.cost || 0) * item.quantity;
        acc[typeName].count++;
        return acc;
    }, {} as Record<string, { weight: number, cost: number, count: number }>);

    return Object.entries(summary).map(([type, data], index) => {
        const avgPricePerKg = data.weight > 0 && hasCost ? data.cost / data.weight : null;
        return {
            type,
            weight: parseFloat(data.weight.toFixed(2)),
            avgPricePerKg: avgPricePerKg ? parseFloat(avgPricePerKg.toFixed(2)) : null,
            fill: CHART_COLORS[index % CHART_COLORS.length],
        };
    });
  }, [project.items, hasCost]);

  const handleAddItem = async (item: Omit<SteelItem, 'id'>) => {
    if (!user) return;
    try {
      await addItemToProject(user.uid, project.id, item);
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

  const handleEditItem = async (updatedItem: SteelItem) => {
    if (!itemToEdit || !user) return;
    try {
      await updateItemInProject(user.uid, project.id, itemToEdit, updatedItem);
      toast({
        title: "Item Updated",
        description: `${updatedItem.name} has been updated.`,
      });
      setItemToEdit(null);
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item.",
        variant: "destructive",
      });
    }
  }

  const handleEditProject = async (data: { name: string; customer: string; }) => {
    if (!user) return;
    try {
        await updateProject(user.uid, project.id, data);
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
    if (!itemToDelete || !user) return;
    try {
      const fullItem = project.items.find(i => i.id === itemToDelete.id);
      if(!fullItem) throw new Error("Item not found in project");

      await deleteItemFromProject(user.uid, project.id, fullItem);
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

  const handleSaveCosts = async (costs: AdditionalCost[]) => {
    if (!user) return;
    try {
        await updateProject(user.uid, project.id, { additionalCosts: costs });
        toast({
            title: "Costs Saved",
            description: "The additional costs have been saved to the project.",
        });
        setCostsDialogOpen(false);
    } catch (error) {
         console.error("Error saving costs:", error);
         toast({
            title: "Error",
            description: "Failed to save additional costs.",
            variant: "destructive",
        });
    }
  }

  return (
    <>
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 grid-cols-1 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 xl:col-span-2">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {project.items.map((item) => (
                          <ItemCard key={item.id} item={item} onEdit={() => setItemToEdit(item)} onDelete={() => setItemToDelete(item)} organization={organization} />
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
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="grid gap-2 text-sm">
                 <div className="flex justify-between gap-x-2 flex-col items-start sm:flex-row sm:items-baseline">
                    <span className="text-muted-foreground">Total Weight</span>
                    <span className="font-bold">{numberFormat(totalWeight)} kg</span>
                </div>
                {hasCost && totalCost !== null && (
                    <>
                     <div className="flex justify-between gap-x-2 flex-col items-start sm:flex-row sm:items-baseline">
                        <span className="text-muted-foreground">Item Sub-total</span>
                        <span className="font-medium text-green-600">{currencySymbol} {numberFormat(subTotalCost)}</span>
                      </div>
                      {(project.additionalCosts || []).map(cost => (
                        <div key={cost.id} className="flex justify-between gap-x-2 flex-col items-start sm:flex-row sm:items-baseline">
                            <span className="text-muted-foreground">{cost.description}</span>
                            <span className="font-medium text-green-600">{currencySymbol} {numberFormat(cost.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold border-t pt-2 mt-1 gap-x-2 flex-col items-start sm:flex-row sm:items-baseline">
                        <span className="text-muted-foreground">Grand Total</span>
                        <span className="text-green-600">{currencySymbol} {numberFormat(totalCost)}</span>
                      </div>
                    </>
                )}
               </div>

              {summaryData.length > 0 && <hr />}

              <div className="grid gap-2">
                  {summaryData.map((item, index) => (
                      <div key={index} className="border p-2 rounded-md">
                          <div className="flex items-center justify-between text-sm flex-wrap gap-x-2">
                              <div className="flex items-center gap-2 min-w-0">
                                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                                  <span className="font-semibold">{item.type}</span>
                              </div>
                              <span className="font-medium">{numberFormat(item.weight)} kg</span>
                          </div>
                          {item.avgPricePerKg !== null && (
                              <div className="flex items-center justify-end text-xs text-muted-foreground mt-1 gap-x-2 flex-wrap">
                                  <span>{currencySymbol}{numberFormat(item.avgPricePerKg)}/kg</span>
                              </div>
                          )}
                      </div>
                  ))}
              </div>

              {summaryData.length > 0 && <hr />}
              
              <ProjectSummaryChart data={summaryData} />
            </CardContent>
            <CardFooter className="flex-col gap-2">
               <Button
                  className="w-full"
                  disabled={!project || !organization || !hasCost}
                  onClick={() => setCostsDialogOpen(true)}
                  title={!organization ? "Please set up an organization first" : !hasCost ? "Add item costs to manage additional costs" : ""}
              >
                  <Receipt />
                  Manage Additional Costs
              </Button>
              <Button
                  className="w-full"
                  disabled={!project || !organization}
                  onClick={() => handleGeneratePdf()}
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
       <EditItemDialog
          open={!!itemToEdit}
          onOpenChange={(open) => !open && setItemToEdit(null)}
          onEditItem={handleEditItem}
          item={itemToEdit}
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
      <AdditionalCostsDialog
        open={isCostsDialogOpen}
        onOpenChange={setCostsDialogOpen}
        onConfirm={handleSaveCosts}
        currencyCode={organization?.currency || 'USD'}
        existingCosts={project.additionalCosts}
       />
    </>
  )
}

    