
# MetalMetrica - Advanced Steel Weight & Cost Calculator

MetalMetrica is a professional-grade steel weight and cost calculation application designed for engineers, fabricators, and construction professionals. It provides a robust, project-based system to accurately manage and estimate steel requirements for various construction and fabrication projects.

The application is built as a modern, responsive web app using Next.js and is backed by Firebase for real-time data synchronization and user management.

![MetalMetrica Screenshot](https://placehold.co/1200x600.png?text=MetalMetrica+App+Screenshot)
*<p align="center">A placeholder for the app's screenshot. Replace with an actual image.</p>*


## Key Features

- **Project Management**:
  - Create, edit, and manage multiple projects.
  - Assign a unique Project ID and customer name to each project.

- **Comprehensive Calculation Modules**:
  - Add multiple steel items to each project with detailed specifications.
  - Supported steel types include:
    - **Steel Plate (Quality)**: Metric `(mm)` based calculation.
    - **Steel Plate (Non-Quality)**: Imperial `(in)` based calculation.
    - **Steel Pipe**: Calculated from outer diameter and wall thickness.
    - **Steel Girder**: Detailed calculations for flange and web components, including weight and running feet.
    - **Circular Sections**: Support for both solid (plate) and hollow (wasa) circular sections.

- **Cost Estimation**:
  - Assign a price-per-kilogram to items to calculate material costs.
  - Manage and save **Additional Costs** (e.g., transportation, labor, taxes) on a per-project basis.
  - View a detailed cost breakdown, including sub-totals and a grand total.

- **Interactive Dashboard**:
  - A clean, two-tab interface for "Single Calculations" and "Projects".
  - **Project Sidebar** for easy navigation between projects.
  - **Project View** displays all items in a card-based layout with full details.
  - **Project Summary** card shows total weight, cost breakdowns, and a pie chart visualizing weight distribution by steel type.

- **PDF Report Generation**:
  - Generate professional, detailed PDF reports for any project.
  - Reports are branded with your organization's name, logo, and contact details.
  - Includes a full breakdown of all items, weights, costs, and terms & conditions.

- **Organization & Personalization**:
  - Set up your organization's details (name, logo, contact info, T&Cs) to be used in reports.
  - Choose your preferred currency for cost estimations.

- **Single Calculator**:
  - A dedicated mode for quick, one-off calculations without needing to create a project.
  - Results can be saved as a PNG image for easy sharing.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Charts**: [Recharts](https://recharts.org/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/metalmetrica-app.git
    cd metalmetrica-app
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Firebase Configuration:**
    The project is pre-configured to connect to a Firebase backend. The configuration details are located in `src/lib/firebase.ts`. The app uses Anonymous Authentication, so no user setup is required to start. All data is scoped to the anonymous user's UID.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Project Structure

The application follows a modular structure to ensure scalability and maintainability.

```
/src
  /app          # Next.js App Router pages
  /components   # Reusable UI components (Dialogs, Cards, Forms, etc.)
    /ui         # Core ShadCN UI components
  /hooks        # Custom React hooks (e.g., use-local-storage)
  /lib          # Utility functions, constants, and Firebase config
  /services     # Firestore interaction logic (CRUD operations)
  /types        # TypeScript type definitions for the application
```

---

This `README.md` was generated with assistance from an AI coding partner.
