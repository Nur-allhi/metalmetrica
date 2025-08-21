"use client";

import React from "react";
import Image from "next/image";
import { Settings, Workflow } from "lucide-react";
import type { Organization } from "@/types";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  organization: Organization | null;
  onSettingsClick: () => void;
}

export default function Header({ organization, onSettingsClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 no-print">
      <div className="flex items-center gap-2">
        <Workflow className="h-6 w-6 text-primary" />
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
          <span className="text-sm text-muted-foreground hidden md:inline">
            {organization?.name || "No Organization Set"}
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onSettingsClick}
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  );
}
