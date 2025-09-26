
# UltraCertify Form Technical Specification

## 1. Overview

This document provides a detailed technical breakdown of the core feature of the UltraCertify application: the dynamic certification form. This form allows users to input project details, select criteria for green building certification, upload evidence, and receive a real-time score.

The form's content and scoring logic dynamically change based on two initial user selections:
1.  **Certification Standard:** NEST PLUS or NEST
2.  **Building Type:** New or Existing

This results in four unique versions of the form, each with its own set of criteria, points, and certification thresholds.

---

## 2. Form Entry Point: Standard & Type Selection (Step 1)

This is the initial screen the user sees when starting a new project.

-   **Purpose:** To capture the two primary inputs that define which version of the certification form to load.
-   **UI Elements:**
    -   **Dropdown: "Certification Standard"**
        -   **Options:** "NEST PLUS", "NEST"
        -   **Validation:** Required. Must be selected.
    -   **Dropdown: "Building Type"**
        -   **Options:** "New Building", "Existing Building"
        -   **Validation:** Required. Must be selected.
    -   **Button: "Continue"**
-   **Logic:**
    1.  The "Continue" button is initially active.
    2.  Upon click, the form validates that both dropdowns have a value.
    3.  If validation fails, a toast notification appears asking the user to make a selection.
    4.  If validation succeeds, the application dynamically loads the corresponding `StandardData` object from `src/lib/certification-data.ts` and transitions the user to the main form (Step 2).

---

## 3. Main Form UI & Logic (Step 2)

This is the main multi-part screen where all project data is entered and managed.

### 3.1. Project Details Section

-   **Purpose:** To collect all the necessary administrative and physical details of the building project. This information is displayed on the first page of the final PDF report.
-   **Validation:** All fields in this section are required and are validated using a Zod schema (`projectSchema`).

| Field Label                  | Data Type     | UI Control | Validation Rules                                       | Icon                      |
| ---------------------------- | ------------- | ---------- | ------------------------------------------------------ | ------------------------- |
| Project Registration Number  | String        | Input      | Required, must not be empty                            | `Hash`                    |
| Owner Name                   | String        | Input      | Required, must not be empty                            | `User`                    |
| Mobile Number                | String        | Input      | Required, must not be empty                            | `Phone`                   |
| Email Address                | String        | Input      | Required, must be a valid email format                 | `Mail`                    |
| Project Location             | String        | Input      | Required, must not be empty                            | `Map`                     |
| Full Address with Pincode    | String        | Input      | Required, must not be empty                            | `MapPin`                  |
| Permission Authority         | String        | Input      | Required, must not be empty                            | `Building`                |
| Project Type                 | String        | Input      | Required, must not be empty                            | `Building`                |
| Number of Floors             | Number        | Input      | Required, must be an integer >= 1                      | `Layers`                  |
| Total Site Area (sq. m)      | Number        | Input      | Required, must be a number > 0                         | `Ruler`                   |
| Total Built-up Area (sq. m)  | Number        | Input      | Required, must be a number > 0                         | `Building2`               |
| Landscape Area (sq. m)       | Number        | Input      | Required, must be a number >= 0                        | `Trees`                   |
| Two Wheeler Parking (Nos)    | Number        | Input      | Required, must be an integer >= 0                      | `Bike`                    |

---

### 3.2. Certification Criteria Section

-   **Purpose:** To display the list of all applicable criteria (both Mandatory and Credit-based) for the selected Standard and Building Type. Users interact with this section to log their project's achievements.
-   **UI Structure:** An accordion-style list. Each item in the accordion represents one criterion.
-   **Accordion Trigger Content:**
    -   `CheckCircle2` icon (colored green if the criterion is achieved/points are scored).
    -   Criterion Name (e.g., "Passive Architecture").
    -   `Badge` indicating "Mandatory" or "Credit".
    -   For Credit criteria, a real-time "Points: X / Y" display.
-   **Accordion Content:**
    -   A detailed description of the criterion's requirements.
    -   A list of required documents for evidence.
    -   Interactive controls (Checkboxes, Dropdowns) for users to make selections.
    -   An `ImageUploader` component for uploading evidence.

#### **Criterion Data Structure Deep Dive**

