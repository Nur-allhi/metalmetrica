export interface Organization {
  name: string;
  logoUrl?: string;
}

export type UnitSystem = "metric" | "imperial";

interface BaseSteelItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  cost: number;
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
    diameter: number;
    thickness: number;
}

export type SteelItem = SteelPlate | SteelGirder | SteelPipe;

export interface Project {
  id: string;
  name: string;
  customer: string;
  projectId: string;
  items: SteelItem[];
  createdAt: string;
}
