
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
  arrayRemove,
  writeBatch,
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

export const updateItemInProject = async (projectId: string, originalItem: SteelItem, updatedItem: SteelItem) => {
    const projectRef = doc(db, "projects", projectId);
    
    // Firestore doesn't support updating a specific array element directly by value if it's an object.
    // The standard approach is to remove the old item and add the new one.
    // This is best done in a transaction or a batch write to ensure atomicity.
    const batch = writeBatch(db);

    batch.update(projectRef, {
        items: arrayRemove(originalItem)
    });

    batch.update(projectRef, {
        items: arrayUnion(updatedItem)
    });
    
    await batch.commit();
}

export const deleteItemFromProject = async (projectId: string, itemToDelete: SteelItem) => {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
        items: arrayRemove(itemToDelete)
    });
};