All data is sourced from `src/lib/certification-data.ts`. Below is a breakdown for each of the four form variations.

---

#### **A. NEST PLUS - New Building**
- **Max Score:** 79 Points
- **Certification Levels:** Certified (40+), Silver (50+), Gold (65+), Platinum (75+)

| ID                               | Name                               | Type      | Max Points | Requirements                                                                                                                                                             | Selection Type   | Options / Notes                                                                                                                                                           |
| -------------------------------- | ---------------------------------- | --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `np-local-building-regulations`  | Local Building Regulations         | Mandatory | 0          | Approved Plan from local municipal authority.                                                                                                                            | -                | -                                                                                                                                                                         |
| `np-waste-segregation`           | Waste Segregation - Dry & Wet      | Mandatory | 0          | Provide 2 separate bins to collect dry and wet waste.                                                                                                                    | -                | -                                                                                                                                                                         |
| `np-rainwater-harvesting-500l`   | Rainwater Harvesting 500 Liters    | Mandatory | 0          | Rainwater harvesting system to capture at least 500 litres from the entire site area runoff. Or Project can have rainwater harvesting pit to capture run-off from roof. | -                | -                                                                                                                                                                         |
| `np-passive-architecture-features` | Passive Architecture Features      | Credit    | 4          | Provide any two features mentioned below. For each feature two points (max 4 points for New): 1. Courtyard 2. Vernacular materials 3. Local Vernacular Elements...        | Dropdown         | "One Feature" (2 pts), "Two Features" (4 pts)                                                                                                                             |
| `np-top-soil-preservation`       | Top soil Preservation              | Credit    | 1          | Preserve top 150-200 mm soil during excavation.                                                                                                                          | Checkbox         | "Achieved" (1 pt)                                                                                                                                                         |
| `np-passive-architecture-setbacks` | Passive Architecture (Setbacks)    | Credit    | 2          | Provide minimum of 3 ft setback or as per local norms whichever is higher on 2 sides (1 point) or More than 2 sides (2 points)                                       | Dropdown         | "2 sides" (1 pt), "More than 2 sides" (2 pts)                                                                                                                             |
| `np-basic-amenities`             | Basic Amenities                    | Credit    | 2          | Select 3 amenities for 1 point or 5 amenities for 2 points within a 1 km walk.                                                                                           | Multiple Checkbox | 15 amenity options. Logic: 3-4 selected = 1 pt, >=5 selected = 2 pts.                                                                                                   |
| `np-vegetation-natural-topography` | Vegetation and Natural Topography  | Credit    | 4          | Provide vegetation on Ground/built-up structures: 30 sq.ft (1 Pt), 50 sq.ft (2 Pts), 75 sq.ft (3 Pts), 100 sq.ft (4 Pts).                                                | Dropdown         | "30 sq.ft" (1 pt), "50 sq.ft" (2 pts), "75 sq.ft" (3 pts), "100 sq.ft" (4 pts)                                                                                              |
| `np-indoor-plants`               | Indoor Plants - 5 Plants (Minimum) | Credit    | 1          | Grow a minimum of 5 indoor plants.                                                                                                                                       | Checkbox         | "Achieved" (1 pt)                                                                                                                                                         |
| `np-e-vehicle`                   | E-Vehicle/Renewable fuel vehicle   | Credit    | 1          | Use atleast one of the following vehicle type: E vehicle, CNG based, LPG based, or any other renewable fuel based vehicle.                                               | Checkbox         | "Achieved" (1 pt)                                                                                                                                                         |
| `np-best-practices-construction` | Best Practices during Construction | Credit    | 2          | Implement measures during construction (Barrication, Dust Suppression, etc.). Any 2 measures - 1 Point. Any 4 measures - 2 Points.                                    | Dropdown         | "Any 2 measures" (1 pt), "Any 4 measures" (2 pts)                                                                                                                         |
| `np-white-finish`                | White finish                       | Credit    | 2          | Use materials with china mosaic/light colored paint/reflective coating/terrace landscaping.                                                                            | Checkbox         | "Achieved" (2 pts)                                                                                                                                                        |
| `np-enhanced-rainwater-harvesting` | Enhanced Rainwater Harvesting      | Credit    | 4          | Rainwater harvesting system to capture at least 750 Litres from site runoff (2 points) & Reuse provision for harvested water (2 points).                               | Multiple Checkbox | "Harvesting (750L)" (2 pts), "Reuse provision" (2 pts), "Existing Well / Borewell" (4 pts)                                                                                |
| `np-water-saving-fixtures`       | Water Saving Fixtures              | Credit    | 8          | Provide efficient water fixtures: Dual flush cistern (3 pts), Tap with aerators (2 pts), Showers with aerators (2 pts), Health faucet with aerators (1 pt)             | Multiple Checkbox | "Dual flush cistern" (3 pts), "Tap with aerators" (2 pts), "Showers with aerators" (2 pts), "Health faucet with aerators" (1 pt). Max score capped at 8.                  |
| `np-water-metering-controllers`  | Water Metering, Water Controllers  | Credit    | 2          | Provide Water metering (1 Point) and Automatic water level controllers for Overhead tank (1 Point)                                                                       | Multiple Checkbox | "Water Metering" (1 pt), "Automatic water level controllers" (1 pt)                                                                                                       |
| `np-efficient-envelope`          | Efficient Envelope                 | Credit    | 5          | Use efficient Wall and Roof assemblies.                                                                                                                                  | Multiple Checkbox | "Wall Assembly" (3 pts), "Roof Assembly" (2 pts)                                                                                                                          |
| `np-energy-efficient-appliances` | Energy Efficient Appliances        | Credit    | 4          | Procure 100% BEE / Energy Certified appliances.                                                                                                                          | Dropdown         | "1 Credit" (1 pt) up to "4 Credits" (4 pts)                                                                                                                               |
| `np-sun-shades`                  | Sun shades/ Chajjas                | Credit    | 1          | All exterior openings (fenestration) shall have sun shades/ chajjas of minimum 400 MM.                                                                                   | Checkbox         | "Achieved" (1 pt)                                                                                                                                                         |
| `np-alternate-hot-water`         | Alternate Hot Water system         | Credit    | 1          | Provide the alternate (Solar/LPG/CNG) hotwater system...                                                                                                                 | Checkbox         | "Achieved" (1 pt)                                                                                                                                                         |
| `np-renewable-energy`            | Renewable Energy                   | Credit    | 5          | Install an on-site renewable solar energy system. 0.5 kW (1 pt), 1.5 kW (3 pts), 2.5 kW (5 pts).                                                                         | Dropdown         | "0.5 kW" (1 pt), "1.5 kW" (3 pts), "2.5 kW" (5 pts)                                                                                                                         |
| `np-ev-charging`                 | Electric vehicle charging          | Credit    | 1          | Provide an electrical charging socket near to the vehicular parking area.                                                                                                | Checkbox         | "Achieved" (1 pt)                                                                                                                                                         |
| `np-kitchen-waste-composting`    | Kitchen waste composting           | Credit    | 1          | Provide khamba/compost pit for each home.                                                                                                                                | Checkbox         | "Achieved" (1 pt)                                                                                                                                                         |
| `np-green-procurement`           | Green Procurement - Ecolabelled    | Credit    | 7          | Use Green certified/GreenPro Construction Materials: (1 point for each; maximum 7 points).                                                                             | Dropdown         | "1 Material" (1 pt) up to "7 Materials" (7 pts)                                                                                                                           |
| `np-local-materials`             | Local Materials                    | Credit    | 3          | Procure materials from manufacturers within 500 KM range. 30% of total cost (1 pt), 40% (2 pts), 50% (3 pts).                                                              | Dropdown         | "30% of total cost" (1 pt), "40%" (2 pts), "50%" (3 pts)                                                                                                                    |
| `np-daylighting`                 | Daylighting                        | Credit    | 4          | Ensure a minimum daylighting of 110 Lux during the daytime in 25% (1 pt), 50% (2 pts), 75% (3 pts), or 95% (4 pts) of occupied areas.                                    | Dropdown         | "25% of areas" (1 pt), "50%" (2 pts), "75%" (3 pts), "95%" (4 pts)                                                                                                          |
| `np-ventilation`                 | Ventilation                        | Credit    | 3          | Provide openable windows that are 5% (1 pt), 7.5% (2 pts), or 10% (3 pts) of the total carpet area.                                                                      | Dropdown         | "5% of carpet area" (1 pt), "7.5%" (2 pts), "10%" (3 pts)                                                                                                                   |
| `np-exhaust-system`              | Exhaust System                     | Credit    | 2          | Provide exhaust systems in kitchen and bathrooms: Opening provision (1 pt) and Exhaust Fan (1 pt).                                                                       | Multiple Checkbox | "Opening provision" (1 pt), "Exhaust Fan" (1 pt)                                                                                                                          |
| `np-cross-ventilation`           | Cross Ventilation                  | Credit    | 3          | Ensure two openings in each space: Living room/Kitchen (1 pt) and Each Room (1 pt, max 2 pts).                                                                           | Multiple Checkbox | "Living room/Kitchen" (1 pt), "Room 1" (1 pt), "Room 2" (1 pt). Max score capped at 3.                                                                                   |
| `np-exterior-views`              | Exterior Views                     | Credit    | 3          | Ensure direct line of sight to the outside from each space: Living room/Kitchen (1 pt) and Each Room (1 pt, max 2 pts).                                                | Multiple Checkbox | "Living room/Kitchen" (1 pt), "Room 1" (1 pt), "Room 2" (1 pt). Max score capped at 3.                                                                                   |
| `np-house-automation`            | House Automation                   | Credit    | 3          | Install automation devices (1 pt each, max 3).                                                                                                                           | Multiple Checkbox | "Lighting Controls", "CCTV", "Solar meter", "Sensors", "Others". Each awards 1 pt (except "Others"). Max score capped at 3. Includes text area for "Others".              |
| `np-innovation-exemplary`        | Innovation & Exemplary             | Credit    | 5          | Achieve innovative and exemplary performance in the green building categories.                                                                                         | Dropdown         | "1 Credit" (1 pt) up to "5 Credits" (5 pts)                                                                                                                               |
| `np-igbc-ap`                     | IGBC Accredited Professional       | Credit    | 1          | Support and Encourage the involvement of IGBC Accrediated Professional /AP Associate in the project.                                                                   | Checkbox         | "Achieved" (1 pt)                                                                                                                                                         |

