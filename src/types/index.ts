


export interface Organization {
  name: string;
  logoUrl?: string;
  email?: string;
  address?: string;
  currency?: string;
  contactNumber?: string;
  termsAndConditions?: { text: string }[];
}

export type UnitSystem = "quality" | "non-quality";

interface BaseSteelItem {
  id: string;
  name: string;
  quantity: number;
  weight: number; // Always in kg
  cost: number | null; // Always in USD, null if not provided
}

export interface SteelPlate extends BaseSteelItem {
  type: "plate" | "plate-imperial";
  length: number;
  width: number;
  thickness: number;
}

export interface SteelGirder extends BaseSteelItem {
  type: "girder";
  length: number;
  flangeWidth: number;
  flangeThickness: number;
  webHeight: number;
  webThickness: number;
  // Detailed running feet calculations
  flangeWeight?: number;
  webWeight?: number;
  flangeRunningFeet?: number;
  webRunningFeet?: number;
}

export interface SteelPipe extends BaseSteelItem {
  type: "pipe";
  length: number;
  outerDiameter: number;
  wallThickness: number;
}

export interface SteelCircular extends BaseSteelItem {
  type: "circular";
  thickness: number;
  diameter: number;
  innerDiameter?: number | null;
}

export type SteelItem = SteelPlate | SteelGirder | SteelPipe | SteelCircular;

export interface Project {
  id: string;
  userId: string;
  name: string;
  customer: string;
  projectId: string;
  items: SteelItem[];
  createdAt: string;
  additionalCosts?: AdditionalCost[];
}

export interface AdditionalCost {
  id: string;
  description: string;
  amount: number;
}
