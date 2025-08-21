
"use client";

import React from "react";
import Image from "next/image";
import { LogIn, LogOut, Settings } from "lucide-react";
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

interface HeaderProps {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: HeaderProps) {
  const { user, signInWithGoogle, logout } = useAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 no-print">
      <SidebarTrigger className="flex md:hidden" />
      <div className="hidden items-center gap-2 md:flex">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">MetalMetrica</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={signInWithGoogle}>
            <LogIn />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
