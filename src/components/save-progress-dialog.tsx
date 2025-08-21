
"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";

interface SaveProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function SaveProgressDialog({
  open,
  onOpenChange,
  onConfirm,
}: SaveProgressDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save Your Progress</AlertDialogTitle>
          <AlertDialogDescription>
            You are currently working as a guest. To save your projects and access them from any device, please sign in with your Google account.
            <br/><br/>
            All your current work will be automatically saved to your new account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue as Guest</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm}>Sign In with Google</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
