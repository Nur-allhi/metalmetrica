
"use client";

import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Project, SteelItem } from "@/types";

// Path helper
const projectsCollection = (userId: string) => collection(db, 'users', userId, 'projects');
const projectDoc = (userId: string, projectId: string) => doc(db, 'users', userId, 'projects', projectId);

// Projects
export const getProjects = (userId: string, callback: (projects: Project[]) => void) => {
  const q = query(projectsCollection(userId));
  return onSnapshot(q, (querySnapshot) => {
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({ 
        ...data, 
        id: doc.id,
        createdAt: data.createdAt?.toDate().toISOString(),
        userId: userId,
      } as Project);
    });
    callback(projects);
  });
};

export const addProject = async (userId: string, project: Omit<Project, 'id' | 'createdAt' | 'userId'>) => {
  await addDoc(projectsCollection(userId), { ...project, createdAt: serverTimestamp() });
};

export const updateProject = async (userId: string, projectId: string, project: Partial<Project>) => {
  const projectRef = projectDoc(userId, projectId);
  await updateDoc(projectRef, project);
};

export const deleteProject = async (userId: string, projectId: string) => {
  const projectRef = projectDoc(userId, projectId);
  await deleteDoc(projectRef);
};

// Project Items
export const addItemToProject = async (userId: string, projectId: string, item: Omit<SteelItem, 'id'>) => {
    const projectRef = projectDoc(userId, projectId);
    const newItem = { ...item, id: `item_${Date.now()}`};
    
    await updateDoc(projectRef, {
        items: arrayUnion(newItem)
    });
};

export const updateItemInProject = async (userId: string, projectId: string, originalItem: SteelItem, updatedItem: SteelItem) => {
    const projectRef = projectDoc(userId, projectId);
    
    const batch = writeBatch(db);

    batch.update(projectRef, {
        items: arrayRemove(originalItem)
    });

    batch.update(projectRef, {
        items: arrayUnion(updatedItem)
    });
    
    await batch.commit();
}

export const deleteItemFromProject = async (userId: string, projectId: string, itemToDelete: SteelItem) => {
    const projectRef = projectDoc(userId, projectId);
    await updateDoc(projectRef, {
        items: arrayRemove(itemToDelete)
    });
};