---

#### **B. NEST PLUS - Existing Building**
- **Max Score:** 61 Points
- **Certification Levels:** Certified (35+), Silver (45+), Gold (60+), Platinum (70+)

*(Includes all Mandatory criteria from New Building. Only Credit criteria that are different or not applicable are listed below.)*

| ID                               | Name                               | Type   | Max Points | Notes                                                                                                                                                |
| -------------------------------- | ---------------------------------- | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `np-passive-architecture-features` | Passive Architecture Features      | Credit | 2          | Max points are 2 instead of 4.                                                                                                                       |
| `np-top-soil-preservation`       | Top soil Preservation              | Credit | 0          | **Not applicable** to Existing Buildings.                                                                                                            |
| `np-vegetables-fruits`           | Vegetables / Fruits - 2 varieties  | Credit | 1          | Applicable only to Existing Buildings.                                                                                                               |
| `np-medicinal-plants`            | Medicinal Plants- 2 varieties      | Credit | 1          | Applicable only to Existing Buildings.                                                                                                               |
| `np-vehicle-shading`             | Vehicle shading                    | Credit | 1          | Applicable only to Existing Buildings.                                                                                                               |
| `np-bicycle-commuting`           | Bicycle for commuting              | Credit | 1          | Applicable only to Existing Buildings.                                                                                                               |
| `np-best-practices-construction` | Best Practices during Construction | Credit | 0          | **Not applicable** to Existing Buildings.                                                                                                            |
| `np-efficient-envelope`          | Efficient Envelope                 | Credit | 0          | **Not applicable** to Existing Buildings.                                                                                                            |
| `np-energy-efficient-appliances` | Energy Efficient Appliances        | Credit | 10         | Max points are 10 instead of 4. Dropdown options from "1 Credit" to "10 Credits".                                                                    |
| `np-green-procurement`           | Green Procurement - Ecolabelled    | Credit | 2          | Max points are 2 instead of 7. Dropdown options for "1 Material" and "2 Materials".                                                                  |
| `np-local-materials`             | Local Materials                    | Credit | 0          | **Not applicable** to Existing Buildings.                                                                                                            |
| `np-house-automation`            | House Automation                   | Credit | 2          | Max points are 2 instead of 3.                                                                                                                       |
| `np-green-housekeeping-chemicals`| Green House Keeping Chemicals      | Credit | 1          | Applicable only to Existing Buildings.                                                                                                               |
| `np-innovation-exemplary`        | Innovation & Exemplary             | Credit | 3          | Max points are 3 instead of 5.                                                                                                                       |

