
"use client";

import React, { useState, useEffect } from "react";
import { Plus, LogIn } from "lucide-react";
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
import CalculatorCard from "@/components/calculator-card";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectSidebar from "@/components/project-sidebar";
import ProjectView from "@/components/project-view";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AddProjectDialog from "@/components/add-project-dialog";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/logo";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SaveProgressDialog from "@/components/save-progress-dialog";

const MobileHeader = () => {
    const { user, signInWithGoogle } = useAuth();
    const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);

    const getInitials = (name?: string | null) => {
        if (!name) return "";
        return name.split(' ').map(n => n[0]).join('');
    };

    const handleSignIn = () => {
        if (user && user.isAnonymous) {
            setSaveDialogOpen(true);
        } else if (!user) {
            signInWithGoogle();
        }
    };

    return (
        <>
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:hidden">
                <SidebarTrigger />
                <div className="ml-auto flex items-center gap-2">
                    {user && !user.isAnonymous ? (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={handleSignIn}>
                            <LogIn className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </header>
            <SaveProgressDialog
                open={isSaveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                onConfirm={() => {
                    setSaveDialogOpen(false);
                    signInWithGoogle();
                }}
            />
        </>
    );
};


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [organization, setOrganization] = useLocalStorage<Organization | null>(
    "metalmetrica-org",
    null
  );
  const [isAddProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only prompt for org setup if a user is logged in
    if (!authLoading && user && !organization) {
      router.push('/settings');
    }
  }, [organization, authLoading, user, router]);

  // Fetch projects and manage active project
  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = getProjects(user.uid, (fetchedProjects) => {
        setProjects(fetchedProjects);
        
        setActiveProject(prevActiveProject => {
            if (prevActiveProject) {
                const refreshedProject = fetchedProjects.find(p => p.id === prevActiveProject.id);
                return refreshedProject || fetchedProjects[0] || null;
            }
            return fetchedProjects[0] || null;
        });
        
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!authLoading) {
      // Handle case where there is no user
      setProjects([]);
      setActiveProject(null);
      setLoading(false);
    }
  }, [user, authLoading]);

  
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
    if (loading) {
        return (
            <div>
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
                <Logo className="h-12 w-12 text-muted-foreground mb-4" />
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
                <Header className="hidden sm:block" />
                <MobileHeader />
                <main className="flex-1 overflow-auto p-4 sm:p-6">
                  <Tabs defaultValue="single">
                    <div className="flex items-center border-b">
                        <TabsList className="ml-auto sm:ml-0">
                        <TabsTrigger value="single">Single Calc</TabsTrigger>
                        <TabsTrigger value="projects">Projects</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="single" className="mt-4">
                        <CalculatorCard />
                    </TabsContent>
                    <TabsContent value="projects" className="mt-4">
                        {renderProjectContent()}
                    </TabsContent>
                  </Tabs>
                </main>
              </SidebarInset>
          </div>
      </SidebarProvider>

      <AddProjectDialog
        open={isAddProjectDialogOpen}
        onOpenChange={setAddProjectDialogOpen}
        onAddProject={handleAddProject}
        />
    </>
  );
}
