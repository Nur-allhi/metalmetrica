
"use client";

import React, {useState} from 'react';
import Link from 'next/link';
import { Plus, Settings, LogIn, LogOut, LayoutGrid, ChevronsUpDown, Search, Folder, ChevronDown } from 'lucide-react';
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
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import SaveProgressDialog from './save-progress-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface ProjectSidebarProps {
    projects: Project[];
    activeProject: Project | null;
    onProjectSelect: (project: Project) => void;
    onAddProject: () => void;
    loading: boolean;
}

export default function ProjectSidebar({ projects, activeProject, onProjectSelect, onAddProject, loading }: ProjectSidebarProps) {
    const { user, signInWithGoogle, logout } = useAuth();
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
    }

    return (
        <>
            <SidebarHeader>
                <div className="flex items-center gap-3 p-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <div className='flex flex-col'>
                        <h1 className="text-md font-bold">MetalMetrica</h1>
                        <p className="text-xs text-muted-foreground">by Ha-Mim Iron Mart</p>
                    </div>
                </div>
                 <div className="relative px-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8" />
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarMenu>
                    <Accordion type="single" collapsible defaultValue="projects" className="w-full">
                        <AccordionItem value="projects" className="border-none">
                            <AccordionTrigger asChild>
                                <SidebarMenuButton>
                                    <Folder />
                                    <span className="flex-1 text-left">Projects</span>
                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                </SidebarMenuButton>
                            </AccordionTrigger>
                            <AccordionContent className="pl-4 pt-1">
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
                                                        className="justify-start text-xs"
                                                    >
                                                        <span>{project.name}</span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                            {projects.length === 0 && (
                                                <p className="text-xs text-muted-foreground p-4 text-center">No projects yet.</p>
                                            )}
                                        </>
                                    )}
                                     <SidebarMenuItem>
                                        <SidebarMenuButton onClick={onAddProject} className="text-xs">
                                            <Plus className="h-3 w-3" />
                                            <span>Create Project</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="settings" className="border-none">
                             <AccordionTrigger asChild>
                                 <SidebarMenuButton>
                                     <Settings />
                                     <span className="flex-1 text-left">Settings</span>
                                     <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                 </SidebarMenuButton>
                            </AccordionTrigger>
                            <AccordionContent className="pl-4 pt-1">
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild className="text-xs">
                                            <Link href="/settings">General</Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className='mt-auto flex flex-col gap-2 border-t p-2'>
                {user && !user.isAnonymous ? (
                    <div className='flex items-center gap-2'>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">{user.displayName || "User"}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => logout()}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button onClick={handleSignIn}>
                        <LogIn />
                        Sign In to Save
                    </Button>
                )}
            </SidebarFooter>

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
}