*(All other criteria are the same as NEST PLUS - New Building)*

---

#### **C. NEST - New Building**
- **Max Score:** 45 Points
- **Certification Levels:** Certified (20+), Silver (35+), Gold (40+), Platinum (45+)

| ID                               | Name                               | Type      | Max Points | Requirements                                                              | Selection Type   | Options / Notes                                                                                                                                           |
| -------------------------------- | ---------------------------------- | --------- | ---------- | ------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `n-local-building-regulations`   | Local Building Regulations         | Mandatory | 0          | Approved Plan from local municipal authority.                             | -                | -                                                                                                                                                         |
| `n-waste-segregation`            | Waste Segregation - Dry & Wet      | Mandatory | 0          | Provide 2 separate bins to collect dry and wet waste.                     | -                | -                                                                                                                                                         |
| `n-vegetation-or-indoor-plants`  | Vegetation or Indoor Plants        | Credit    | 4          | Vegetation 30 sq. ft, 50 sq. ft or Indoor Plant - 5 no., 10 no.           | Dropdown         | "Vegetation 30 sq.ft OR 5 Indoor Plants" (2 pts), "Vegetation 50 sq.ft OR 10 Indoor Plants" (4 pts)                                                      |
| `n-white-finish-roof`            | White finish/Vegetation over Roof  | Credit    | 2          | Use white finish or have vegetation over the roof.                        | Checkbox         | "Achieved" (2 pts)                                                                                                                                        |
| `n-rainwater-harvesting-reuse`   | Rainwater Harvesting and Reuse     | Credit    | 2          | System to capture rainwater and provision for reuse.                      | Checkbox         | "Achieved" (2 pts)                                                                                                                                        |
| `n-water-saving-fixtures`        | Water Saving Fixtures              | Credit    | 5          | Dual flush (2 pts), Tap aerators (1 pt), Shower aerators (1 pt), etc.     | Multiple Checkbox | Options for "Dual flush cistern" (2 pts), "Tap with aerators" (1 pt), "Showers with aerators" (1 pt), "Health faucet with aerators" (1 pt). Max capped at 5. |
| `n-water-metering-controllers`   | Water Metering, Controllers        | Credit    | 2          | Provide Water metering and Automatic water level controllers.             | Multiple Checkbox | "Water Metering" (1 pt), "Water Level Controllers" (1 pt)                                                                                                 |
| `n-efficient-envelope`           | Efficient Envelope                 | Credit    | 5          | Use efficient Wall and Roof assemblies.                                   | Multiple Checkbox | "Efficient Wall Assembly" (3 pts), "Efficient Roof Assembly" (2 pts)                                                                                      |
| `n-energy-efficient-appliances`  | Energy Efficient Appliances        | Credit    | 5          | Procure BEE / Energy Certified appliances.                                | Dropdown         | "1 Credit" (1 pt) up to "5 Credits" (5 pts)                                                                                                               |
| `n-renewable-energy`             | Renewable Energy                   | Credit    | 2          | Install on-site renewable energy. 0.5 kW (1 pt), 1 kW (2 pts).            | Dropdown         | "0.5 kW" (1 pt), "1 kW" (2 pts)                                                                                                                           |
| `n-green-procurement`            | Green Procurement - Ecolabelled    | Credit    | 5          | Use Green certified materials.                                            | Dropdown         | "1 Credit" (1 pt) up to "5 Credits" (5 pts)                                                                                                               |
| `n-daylighting`                  | Daylighting                        | Credit    | 6          | Ensure daylight in occupied areas. 25% (2 pts), 50% (4 pts), 75% (6 pts). | Dropdown         | "25% of areas" (2 pts), "50% of areas" (4 pts), "75% of areas" (6 pts)                                                                                      |
| `n-ventilation`                  | Ventilation                        | Credit    | 6          | Provide openable windows. 5% (2 pts), 7.5% (4 pts), 10% (6 pts) of area.  | Dropdown         | "5% of carpet area" (2 pts), "7.5% of carpet area" (4 pts), "10% of carpet area" (6 pts)                                                                   |
| `n-exhaust-system`               | Exhaust System                     | Credit    | 2          | Provide exhaust systems in kitchen and bathrooms.                         | Dropdown         | "1 Credit" (1 pt), "2 Credits" (2 pts)                                                                                                                    |
| `n-innovation-exemplary`         | Innovation & Exemplary             | Credit    | 3          | Achieve innovative and exemplary performance.                             | Dropdown         | "1 Credit" (1 pt), "2 Credits" (2 pts), "3 Credits" (3 pts)                                                                                               |
| `n-igbc-ap`                      | IGBC Accredited Professional       | Credit    | 1          | Involve an IGBC Accredited Professional/AP Associate.                     | Checkbox         | "Achieved" (1 pt)                                                                                                                                         |

