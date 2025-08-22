
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LogIn, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Logo from "./logo";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import SaveProgressDialog from "./save-progress-dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

export default function Header({className, ...props}: HeaderProps) {
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
      <header className={cn("sticky top-0 z-30 h-auto items-center gap-4 border-b bg-background px-6 sm:flex no-print", className)} {...props}>
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">MetalMetrica</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
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
}
