
"use client";

import React from 'react';
import { Plus, Settings } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSkeleton
} from '@/components/ui/sidebar';
import type { Project } from '@/types';
import Logo from './logo';

interface ProjectSidebarProps {
    projects: Project[];
    activeProject: Project | null;
    onProjectSelect: (project: Project) => void;
    onAddProject: () => void;
    onSettingsClick: () => void;
    loading: boolean;
}

export default function ProjectSidebar({ projects, activeProject, onProjectSelect, onAddProject, onSettingsClick, loading }: ProjectSidebarProps) {
    const { user } = useAuth();
    
    return (
        <>
            <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                    <Logo className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold">MetalMetrica</h1>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">PROJECTS</p>
                <SidebarMenu>
                    {loading ? (
                       [...Array(3)].map((_, i) => <SidebarMenuSkeleton key={i} />)
                    ) : (
                        <>
                            {projects.map(project => (
                                <SidebarMenuItem key={project.id}>
                                    <SidebarMenuButton
                                        isActive={activeProject?.id === project.id}
                                        onClick={() => onProjectSelect(project)}
                                        className="justify-start"
                                    >
                                        <span>{project.name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            {projects.length === 0 && (
                                <p className="text-sm text-muted-foreground p-4 text-center">No projects yet.</p>
                            )}
                        </>
                    )}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className='flex flex-row gap-2'>
                 <Button onClick={onAddProject} className="flex-1">
                    <Plus />
                    <span>Create Project</span>
                </Button>
                <Button variant="outline" size="icon" onClick={onSettingsClick}>
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                </Button>
            </SidebarFooter>
        </>
    );
}
