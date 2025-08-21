"use client";

import React, { useState, useEffect } from "react";
import { Plus, Download, Workflow } from "lucide-react";
import useLocalStorage from "@/hooks/use-local-storage";
import { useAuth } from "@/components/auth-provider";
import { getProjects, addProject as addProjectToDb } from "@/services/firestore";
import type { Organization, Project } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import OrganizationSetupDialog from "@/components/organization-setup-dialog";
import CalculatorCard from "@/components/calculator-card";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectSidebar from "@/components/project-sidebar";
import ProjectView from "@/components/project-view";
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import AddProjectDialog from "@/components/add-project-dialog";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [organization, setOrganization] = useLocalStorage<Organization | null>(
    "metalmetrica-org",
    null
  );
  const [isOrgSetupOpen, setOrgSetupOpen] = useState(false);
  const [isAddProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !organization) {
      setOrgSetupOpen(true);
    }
  }, [organization, authLoading]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = getProjects(user.uid, (fetchedProjects) => {
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0 && !activeProject) {
          setActiveProject(fetchedProjects[0]);
        } else if (fetchedProjects.length === 0) {
          setActiveProject(null);
        } else if (activeProject) {
            // Refresh active project data
            const refreshedProject = fetchedProjects.find(p => p.id === activeProject.id) || null;
            setActiveProject(refreshedProject);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, activeProject?.id]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleAddProject = async (data: { name: string; customer: string; }) => {
    if (!user) return;
    
    try {
        const newProject: Omit<Project, 'id' | 'createdAt' | 'userId'> = {
            name: data.name,
            customer: data.customer,
            projectId: `P-${Date.now()}`,
            items: [],
        };
        await addProjectToDb(user.uid, newProject);
        toast({
            title: "Project Created",
            description: `${data.name} has been successfully created.`,
        });
        setAddProjectDialogOpen(false);
    } catch(error) {
        console.error("Error creating project:", error);
        toast({
            title: "Error",
            description: "Failed to create project.",
            variant: "destructive",
        });
    }
  };


  const renderProjectContent = () => {
    if (loading || authLoading) {
        return (
            <div className="p-4">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                    <CardContent><Skeleton className="h-40 w-full" /></CardContent>
                </Card>
            </div>
        )
    }

    if (!activeProject) {
      return (
        <div className="flex-1 flex items-center justify-center h-full">
            <Card className="flex flex-col items-center justify-center p-10 text-center bg-transparent border-dashed">
                <Workflow size={48} className="text-muted-foreground mb-4" />
                <CardTitle>No Project Selected</CardTitle>
                <CardDescription className="mt-2">Select a project or create a new one.</CardDescription>
                <Button className="mt-4" onClick={() => setAddProjectDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Project
                </Button>
            </Card>
        </div>
      )
    }

    return (
      <ProjectView 
        project={activeProject}
        onPrint={handlePrint}
        organization={organization}
      />
    )
  }

  return (
    <>
      <SidebarProvider>
          <div className="flex min-h-screen w-full flex-col bg-muted/40">
              <Sidebar>
                  <ProjectSidebar 
                      projects={projects}
                      activeProject={activeProject}
                      onProjectSelect={setActiveProject}
                      onAddProject={() => setAddProjectDialogOpen(true)}
                      loading={loading}
                  />
              </Sidebar>
              <SidebarInset>
                  <Header organization={organization} onSettingsClick={() => setOrgSetupOpen(true)} />
                  <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 no-print">
                      <Tabs defaultValue="projects" className="flex flex-col h-full">
                      <div className="flex items-center no-print">
                          <TabsList>
                          <TabsTrigger value="single">Single Calc</TabsTrigger>
                          <TabsTrigger value="projects">Projects</TabsTrigger>
                          </TabsList>
                           <div className="ml-auto flex items-center gap-2">
                              <SidebarTrigger className="md:hidden" />
                          </div>
                      </div>
                      <TabsContent value="single" className="mt-4">
                          <CalculatorCard />
                      </TabsContent>
                      <TabsContent value="projects" className="flex-1 mt-4">
                         {renderProjectContent()}
                      </TabsContent>
                      </Tabs>
                  </main>
              </SidebarInset>
          </div>
      </SidebarProvider>

      <OrganizationSetupDialog
        open={isOrgSetupOpen}
        onOpenChange={setOrgSetupOpen}
        onSave={(org) => {
            setOrganization(org);
            setOrgSetupOpen(false);
        }}
        organization={organization}
      />
      <AddProjectDialog
        open={isAddProjectDialogOpen}
        onOpenChange={setAddProjectDialogOpen}
        onAddProject={handleAddProject}
       />
    </>
  );
}
