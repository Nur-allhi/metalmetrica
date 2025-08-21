
"use client"

import React from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import type { Project, Organization, SteelItem, SteelPlate, SteelPipe, SteelGirder, SteelCircular } from '@/types';
import { getCurrencySymbol } from '@/lib/utils';

interface ProjectReportProps {
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
            return (
              <>
                <p>L:{girder.length} Flange:{girder.flangeWidth}x{girder.flangeThickness} Web:{girder.webHeight}x{girder.webThickness} mm</p>
                <p className="text-xs text-gray-700">Flange Wt: {girder.flangeWeight?.toFixed(2)} kg (Total: {(girder.flangeWeight! * girder.quantity).toFixed(2)} kg)</p>
                <p className="text-xs text-gray-700">Web Wt: {girder.webWeight?.toFixed(2)} kg (Total: {(girder.webWeight! * girder.quantity).toFixed(2)} kg)</p>
                <p className="text-xs text-gray-700">Flange Ft: {girder.flangeRunningFeet?.toFixed(2)} (Total: {(girder.flangeRunningFeet! * girder.quantity).toFixed(2)})</p>
                <p className="text-xs text-gray-700">Web Ft: {girder.webRunningFeet?.toFixed(2)} (Total: {(girder.webRunningFeet! * girder.quantity).toFixed(2)})</p>
              </>
            )
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


const ProjectReport = React.forwardRef<HTMLDivElement, ProjectReportProps>(({ project, organization }, ref) => {
    const totalWeight = project.items.reduce((acc, item) => acc + item.weight * item.quantity, 0);
    const hasCost = project.items.some(item => item.cost !== null);
    const totalCost = hasCost ? project.items.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0) : null;
    const currencySymbol = getCurrencySymbol(organization?.currency);
    
    const colSpanTotal = hasCost ? 5 : 4;


    return (
        <div ref={ref} className="bg-white px-8 py-8 font-sans text-lg text-black">
             <style type="text/css" media="print">
                {`
                    @page { size: auto;  margin: 0; }
                    body { margin: 0; }
                    .report-table-header, .report-table-footer, .report-table-row {
                        page-break-inside: avoid !important;
                    }
                    .report-section {
                        page-break-inside: avoid;
                    }
                `}
            </style>
            <header className="flex justify-between items-start mb-8 border-b pb-4 report-section">
                <div>
                     {organization?.name && <h1 className="text-4xl font-bold text-black">{organization.name}</h1>}
                     {organization?.address && <p className="text-sm text-gray-600 mt-1">{organization.address}</p>}
                     <div className='flex gap-4'>
                        {organization?.email && <p className="text-sm text-gray-600">{organization.email}</p>}
                        {organization?.contactNumber && <p className="text-sm text-gray-600">{organization.contactNumber}</p>}
                     </div>
                    <p className="text-xl text-gray-700 mt-2">Project Weight {hasCost && '& Cost'} Report</p>
                </div>
                {organization?.logoUrl && (
                    <Image src={organization.logoUrl} alt="Organization Logo" width={150} height={50} className="object-contain" data-ai-hint="company logo" />
                )}
            </header>

            <main>
                <div className="grid grid-cols-2 gap-8 mb-10 report-section">
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-black">Project Details</h2>
                        <p className="text-black"><span className="font-semibold">Project Name:</span> {project.name}</p>
                        <p className="text-black"><span className="font-semibold">Project ID:</span> {project.projectId}</p>
                        <p className="text-black"><span className="font-semibold">Client:</span> {project.customer}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2 text-black">Report Details</h2>
                        <p className="text-black"><span className="font-semibold">Report Date:</span> {new Date().toLocaleDateString()}</p>
                        <p className="text-black"><span className="font-semibold">Items:</span> {project.items.length}</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-black report-section">Itemized List</h2>
                <div className="border border-gray-300">
                    <Table className="border-collapse">
                        <TableHeader className="report-table-header">
                            <TableRow className="bg-gray-100">
                                <TableHead className="text-black border border-gray-300 p-2 font-bold text-center text-base">Item Type</TableHead>
                                <TableHead className="text-black border border-gray-300 p-2 font-bold text-base">Name & Dimensions</TableHead>
                                <TableHead className="text-black border border-gray-300 p-2 font-bold text-center text-base">Unit Weight (kg)</TableHead>
                                {hasCost && <TableHead className="text-black border border-gray-300 p-2 font-bold text-center text-base">Unit Cost ({currencySymbol})</TableHead>}
                                <TableHead className="text-black border border-gray-300 p-2 font-bold text-center text-base">Qty</TableHead>
                                <TableHead className="text-black border border-gray-300 p-2 font-bold text-center text-base">Total Weight (kg)</TableHead>
                                {hasCost && <TableHead className="text-black border border-gray-300 p-2 font-bold text-center text-base">Total Cost ({currencySymbol})</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {project.items.map(item => (
                                <TableRow key={item.id} className="report-table-row [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 text-black text-base">
                                    <TableCell className="font-medium text-center">{getItemTypeLabel(item.type)}</TableCell>
                                    <TableCell>
                                       <span className='capitalize font-semibold'>{item.name}</span> - {renderItemDimensions(item)}
                                    </TableCell>
                                    <TableCell className="text-center">{item.weight.toFixed(2)}</TableCell>
                                    {hasCost && <TableCell className="text-center">{item.cost !== null ? <><span className='font-bold'>{currencySymbol}</span>{item.cost.toFixed(2)}</> : 'N/A'}</TableCell>}
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-center font-medium">{ (item.weight * item.quantity).toFixed(2) }</TableCell>
                                    {hasCost && <TableCell className="text-center font-medium">{item.cost !== null ? <><span className='font-bold'>{currencySymbol}</span>{(item.cost * item.quantity).toFixed(2)}</> : 'N/A'}</TableCell>}
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter className="report-table-footer">
                            <TableRow className="[&>td]:border [&>td]:border-gray-300 [&>td]:p-2 bg-gray-100">
                                <TableCell colSpan={colSpanTotal} className="text-right font-bold text-xl pr-4 text-black">Project Totals</TableCell>
                                <TableCell className="text-center font-bold text-xl text-black">{totalWeight.toFixed(2)} kg</TableCell>
                                {hasCost && <TableCell className="text-center font-bold text-xl text-black"><span className="font-bold">{currencySymbol}</span>{totalCost?.toFixed(2)}</TableCell>}
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </main>

             {organization?.termsAndConditions && (
                <section className="mt-10 pt-4 border-t border-gray-300 report-section">
                    <h2 className="text-lg font-bold text-black mb-2">Terms & Conditions</h2>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{organization.termsAndConditions}</p>
                </section>
            )}

            <footer className="mt-16 text-center text-sm text-gray-700 report-section">
                <p>Report generated by MetalMetrica on {new Date().toLocaleString()}</p>
                 {organization?.name && <p>{organization.name}</p>}
            </footer>
        </div>
    );
});
ProjectReport.displayName = 'ProjectReport';
export default ProjectReport;

    