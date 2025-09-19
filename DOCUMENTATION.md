# UltraCertify Application Documentation

This document provides an overview of the UltraCertify application, its features, and its technical implementation.

## 1. Project Overview

UltraCertify is a web application designed to help users manage and track their green building certification process based on the **IGBC's NEST PLUS Ver 1.0** standard for individual green homes. It allows users to input project details, upload evidence for various certification criteria, and generate a formal PDF report summarizing their project's score and certification level.

---

## 2. Core Features

### a. Project Details Form

- **Location:** Right-hand sidebar on the main page.
- **Functionality:** Users can input all necessary project information as required by the IGBC standard, such as Registration Number, Owner Name, Site Area, etc.
- **Building Type Logic:** A key feature is the "Building Type" dropdown ('New' or 'Existing'). Changing this value dynamically adjusts the list of applicable certification criteria and the points required to achieve different certification levels, as the standards differ for new and existing buildings.
- **Validation:** The form uses client-side validation to ensure all required fields are filled out before certain actions can be taken.

### b. Certification Criteria & Evidence Upload

- **Location:** The main content area on the left.
- **Functionality:** The application displays a list of all mandatory and credit-based criteria. For each criterion, users can upload a supporting document (an image file).
- **How it Works:**
    - The `ImageUploader` component (`src/components/image-uploader.tsx`) allows users to either drag-and-drop a file, select one from their computer, or take a photo directly using their device's camera.
    - Once a file is uploaded for a criterion, a green checkmark appears next to it, and its points (if it's a 'Credit' type) are added to the total score.

### c. Real-time Scoring System

- **Location:** Top of the right-hand sidebar in the "Project Score" card.
- **Functionality:** The application provides instant feedback on the user's progress.
- **How it Works:**
    - The score is calculated automatically whenever the list of uploaded files changes.
    - It sums the points of all 'Credit' criteria for which evidence has been provided.
    - The progress bar and the certification level (e.g., 'Certified', 'Silver', 'Gold') update in real-time based on the current score.

### d. AI-Powered Credit Suggestions

- **Location:** "Actions" card in the right-hand sidebar.
- **Functionality:** The "Suggest Applicable Credits" button uses AI to analyze the uploaded images and suggest other credits the user might be eligible for.
- **How it Works:**
    - When clicked, the images are sent to a backend AI model.
    - The AI analyzes the visual content (e.g., detects solar panels, rainwater harvesting systems) and returns a list of suggested criteria.
    - These suggestions are displayed to the user in a pop-up dialog.

### e. PDF Report Generation

- **Location:** "Actions" card in the right-hand sidebar.
- **Functionality:** The "Generate PDF Report" button creates a comprehensive, print-friendly summary of the project. The report is generated with whatever information is currently in the form, regardless of whether it's complete.
- **How it Works:**
    - This feature uses the browser's native **Print to PDF** functionality, which is the most reliable method for web-based PDF generation. It works across all modern desktop and mobile browsers without needing external libraries.
    - When the button is clicked, a toast notification appears to confirm the action. Then, the browser's print dialog is triggered by the `window.print()` command.
    - Special CSS rules (`@media print`) in `src/app/globals.css` ensure that when the print dialog is active, the main application UI (forms, buttons, sidebars) is hidden, and only the formatted report is visible.
    - The user can then select "Save as PDF" from the print dialog options to download the report to their computer.

- **What the Generated PDF Includes:**
    - A professional header with the project title.
    - A complete grid of all project information entered by the user.
    - A summary of the total score and the achieved certification level.
    - A detailed list of all criteria for which evidence has been uploaded, including their points.
    - A footer with the date the report was generated.

---

## 3. File Structure

The project is built with Next.js (App Router). Here are the key files and directories:

- **`src/app/page.tsx`**: The main and only page of the application. It contains the primary layout, state management, and brings all the components together.
- **`src/app/globals.css`**: The global stylesheet. It contains the print styles (`@media print`) that are essential for the PDF generation feature.
- **`src/components/`**: Contains all reusable React components.
    - `report-template.tsx`: The component that defines the structure and layout of the final PDF report.
    - `image-uploader.tsx`: The component for handling file uploads and the camera.
    - `ui/`: A folder containing general-purpose UI elements like `Button`, `Card`, `Input`, etc.
- **`src/lib/`**: Contains shared logic, data, and type definitions.
    - `certification-data.ts`: This is a crucial file that holds the master list of all IGBC criteria, their points, and applicability.
    - `types.ts`: Defines the TypeScript data structures used throughout the app (e.g., `Criterion`, `ProjectData`).
- **`src/ai/` & `src/app/actions.ts`**: These files manage the backend and AI-related functionality for credit suggestions.

---

## 4. How to Run the Project Locally

To run this application on your own machine, you will need Node.js and npm installed.

1.  **Install Dependencies:**
    Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    After the installation is complete, run:
    ```bash
    npm run dev
    ```

3.  **View the Application:**
    Open your web browser and navigate to `http://localhost:9002` (or whatever URL the terminal provides).
