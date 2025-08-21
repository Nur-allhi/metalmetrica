"use client";

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Project, SteelItem } from "@/types";

// Projects
export const getProjects = (userId: string, callback: (projects: Project[]) => void) => {
  const q = query(collection(db, "projects"), where("userId", "==", userId));
  return onSnapshot(q, (querySnapshot) => {
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({ 
        ...data, 
        id: doc.id,
        createdAt: data.createdAt?.toDate().toISOString() 
      } as Project);
    });
    callback(projects);
  });
};

export const addProject = async (userId: string, project: Omit<Project, 'id' | 'createdAt' | 'userId'>) => {
  await addDoc(collection(db, "projects"), { ...project, userId, createdAt: serverTimestamp() });
};

export const updateProject = async (projectId: string, project: Partial<Project>) => {
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, project);
};

export const deleteProject = async (projectId: string) => {
  const projectRef = doc(db, "projects", projectId);
  await deleteDoc(projectRef);
};

// Project Items
export const addItemToProject = async (projectId: string, item: Omit<SteelItem, 'id'>) => {
    const projectRef = doc(db, "projects", projectId);
    const newItem = { ...item, id: `item_${Date.now()}`};
    
    await updateDoc(projectRef, {
        items: arrayUnion(newItem)
    });
};
