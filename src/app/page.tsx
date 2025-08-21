"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, Trash2, Edit } from "lucide-react";
import useLocalStorage from "@/hooks/use-local-storage";
import { useAuth } from "@/components/auth-provider";
import { getProjects } from "@/services/firestore";
import type { Organization, Project } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import OrganizationSetupDialog from "@/components/organization-setup-dialog";
import CalculatorCard from "@/components/calculator-card";
import ProjectReport from "@/components/project-report";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useLocalStorage<Organization | null>(
    "metalmetrica-org",
    null
  );
  const [isOrgSetupOpen, setOrgSetupOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<Project | null>(null);

  useEffect(() => {
    if (!organization) {
      setOrgSetupOpen(true);
    }
  }, [organization]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = getProjects(user.uid, (fetchedProjects) => {
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0 && !activeProject) {
          setActiveProject(fetchedProjects[0]);
        } else if (fetchedProjects.length === 0) {
            setActiveProject(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, activeProject]);

  const handlePrint = () => {
    if (activeProject) {
      setReportData(activeProject);
      setTimeout(() => {
        window.print();
        setReportData(null);
      }, 100);
    }
  };

  const totalWeight = activeProject?.items.reduce((acc, item) => acc + item.weight * item.quantity, 0) || 0;
  const totalCost = activeProject?.items.reduce((acc, item) => acc + item.cost * item.quantity, 0) || 0;

  const weightByType = activeProject?.items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = 0;
    }
    acc[item.type] += item.weight * item.quantity;
    return acc;
  }, {} as Record<string, number>) || {};

  const renderProjectContent = () => {
    if (loading || authLoading) {
        return <Card><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>;
    }

    if (!activeProject) {
      return (
        <Card className="lg:col-span-3 flex flex-col items-center justify-center py-20">
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription className="mt-2">Get started by creating a new project.</CardDescription>
            <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
            </Button>
        </Card>
      )
    }

    return (
      <>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{activeProject.name}</CardTitle>
                    <CardDescription>
                    {activeProject.projectId} - For {activeProject.customer}
                    </CardDescription>
                </div>
                <div className="flex gap-2 no-print">
                    <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                    </Button>
                    <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
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
                    {activeProject.items.map((item) => (
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
                    ))}
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
                    {Object.entries(weightByType).map(([type, weight]) => (
                        <div key={type} className="flex items-center justify-between">
                        <span className="text-muted-foreground capitalize">{type}</span>
                        <span className="font-medium">{weight.toFixed(2)} kg</span>
                    </div>
                    ))}
                </CardContent>
                <CardFooter className="no-print">
                    <Button className="w-full" onClick={handlePrint} disabled={!activeProject}>
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={reportData ? "" : "print-container"}>
        <div className="hidden">
           {reportData && organization && <ProjectReport project={reportData} organization={organization} />}
        </div>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <Header organization={organization} onSettingsClick={() => setOrgSetupOpen(true)} />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Tabs defaultValue="projects">
              <div className="flex items-center no-print">
                <TabsList>
                  <TabsTrigger value="single">Single Calculation</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="single">
                <CalculatorCard />
              </TabsContent>
              <TabsContent value="projects">
                <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
                  {renderProjectContent()}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <OrganizationSetupDialog
        open={isOrgSetupOpen}
        onOpenChange={setOrgSetupOpen}
        onSave={setOrganization}
      />
    </>
  );
}
