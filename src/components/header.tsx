
"use client";

import React from "react";
import Image from "next/image";
import type { Organization } from "@/types";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Logo from "./logo";

interface HeaderProps {
  organization: Organization | null;
}

export default function Header({ organization }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 no-print">
       <SidebarTrigger className="flex md:hidden" />
       <div className="hidden items-center gap-2 md:flex">
           <Logo className="h-6 w-6 text-primary" />
           <h1 className="text-xl font-bold">MetalMetrica</h1>
        </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          {organization?.logoUrl && (
            <Image
              src={organization.logoUrl}
              alt="Organization Logo"
              width={24}
              height={24}
              className="rounded-sm object-contain"
            />
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {organization?.name || "No Organization Set"}
          </span>
        </div>
      </div>
    </header>
  );
}
