
# Technical Specification for UltraCertify Native Android App

## 1. High-Level Project Overview

-   **Application Name:** UltraCertify
-   **Core Purpose:** A tool for building owners and professionals to manage the green building certification process according to IGBC's NEST & NEST PLUS standards. The app facilitates project data entry, evidence uploading (photos), real-time score calculation, and the generation of a final, comprehensive PDF report.
-   **Primary User Roles:**
    -   **Authenticated User:** A standard user who can sign up, log in, create new certification projects, edit them, and generate PDF reports. There are no distinct admin or guest roles in the current architecture.

## 2. Firebase Services & Configuration

-   **Firebase Authentication:**
    -   **Role:** Manages user identity. It is used for user sign-up and sign-in exclusively via the Email/Password method. It also handles session persistence, keeping users logged in.
-   **Firestore Database:**
    -   **Role:** The primary data store for the application. It will hold user profile information and all data related to each certification project. The native app will need to implement a robust data saving mechanism, as the current web app does not persist project form data.
-   **Firebase Cloud Storage:**
    -   **Role:** Used for storing all user-uploaded media, specifically the image evidence for each certification criterion. The Android app will upload captured/selected images here and retrieve their URLs for storage in Firestore.

## 3. Data Models & Firestore Structure

### Collection: `users`
-   Stores basic information about each registered user.
-   **Document ID:** `userId` (from Firebase Auth)
    -   `uid` (String): The unique user ID from Firebase Authentication.
    -   `email` (String): The user's registration email.
    -   `displayName` (String, Optional): The user's display name.
    -   `phoneNumber` (String, Optional): The user's contact phone number.
    -   `createdAt` (Timestamp): Server timestamp of when the user account was created.

### Collection: `projects`
-   Stores all data for a single certification project.
-   **Document ID:** Auto-generated ID.
    -   `projectId` (String): The auto-generated document ID.
    -   `ownerUid` (String): The `uid` of the user who created the project. Foreign key to the `users` collection.
    -   `projectDetails` (Map): Contains all the fields from the "Project Details" form.
        -   `certificationStandard` (String): "NEST" or "NEST_PLUS".
        -   `buildingType` (String): "New" or "Existing".
        -   `registrationNumber` (String).
        -   `ownerName` (String).
        -   `mobileNumber` (String).
        -   `emailAddress` (String).
        -   `projectLocation` (String).
        -   `fullAddress` (String).
        -   `permissionAuthority` (String).
        -   `projectType` (String).
        -   `numberOfFloors` (Number).
        -   `totalSiteArea` (Number).
        -   `totalBuiltUpArea` (Number).
        -   `landscapeArea` (Number).
        -   `twoWheelerParking` (Number).
    -   `criteriaSelections` (Map): Stores the user's selections for each criterion. The key is the `criterionId` (e.g., "np-basic-amenities"). The value depends on the selection type.
        -   For dropdowns: (String) e.g., `"Two Features"`
        -   For checkboxes (single): (Boolean) e.g., `true`
        -   For checkboxes (multiple): (Array of Strings) e.g., `["Dual flush cistern", "Tap with aerators"]`
    -   `otherAutomationDetails` (Map): Stores user-entered text for the "Others" option in "House Automation".
        -   Key: `criterionId` (e.g., "np-house-automation")
        -   Value: (String) e.g., `"Smart blinds, voice assistant"`
    -   `uploadedEvidence` (Map): Stores image evidence. The key is the `criterionId`.
        -   Key: `criterionId` (String)
        -   Value: (Array of Maps)
            -   `storagePath` (String): Full path to the image in Firebase Cloud Storage.
            -   `downloadUrl` (String): Publicly accessible URL for the image.
            -   `description` (String): User-added description for the image.
            -   `location` (GeoPoint): Geolocation (Latitude, Longitude) where the photo was taken.
            -   `uploadedAt` (Timestamp): Timestamp of the upload.
    -   `createdAt` (Timestamp): Server timestamp of project creation.
    -   `lastModified` (Timestamp): Server timestamp of the last update.

## 4. Screen-by-Screen UI/UX and Logic Breakdown

### Screen: Login / Sign Up

-   **Purpose:** To allow users to access their account or create a new one.
-   **UI Elements:**
    -   Tabs: "Login" and "Sign Up".
    -   Text Input: "Email".
    -   Password Input: "Password".
    -   Button: "Login" / "Create Account".
