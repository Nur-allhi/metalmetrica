"use client";

import React from 'react';
import { Plus, Workflow } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface ProjectSidebarProps {
    projects: Project[];
    activeProject: Project | null;
    onProjectSelect: (project: Project) => void;
    onAddProject: () => void;
    loading: boolean;
}

export default function ProjectSidebar({ projects, activeProject, onProjectSelect, onAddProject, loading }: ProjectSidebarProps) {
    return (
        <>
            <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                    <Workflow className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold">MetalMetrica</h1>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {loading ? (
                       [...Array(3)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)
                    ) : (
                        projects.map(project => (
                            <SidebarMenuItem key={project.id}>
                                <SidebarMenuButton
                                    isActive={activeProject?.id === project.id}
                                    onClick={() => onProjectSelect(project)}
                                >
                                    <span>{project.name}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))
                    )}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <Button onClick={onAddProject} className="w-full">
                    <Plus />
                    <span>Create Project</span>
                </Button>
            </SidebarFooter>
        </>
    );
}
