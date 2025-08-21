
"use client"

import React from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import type { Project, Organization, SteelItem, SteelPlate, SteelPipe, SteelGirder, SteelCircular } from '@/types';

interface ProjectReportProps {
    project: Project;
    organization: Organization;
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


const ProjectReport = React.forwardRef<HTMLDivElement, ProjectReportProps>(({ project, organization }, ref) => {
    const totalWeight = project.items.reduce((acc, item) => acc + item.weight * item.quantity, 0);
    const totalCost = project.items.reduce((acc, item) => acc + (item.cost || 0) * item.quantity, 0);

    return (
        <div ref={ref} className="bg-white p-8 font-sans text-sm text-gray-800">
            <header className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{organization.name}</h1>
                    <p className="text-gray-500">Project Weight & Cost Report</p>
                </div>
                {organization.logoUrl && (
                    <Image src={organization.logoUrl} alt="Organization Logo" width={150} height={50} className="object-contain" data-ai-hint="company logo" />
                )}
            </header>

            <main>
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h2 className="text-lg font-bold mb-2">Project Details</h2>
                        <p><span className="font-semibold">Project Name:</span> {project.name}</p>
                        <p><span className="font-semibold">Project ID:</span> {project.projectId}</p>
                        <p><span className="font-semibold">Client:</span> {project.customer}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-2">Report Details</h2>
                        <p><span className="font-semibold">Report Date:</span> {new Date().toLocaleDateString()}</p>
                        <p><span className="font-semibold">Items:</span> {project.items.length}</p>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4">Itemized List</h2>
                <div className="border border-gray-300">
                    <Table className="border-collapse">
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="text-gray-600 border border-gray-300 p-2 font-bold text-center">Item Name</TableHead>
                                <TableHead className="text-gray-600 border border-gray-300 p-2 font-bold text-center">Dimensions / Profile</TableHead>
                                <TableHead className="text-gray-600 border border-gray-300 p-2 font-bold text-center">Unit Weight (kg)</TableHead>
                                <TableHead className="text-gray-600 border border-gray-300 p-2 font-bold text-center">Qty</TableHead>
                                <TableHead className="text-gray-600 border border-gray-300 p-2 font-bold text-center">Unit Cost ($)</TableHead>
                                <TableHead className="text-gray-600 border border-gray-300 p-2 font-bold text-center">Total Cost ($)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {project.items.map(item => (
                                <TableRow key={item.id} className="[&_td]:border [&_td]:border-gray-300 [&_td]:p-2">
                                    <TableCell className="font-medium text-center">{item.name}</TableCell>
                                    <TableCell>
                                        <span className="capitalize">{item.type}</span> - {renderItemDimensions(item)}
                                    </TableCell>
                                    <TableCell className="text-center">{item.weight.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-center">{(item.cost || 0).toFixed(2)}</TableCell>
                                    <TableCell className="text-center font-medium">{((item.cost || 0) * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                        <TableRow className="[&_td]:border [&_td]:border-gray-300 [&_td]:p-2 bg-gray-100">
                            <TableCell colSpan={4} className="text-right font-bold text-lg">Project Totals</TableCell>
                            <TableCell className="text-right font-bold text-lg">{totalWeight.toFixed(2)} kg</TableCell>
                            <TableCell className="text-right font-bold text-lg">${totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </main>

            <footer className="mt-16 text-center text-xs text-gray-400">
                <p>Report generated by MetalMetrica on {new Date().toLocaleString()}</p>
                <p>{organization.name}</p>
            </footer>
        </div>
    );
});
ProjectReport.displayName = 'ProjectReport';
export default ProjectReport;
