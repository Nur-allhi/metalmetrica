export interface Organization {
  name: string;
  logoUrl?: string;
}

export type UnitSystem = "metric" | "imperial";

interface BaseSteelItem {
  id: string;
  name: string;
  quantity: number;
  weight: number; // Always in kg
  cost: number; // Always in USD
}

export interface SteelPlate extends BaseSteelItem {
  type: "plate";
  length: number;
  width: number;
  thickness: number;
}

export interface SteelGirder extends BaseSteelItem {
    type: "girder";
    length: number;
    profile: string;
}

export interface SteelPipe extends BaseSteelItem {
    type: "pipe";
    length: number;
    outerDiameter: number;
    wallThickness: number;
}

export type SteelItem = SteelPlate | SteelGirder | SteelPipe;

export interface Project {
  id: string;
  userId: string;
  name: string;
  customer: string;
  projectId: string;
  items: SteelItem[];
  createdAt: string;
}