---

#### **D. NEST - Existing Building**
- **Max Score:** 38 Points
- **Certification Levels:** Certified (20+), Silver (30+), Gold (35+), Platinum (40+)

*(Includes all Mandatory criteria. Only Credit criteria that are different or not applicable are listed below.)*

| ID                               | Name                          | Type   | Max Points | Notes                                                                     |
| -------------------------------- | ----------------------------- | ------ | ---------- | ------------------------------------------------------------------------- |
| `n-efficient-envelope`           | Efficient Envelope            | Credit | 0          | **Not applicable** to Existing Buildings.                                 |
| `n-energy-efficient-appliances`  | Energy Efficient Appliances   | Credit | 7          | Max points are 7 instead of 5. Dropdown up to "7 Credits".                |
| `n-sunshades-chajjas`            | Sunshades/ Chajjas            | Credit | 2          | Applicable only to Existing Buildings. "Achieved" (2 pts) checkbox.       |
| `n-green-procurement`            | Green Procurement - Ecolabelled | Credit | 2          | Max points are 2 instead of 5. Dropdown up to "2 Credits".                |
| `n-innovation-exemplary`         | Innovation & Exemplary        | Credit | 2          | Max points are 2 instead of 3. Dropdown up to "2 Credits".                |

*(All other criteria are the same as NEST - New Building)*