-   **User Actions & Logic:**
    -   **On "Login" Button Click:**
        1.  Validate Email (must be a valid email format).
        2.  Validate Password (must not be empty).
        3.  Call Firebase Auth `signInWithEmailAndPassword`.
        4.  On success, navigate to the Dashboard screen.
        5.  On failure, display a user-friendly error message (e.g., "Incorrect email or password.").
    -   **On "Create Account" Button Click:**
        1.  Validate Email (must be a valid email format).
        2.  Validate Password (must be at least 6 characters).
        3.  Call Firebase Auth `createUserWithEmailAndPassword`.
        4.  On success, create a corresponding document in the `users` collection and navigate to the Dashboard screen.
        5.  On failure, display a user-friendly error (e.g., "This email is already in use.").
-   **Data Flow:**
    -   **Data Read:** None.
    -   **Data Written:** Creates a new user in Firebase Authentication. On signup, creates a new document in the `users` collection.

### Screen: Dashboard

-   **Purpose:** To display a list of the user's existing projects and allow them to start a new one.
-   **UI Elements:**
    -   Text: "Your Projects".
    -   Button: "New Project".
    -   A central card displaying "No Projects Yet" if the user has no projects.
    -   (Future) A list/grid of project cards, each showing project name and key details.
-   **User Actions & Logic:**
    -   **On "New Project" Button Click:**
        1.  Navigate to the Certification screen (Step 1: Standard Selection).
-   **Data Flow:**
    -   **Data Read:** Fetches all documents from the `projects` collection where `ownerUid` matches the current user's ID.
    -   **Data Written:** None.

### Screen: Certification Form

This is a multi-step screen.

#### **Step 1: Standard & Type Selection**

-   **Purpose:** To select the certification standard and building type, which determines the criteria and scoring rules.
-   **UI Elements:**
    -   Dropdown: "Certification Standard" (Options: "NEST PLUS", "NEST").
    -   Dropdown: "Building Type" (Options: "New Building", "Existing Building").
    -   Button: "Continue".
-   **User Actions & Logic:**
    -   **On "Continue" Button Click:**
        1.  Validate that both dropdowns have a selection.
        2.  If invalid, show a toast/error message.
        3.  If valid, load the main form screen (Step 2) with the corresponding criteria data.
-   **Data Flow:**
    -   **Data Read:** None.
    -   **Data Written:** This selection is held in the app's state and will be written to the `projects` document once the main form is submitted.

#### **Step 2: Main Form & Criteria**

-   **Purpose:** To fill in project details, select achieved criteria, and upload evidence.
-   **UI Elements:**
    -   **Project Details Form:** A form with numerous text inputs for all fields listed in the `projects.projectDetails` data model.
    -   **Certification Criteria List:** An accordion-style list where each item represents a mandatory or credit criterion.
        -   Each item displays: Criterion Name, Type (Mandatory/Credit), and Points (e.g., "Points: 2 / 4").
    -   **Criterion Controls (inside accordion):**
        -   Dropdowns for single-choice criteria.
        -   Checkboxes for multiple-choice criteria.
        -   A single "Achieved" checkbox for simple yes/no criteria.
        -   Textarea for "Other" details (e.g., House Automation).
    -   **Image Uploader Component:** For each criterion, a component to upload/capture photos.
        -   Drag-and-drop area.
        -   "Use Camera" button.
        -   Thumbnail gallery of uploaded images.
        -   "Remove" button on each thumbnail.
        -   Textarea for image `description`.
        -   Display for captured `location` data.
    -   **Project Score Panel (Sticky):**
        -   Progress Bar.
        -   Current Score / Max Score text.
        -   Achieved Certification Level text (e.g., "Gold").
    -   **Actions Panel:**
        -   Button: "Generate PDF Report".
-   **User Actions & Logic:**
    -   **On selecting any criterion option (dropdown/checkbox):**
        1.  Update the app's state.
        2.  Recalculate the `currentScore` in real-time.
        3.  Update the Project Score Panel UI.
    -   **On Image Upload/Capture:** See "Image Handling" section below.
    -   **On "Generate PDF Report" Button Click:**
        1.  Validate the entire Project Details form.
        2.  If invalid, show an error.
        3.  If valid, trigger the PDF Generation flow (see below).
-   **Data Flow:**
    -   **Data Read:** The app loads the static `certification-data` structure based on the Step 1 selection. For an existing project, it would fetch the corresponding document from the `projects` collection to populate the form.
    -   **Data Written:** The app should periodically (or on a "Save" button click) create/update the project document in the `projects` collection with all form data, selections, and evidence URLs.

