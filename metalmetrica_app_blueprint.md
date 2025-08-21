# MetalMetrica App – Detailed Step-by-Step Blueprint

## Overview
**MetalMetrica** is a professional steel weight calculator app designed for engineers, fabricators, and construction professionals.  
The app calculates steel weight for various forms, supports both metric and imperial units, allows material cost estimation, generates PDF reports, and manages projects.  
It is designed with a **modular architecture** for easy upgrades.

**Target Platform:** Android / Cross-platform (NextJS + Tailwind CSS / React Native)
**Backend:** Firebase (Firestore, Auth, Storage, Cloud Messaging)

---

## 1 First Launch Setup
### Step 1: Organization Setup
- Prompt user to enter **Organization Name**.
- Optional: Upload **Organization Logo**.
- Store data in local storage or Firebase.
- Use organization info in PDF headers, project reports, and app-wide branding.

### Step 2: Default Settings
- Default units: Metric (mm, m, kg, ton)
- Default steel type: Mild Steel (MS)
- Default density: 7.85 g/cm³
- Optional: Enable material cost estimation

---

## 2 App Modes
### Single Calculation Mode
1. User selects steel type: Plate, Girder, Pipe, Circular Section.
2. Enter inputs (length, width, thickness, diameter, quantity).
3. Choose units: Metric or Imperial.
4. Optional: Enter price per unit (for cost calculation).
5. Click **Calculate** → show weight (kg or lbs) and cost.
6. Option to **save to history or favorites**.

### Project Mode
1. Create a new project: enter project name, client, date, notes.
2. Add multiple calculation entries (different steel types).
3. Each entry calculates **weight** and **cost** automatically.
4. Show **totals per steel type** and **overall project total**.
5. Export project report as PDF (with organization info, totals, and notes).

---

## 3 Calculation Modules and Logic
Each steel type is a separate module.

### 3.1 Steel Plate Weight
#### Formula (Metric, mm):
```
Weight (kg) = Length(mm) * Width(mm) * Thickness(mm) * Density(g/cm³) / 1000000
```
#### Formula (Imperial, inches):
```
Weight (lbs) = Length(in) * Width(in) * Thickness(in) * 0.743 / 144
```
#### Inputs:
- Length, Width, Thickness
- Density (default 7.85 g/cm³)
- Quantity
- Optional: Price per unit

#### Output:
- Single piece weight
- Total weight = Weight * Quantity
- Total cost = Total weight * Price per unit

### 3.2 Girder Weight
#### Basic Girder (mm):
```
Weight per piece (kg) = (Flange_Length * 2 * Flange_Thickness * Flange_Width + Web_Width * Web_Thickness * Flange_Width) * 0.00787 / 1000
```
#### Girder by Running Feet:
- Flange Weight: `D4 = (B4 * J4 * C4 * 0.00787 / 1000) * 2`
- Flange Running Feet: `E4 = ((J4*2)*L4)/305`
- Wave Weight: `H4 = (F4*J4*G4*0.00787)/1000`
- Wave Running Feet: `I4 = (J4*L4)/305`
- 1 pcs weight: `K4 = (B4*2*J4*C4 + F4*J4*G4*0.00787/1000)`
- Total pcs weight: `M4 = (K4*L4)/1000`
- Total Flange Weight: `N4 = (D4*L4)/1000`
- Total Wave Weight: `O4 = (H4*L4)/1000`

### 3.3 Pipe Weight (Hollow Cylinder)
```
Weight (kg) = (Outer_Diameter - Inner_Diameter) * π * Inner_Diameter * Wall_Thickness * 0.00787 / 1000
Cost = Weight * Price per unit (optional)
```
#### Inputs:
- Outer Diameter, Inner Diameter, Wall Thickness, Length, Quantity

### 3.4 Circular Plate & Hollow Circular Section (MS Wasa)
#### Circular Plate:
```
Weight (kg) = 7850 * π * (Diameter/1000)^2 * Thickness / 4
```
#### Hollow Circular Section:
```
Weight (kg) = π * ((Outer_Diameter/2)^2 - (Inner_Diameter/2)^2) * Thickness * 7.85 / 1000000
```
- Inputs: Diameter(s), Thickness, Quantity
- Optional: Price per unit

---

## 4 Material Cost Estimation (Optional)
- User enters **price per kg or lb**.
- Calculate cost per piece and total cost per project.
- Display in **results table** and **PDF report**.

---

## 5 Project Management
1. Create/Edit/Delete Projects.
2. Add multiple calculation entries.
3. Show **totals per steel type** and **overall project totals**.
4. Include **optional cost**.
5. Export PDF with:
   - Organization info & logo
   - Project metadata
   - Calculation table
   - Totals & notes

---

## 6 History & Favorites
- Save previous calculations.
- Undo/Redo functionality.
- Save commonly used configurations as templates.
- Filter/search in history by steel type or project.

---

## 7 Units & Density Configuration
- Metric: mm, m, kg, ton
- Imperial: inches, ft, lbs
- Default density 7.85 g/cm³ (MS)
- Optional steel types: SS, Custom
- Automatic unit conversion across modules and PDF reports

---

## 8 PDF Export
- Header: Organization name/logo, project name, client, date
- Table: All calculations with inputs, weight, quantity, cost
- Footer: Totals per steel type, overall totals, optional notes
- Export options: Save, share via Email, WhatsApp, Cloud

---

## 9 Notifications / Reminders (Optional)
- Notify pending calculations or project deadlines.
- Firebase Cloud Messaging or local notifications.

---

## 10 UI/UX Design
- **Layout:** Modular, clean, prominent input fields, intuitive controls
- **Font:** Inter (modern, clean)
- **Icons:** Geometric steel-type icons (plates, girders, pipes)
- **Tech:** TypeScript, NextJS, Tailwind CSS
- **Themes:** Light/Dark mode optional

---

## 11 Modular Architecture
```
/src
  /components      # Reusable UI components (Inputs, Buttons, Tables, Cards)
  /modules         # Calculation modules per steel type
  /services        # Project management, PDF generation, cost estimation
  /config          # Units, densities, steel types, conversion constants
  /store           # State management (Redux/Context)
  /screens         # Single Calculation, Project Mode, Settings
  /utils           # Helper functions, constants, formulas
```
- Each module is **independent**, follows **SOLID principles**, and has **clear input/output contracts**.
- Adding new steel types or calculation modules should require **minimal changes**.

---

## 12 Color Palette
| Purpose | Hex |
|---------|-----|
| Primary Buttons / Highlights | #4682B4 |
| Secondary / Headers / Icons | #2F4F4F |
| Success / Calculated Values | #2ECC71 |
| Warning / Alerts | #FFA500 |
| Error / Validation | #DC143C |
| Main Background | #F5F5F5 |
| Card / Container | #FFFFFF |
| Light Section | #E0E0E0 |
| Primary Text | #333333 |
| Secondary Text / Labels | #666666 |
| Headers / Titles | #000000 |

---

## 13 Developer Notes
- Keep **UI and logic decoupled**.
- Follow **modular design** for scalability.
- Write **unit tests** for each calculation module.
- Ensure **PDF export, cost estimation, and notifications** work independently.
- Centralize **state management** for single and project modes.
- Use **configuration files** for units, steel types, and densities.

