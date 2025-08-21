# MetalMetrica App – Comprehensive Modular Blueprint

## Overview
**MetalMetrica** is a professional steel weight calculator app for engineers and construction professionals.  
It calculates steel weight for various forms using metric and imperial units, supports material cost estimation, PDF reports, project management, and is designed with a **modular architecture** for easy upgrades.

**Target Platform:** Android / Cross-platform (NextJS + Tailwind CSS / React Native)  
**Backend:** Firebase (Firestore, Auth, Storage, Cloud Messaging)

---

## 1️⃣ App Modes

### **Single Calculation Mode**
- Quick calculation for one steel type.
- User selects steel type → enters inputs → calculates weight ± optional cost.
- Optional: Save calculation to **history** or **favorites/templates**.

### **Project Mode**
- Manage real projects with **multiple calculation types**.
- Project metadata includes: Project Name, Client, Organization, Date, Notes.
- Add multiple calculations → view totals → export PDF report.
- Totals per steel type and overall project total.
- Optional: include **material cost**.

---

## 2️⃣ First Launch Setup
- Prompt for **Organization Name** and optional **Logo**.
- Stored in local storage or Firebase for:
  - PDF headers
  - Project reports
  - App display
- Editable later in Settings.

---

## 3️⃣ Steel Groups & Calculation Modules
1. **Steel Plate Weight**
   - Plate (mm) – with/without quality
   - Plate (inches) – without quality
2. **Girder Weight**
   - Basic girder (mm)
   - Girder by Running Feet
3. **Pipe Weight**
   - Hollow Cylinder
4. **Circular Sections**
   - Circular Plate
   - Hollow Circular Section (MS Wasa)

> **Note:** Each group is implemented as a separate module to ensure modularity and easy future upgrades.

---

## 4️⃣ Calculation Logic (Per Module)

### **Steel Plate Weight**
```
Weight (kg) = (Length * Width * Thickness * Density)/1000000  # mm
Weight (kg) = (Length * Width * Thickness * 0.743)/144      # inches
Cost = Weight * Price per Unit  # optional
```

### **Girder Weight**
- **Basic:** `(B*2*J*C + F*J*G*7.85)/1000` per piece, total = weight * qty
- **Running Feet:** Flange/Wave running feet calculated, total weight and cost calculated separately.

### **Pipe Weight**
```
Weight (kg) = ((B-C) * (π * D * C * 0.00787))/1000
Cost = Weight * Price per Unit  # optional
```

### **Circular Sections**
- **Circular Plate:** `Weight = 7850 * π * (B/1000)^2 * C / 4`
- **Hollow Circular (MS Wasa):** `Weight = π*((B/2)^2 - (C/2)^2)*D*7.85/1000000`
- Cost = Weight * Price per Unit (optional)

---

## 5️⃣ Project System
| Field | Description |
|-------|-------------|
| Project Name | User-defined |
| Client Name | Optional |
| Organization | From first launch setup |
| Date Created | Auto timestamp |
| Notes | Optional |

**Project Calculations Table:**
| Field | Description |
|-------|-------------|
| Steel Type | Plate / Girder / Pipe / Circular |
| Sub-Type | Plate(mm/quality), Girder Running Feet, etc. |
| Inputs | Length, Width, Thickness, Qty, Units, etc. |
| Calculated Weight | Single piece weight |
| Total Weight | Weight × Qty |
| Running Feet | If applicable |
| Cost | If material cost enabled |
| Notes | Optional |

**Project Summary:**
- Total weight per steel type
- Overall project weight
- Total project cost (if enabled)

---

## 6️⃣ History & Favorites
- Maintain calculation history for single/project mode.
- Undo / edit previous calculations.
- Save commonly used calculations as **favorites/templates**.

---

## 7️⃣ Units & Density Config
- Metric: mm, m, kg, ton
- Imperial: inches, ft, lbs
- Density selection for steel type: Default, MS, SS, Custom
- Conversion automatic across calculations and PDF reports

---

## 8️⃣ PDF Reports & Export
- Header: Organization name & logo, project name, client, date
- Body: Table of all calculations with totals and optional cost
- Footer: Total weight & total cost
- Export options: Save, share via Email/WhatsApp/Cloud Storage
- Notes per calculation/project included

---

## 9️⃣ Notifications & Reminders (Optional)
- Notify users of pending calculations or project deadlines.
- Implement via Firebase Cloud Messaging or local notifications.

---

## 10️⃣ UI / UX Design
- Modular layout with reusable components.
- Prominent input fields and straightforward controls.
- Font: **Inter** (modern, clean)
- Icons: Geometric steel-type icons (plates, girders, pipes)
- Tech: TypeScript, NextJS, Tailwind CSS
- Dark/light mode optional.

---

## 11️⃣ Modular Architecture
```
/src
  /components      # Reusable UI components
  /modules         # Calculation modules per steel type
  /services        # Project management, PDF export, cost estimation
  /config          # Units, densities, steel types, default prices
  /store           # State management (Redux/Context)
  /screens         # Single Calculation, Project Mode, Settings
  /utils           # Helper functions and constants
```
- Each module is independent, follows SOLID principles, and has clear input/output contracts.
- Easy to add new calculation types, export formats, or features in future.

---

## 12️⃣ Color Palette
| Purpose | Hex |
|---------|-----|
| Primary (Buttons, Highlights) | #4682B4 |
| Secondary (Headers, Icons) | #2F4F4F |
| Success / Calculated Value | #2ECC71 |
| Warning / Input Alert | #FFA500 |
| Error / Validation | #DC143C |
| Background (Main) | #F5F5F5 |
| Card / Container | #FFFFFF |
| Light Section Background | #E0E0E0 |
| Primary Text | #333333 |
| Secondary Text / Labels | #666666 |
| Headers / Titles | #000000 |

---

## 13️⃣ Developer Notes
- Follow **modular design** for future scalability.
- Decouple **UI from calculation logic**.
- Unit tests for each calculation module.
- Centralized **state management** for single/project mode.
- Configurable units, densities, and steel types in a global service.
- Ensure PDF export, cost estimation, and notifications work independently and modularly.

---

✅ This blueprint ensures **MetalMetrica** is modular, upgradeable, professional, and ready for real-world engineering use.