## 5. Detailed Feature Specifications

### User Authentication

-   **Sign-up:** Email/Password. Creates an `auth` user and a `users` document in Firestore.
-   **Sign-in:** Email/Password. Uses `signInWithEmailAndPassword`.
-   **Sign-out:** Clears the user session.
-   **Session Persistence:** The app must keep the user logged in across app restarts until they explicitly log out.
-   **Password Reset:** A standard "Forgot Password" flow should be implemented using Firebase Auth's `sendPasswordResetEmail` function.

### Complex Form Handling

-   The certification form is the core of the app. All fields listed in the `certification-data.ts` file must be represented as UI controls.
-   **Validation:** All fields in the "Project Details" section are required and must be validated (e.g., number fields must contain numbers, email must be valid).
-   **Dynamic Logic:** The list of criteria, their points, and their options are dynamically loaded based on the "Certification Standard" and "Building Type" selected in Step 1. The Android app must replicate this logic by parsing a similar local data structure.

### Image Handling (Critically Important)

-   **Image Upload:**
    1.  User taps an "Upload" button.
    2.  The native Android file picker/gallery opens.
    3.  User selects one or more images.
    4.  For each selected image, trigger the upload and metadata process.
-   **Image Capture:**
    1.  User taps the "Use Camera" button.
    2.  The native Android camera intent is launched.
    3.  User takes a photo.
    4.  On confirmation, the captured photo is returned to the app.
    5.  Trigger the upload and metadata process.
-   **Geolocation & Metadata Process (for each image):**
    1.  Immediately after capture/selection, retrieve the device's current GPS coordinates (Latitude, Longitude).
    2.  Display a thumbnail of the image and an input field for the user to add a `description`.
    3.  Begin uploading the image file to Firebase Cloud Storage under the path: `projects/{projectId}/{criterionId}/{image_uuid}.jpg`.
    4.  Once the upload is complete, get the `downloadUrl`.
    5.  Save a map containing the `storagePath`, `downloadUrl`, user `description`, and the captured `location` (as a Firestore GeoPoint) to the corresponding `projects` document under `uploadedEvidence`.

### PDF Generation

-   **Trigger:** User clicks the "Generate PDF Report" button on the main form screen.
-   **Data Source:** The current state of the project data (details, selections, evidence URLs) from the corresponding `projects` Firestore document.
-   **Layout and Styling (Client-Side Generation):** The Android app should use a native PDF generation library (e.g., Android's built-in `PdfDocument` API or a third-party library like iText).
    -   **Orientation:** Landscape.
    -   **Page 1: Project Details:**
        -   **Header:** UltraTech logo on the left, "UltraCertify Report" title centered.
        -   **Content:** A two-column layout listing all key-value pairs from the `projectDetails` map.
        -   **Summary:** Below the details, display "Total Score Achieved: [X] / [Y]" and "Certification Level Attained: [Level]".
        -   **Footer:** "Report for [Owner Name] | Generated on [Date]" on the left, "Page 1" on the right.
    -   **Page 2: Summary Table:**
        -   **Header:** "Project Summary Table".
        -   **Content:** A multi-column table listing every criterion the user *attempted*.
            -   Column 1: `Criterion` (Name of criterion)
            -   Column 2: `Type` (Mandatory/Credit)
            -   Column 3: `Points Awarded` ("X / Y")
            -   Column 4: `Requirements Met` (The full requirement text for that criterion).
    -   **Subsequent Pages: Individual Criterion Details:**
        -   Create one new page for each criterion that was attempted.
        -   **Header:** A highlighted block containing the criterion name and type (e.g., "**Basic Amenities (Credit)**").
        -   **Details:** List the criterion's `Requirements`, `Points Awarded`, and `Status` (the user's selection, e.g., "5 amenities selected").
        -   **Image Evidence:** If images were uploaded for this criterion, display them below the details. Each image should be accompanied by its user-provided `description` and `location` coordinates.
    -   **Styling:**
        -   **Font:** Roboto.
        -   **Colors:** Use the brand colors: UltraTech Blue (`#004385`), Light Gray (`#F0F0F0`), and UltraTech Orange (`#E57200`) for accents.
        -   **Margins:** Consistent margins (e.g., 15mm) on all sides.
        -   **Font Sizes:** Titles (22pt, bold), Sub-headers (18pt, bold), Body text (10pt, normal).
