# UltraCertify Application Documentation

This document provides an overview of the UltraCertify application, its features, and its technical implementation.

## 1. Project Overview

UltraCertify is a web application designed to help users manage and track their green building certification process based on the **IGBC's NEST PLUS Ver 1.0** standard for individual green homes. It allows users to input project details, select their achieved credits, upload evidence, and generate a formal, branded PDF report summarizing their project's score and certification level.

The application is fully responsive and designed with a **mobile-first** approach.

---

## 2. Core Features

### a. Project Details Form

- **Location:** Right-hand sidebar on the main page.
- **Functionality:** Users can input all necessary project information as required by the IGBC standard, such as Registration Number, Owner Name, Site Area, Mobile Number, etc.
- **Building Type Logic:** A key feature is the "Building Type" dropdown ('New' or 'Existing'). Changing this value dynamically adjusts the list of applicable certification criteria, the points available for each, and the thresholds required to achieve different certification levels.
- **Validation:** The form uses `react-hook-form` with `zod` for robust, real-time client-side validation, ensuring all required fields are filled out correctly before certain actions (like PDF generation) can be taken.

### b. Dynamic Certification Criteria & Scoring

- **Location:** The main content area on the left.
- **Functionality:** The application displays a dynamic list of all mandatory and credit-based criteria based on the selected "Building Type". The scoring is not based on image uploads, but on the user's explicit selections.
- **How it Works:**
    - **Single Choice (Dropdowns):** For criteria with mutually exclusive achievement levels (e.g., "Setbacks"), a dropdown menu is provided. The user selects one option, and the corresponding points are awarded.
    - **Multiple Choice (Checkboxes):** For criteria where multiple features can be combined for a total score (e.g., "Water Saving Fixtures"), a list of checkboxes is provided. The points for all selected options are summed, up to the maximum allowed for that criterion.
    - **Simple Yes/No (Checkbox):** For criteria that are either achieved or not, a single "Achieved" checkbox is used.
- **Real-time Feedback:** The points earned for each criterion (e.g., "Points: 2 / 4") are displayed and updated instantly as the user makes selections.

### c. Evidence Upload

- **Location:** Integrated into each criterion's card.
- **Functionality:** The image uploader is for providing **proof of compliance** for the options selected. It is not tied to the scoring itself.
- **How it Works:**
    - The `ImageUploader` component (`src/components/image-uploader.tsx`) allows users to upload multiple images for a single criterion.
    - Users can drag-and-drop files, select them from their computer, or take photos directly using their device's camera.
    - Uploaded images are displayed as thumbnails and can be removed individually.

### d. Real-time Scoring System

- **Location:** Top of the right-hand sidebar in the "Project Score" card.
- **Functionality:** The application provides instant feedback on the user's progress.
- **How it Works:**
    - The total score is calculated in real-time whenever a user selects or deselects an option for any credit criterion.
    - The logic ensures that the points for any single criterion cannot exceed its defined maximum, even if multiple checkbox options are selected.
    - The progress bar and the certification level (e.g., 'Certified', 'Silver', 'Gold') update instantly based on the current total score.

### e. AI-Powered Credit Suggestions

- **Location:** "Actions" card in the right-hand sidebar.
- **Functionality:** The "Suggest Applicable Credits" button uses AI to analyze the uploaded images and suggest other credits the user might be eligible for.
- **How it Works:**
    - When clicked, all uploaded images are sent to a backend Genkit AI flow.
    - The AI analyzes the visual content (e.g., detects solar panels, rainwater harvesting systems) and returns a list of suggested criteria IDs.
    - These suggestions are displayed to the user in a pop-up dialog.

### f. Branded PDF Report Generation

- **Location:** "Actions" card in the right-hand sidebar.
- **Functionality:** The "Generate PDF Report" button creates a comprehensive, print-friendly summary of the project.
- **How it Works:**
    - This feature uses the `jsPDF` library to programmatically generate a high-quality, multi-page PDF directly in the browser.
    - The report is generated in **landscape (horizontal) orientation** for better readability.
    - **Branding:** The report header prominently features the **UltraTech Cement logo** and a professional title.
    - **Comprehensive Details:** The first page includes a full summary of all project details and the final certification score.
    - **One Criterion Per Page:** Each subsequent page is dedicated to a single applicable criterion, displaying:
        - A large, highlighted title with the criterion name.
        - All relevant details: requirements, points awarded vs. max points, and status (e.g., "Achieved", "Not Attempted").
        - Any uploaded image evidence is displayed in a smart grid layout on the **same page** as its corresponding text, ensuring clarity and context.

---

## 3. File Structure

The project is built with Next.js (App Router). Here are the key files and directories:

- **`src/app/page.tsx`**: The main and only page of the application. It contains the primary layout, all state management (`useState`, `useCallback`), form handling (`react-hook-form`), and the PDF generation logic (`jsPDF`).
- **`src/components/`**: Contains all reusable React components.
    - `image-uploader.tsx`: The component for handling multi-file uploads and the camera.
    - `camera-capture.tsx`: The modal component for taking photos.
    - `ui/`: A folder containing general-purpose UI elements from `shadcn/ui`.
- **`src/lib/`**: Contains shared logic, data, and type definitions.
    - `certification-data.ts`: This is a crucial file that holds the master list of all IGBC criteria, their points, applicability, and selectable options for dropdowns/checkboxes.
    - `types.ts`: Defines the TypeScript data structures used throughout the app (e.g., `Criterion`, `ProjectData`).
    - `ultratech-logo.png`: The official brand logo used in the UI and the PDF report.
- **`src/ai/` & `src/app/actions.ts`**: These files manage the backend Genkit AI flow for credit suggestions.

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