---

### 3.3. Project Score Panel

-   **Purpose:** To provide the user with real-time, immediate feedback on their certification progress as they make selections. This component is sticky, so it stays visible as the user scrolls.
-   **UI Elements:**
    -   **Card Title:** "Project Score"
    -   **Progress Bar:** A visual representation of `currentScore / maxScore`.
    -   **Certification Level Text:** Displays the name of the current achieved level (e.g., "Gold"). The color of the text dynamically changes to match the level's defined color (e.g., yellow for Gold).
    -   **Points Display:** A large text display showing `[currentScore] / [maxScore] Points`.
    -   **Levels Breakdown:** A list of all possible certification levels for the selected standard, showing the minimum points required for each.
-   **Logic (Real-time Calculation):**
    1.  A `useMemo` hook recalculates the score whenever the `selectedOptions` state changes.
    2.  The `getCriterionScore` function is called for every credit criterion. It determines the points for a given criterion based on the user's selection (dropdown value, checked boxes) and the predefined points in the data structure.
    3.  Special logic is applied for `np-basic-amenities` to count the number of selections.
    4.  The total score is summed up.
    5.  The `maxScore` is retrieved from the loaded `StandardData`.
    6.  The `certificationLevel` is determined by comparing the `currentScore` against the `minScore` thresholds defined in the `StandardData` levels array.

---

### 3.4. Actions Panel

-   **Purpose:** Provides primary actions the user can take once they have filled in the form data.
-   **UI Elements:**
    -   **Button: "Generate PDF Report"**
-   **Logic:**
    -   The button is **disabled** if the "Project Details" form is invalid or if a PDF is already being generated.
    -   On click, it triggers the `handleGeneratePDF` function, which orchestrates the entire client-side PDF creation process.
    -   A "Generating Report..." toast notification is displayed to the user.
