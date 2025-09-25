
import type { CertificationData, Criterion } from './types';

const nestPlusCriteria: Criterion[] = [
  // Mandatory Criteria
  {
    id: 'np-local-building-regulations',
    name: 'Local Building Regulations',
    type: 'Mandatory',
    requirements: 'Approved Plan from local municipal authority.',
    documents: 'Approved Plans',
    points: 0,
  },
  {
    id: 'np-waste-segregation',
    name: 'Waste Segregation - Dry & Wet',
    type: 'Mandatory',
    requirements: 'Provide 2 separate bins to collect dry and wet waste.',
    documents: 'Photographs of 2 separate bins.',
    points: 0,
  },
  {
    id: 'np-rainwater-harvesting-500l',
    name: 'Rainwater Harvesting 500 Liters',
    type: 'Mandatory',
    requirements: 'System to capture at least 500 litres from site runoff.',
    documents: 'Photograph of rainwater harvesting pits.',
    points: 0,
  },
  // Credit Criteria
  {
    id: 'np-passive-architecture-features',
    name: 'Passive Architecture Features',
    type: 'Credit',
    requirements: 'Provide any two features mentioned below. For each feature two points (max 4 points): 1. Courtyard 2. Vernacular materials 3. Local Vernacular Elements 4. Any other passive cooling/Heating system 5. Skylights',
    documents: 'Concept description and photographs.',
    points: { New: 4, Existing: 2 },
    options: {
      New: [
        { label: 'One Feature', points: 2 },
        { label: 'Two Features', points: 4 },
      ],
      Existing: [
        { label: 'One Feature', points: 1 },
        { label: 'Two Features', points: 2 },
      ]
    }
  },
  {
    id: 'np-top-soil-preservation',
    name: 'Top soil Preservation',
    type: 'Credit',
    requirements: 'Preserve top 150-200 mm of soil during excavation.',
    documents: 'Photographs of top soil preservation.',
    points: { New: 1, Existing: 0 },
  },
  {
    id: 'np-passive-architecture-setbacks',
    name: 'Passive Architecture (Setbacks)',
    type: 'Credit',
    requirements: 'Provide minimum of 3 ft setback or as per local norms whichever is higher on 2 sides (1 point) More than 2 sides (2 points)',
    documents: 'Photographs of setback areas.',
    points: 2,
    options: [
        { label: '2 sides', points: 1 },
        { label: 'More than 2 sides', points: 2 },
    ]
  },
  {
    id: 'np-basic-amenities',
    name: 'Basic Amenities',
    type: 'Credit',
    requirements: 'Access to at least five basic amenities within a 1 km walk.',
    documents: 'Google map showing the distance to amenities.',
    points: 2,
  },
  {
    id: 'np-vegetation-natural-topography',
    name: 'Vegetation and Natural Topography',
    type: 'Credit',
    requirements: 'Provide the vegetation either on Ground/ built - up structures as follows: 30 sq.ft - 1 Point, 50 sq.ft - 2 Points, 75 sq.ft - 3 Points, 100 sq.ft - 4 Points. Note: 1. For the Terrace Landscaping only permenant structures are considered. 2. Potted Plants are not considered. 3. 125sq.ft and above qualifies for exemplary/Innovation',
    documents: 'Photographs of landscape; area details.',
    points: 4,
    options: [
        { label: '30 sq.ft', points: 1 },
        { label: '50 sq.ft', points: 2 },
        { label: '75 sq.ft', points: 3 },
        { label: '100 sq.ft', points: 4 },
    ]
  },
  {
    id: 'np-vegetables-fruits',
    name: 'Vegetables / Fruits - 2 varieties',
    type: 'Credit',
    requirements: 'Grow a minimum of two vegetable/fruit species.',
    documents: 'Photographs of the plants.',
    points: { New: 0, Existing: 1 },
  },
  {
    id: 'np-medicinal-plants',
    name: 'Medicinal Plants- 2 varieties',
    type: 'Credit',
    requirements: 'Grow a minimum of two medicinal species.',
    documents: 'Photographs of the plants.',
    points: { New: 0, Existing: 1 },
  },
  {
    id: 'np-indoor-plants',
    name: 'Indoor Plants - 5 Plants (Minimum)',
    type: 'Credit',
    requirements: 'Grow a minimum of 5 indoor plants.',
    documents: 'Photographs and a list of the plants.',
    points: 1,
  },
  {
    id: 'np-vehicle-shading',
    name: 'Vehicle shading',
    type: 'Credit',
    requirements: 'Provide shade for vehicles via tree shade or covered parking.',
    documents: 'Photographs of the vehicle shading.',
    points: { New: 0, Existing: 1 },
  },
  {
    id: 'np-bicycle-commuting',
    name: 'Bicycle for commuting',
    type: 'Credit',
    requirements: 'Use at least one bicycle and provide dedicated parking.',
    documents: 'Photographs of bicycle in its parking space.',
    points: { New: 0, Existing: 1 },
  },
  {
    id: 'np-e-vehicle',
    name: 'E-Vehicle/Renewable fuel vehicle',
    type: 'Credit',
    requirements: 'Use at least one E-vehicle, CNG, LPG, or other renewable fuel vehicle.',
    documents: 'Photographs and registration certificate.',
    points: 1,
  },
  {
    id: 'np-best-practices-construction',
    name: 'Best Practices during Construction',
    type: 'Credit',
    requirements: 'Implement measures during construction (Barrication, Dust Suppression, etc.). Any 2 measures - 1 Point. Any 4 measures - 2 Points.',
    documents: 'Photographs of each measure.',
    points: { New: 2, Existing: 0 },
    options: [
        { label: 'Any 2 measures', points: 1 },
        { label: 'Any 4 measures', points: 2 },
    ]
  },
  {
    id: 'np-white-finish',
    name: 'White finish',
    type: 'Credit',
    requirements: 'Use materials like china mosaic or light-colored paint for the roof.',
    documents: 'Photograph of the roof area finish.',
    points: 2,
  },
  {
    id: 'np-enhanced-rainwater-harvesting',
    name: 'Enhanced Rainwater Harvesting and Reuse',
    type: 'Credit',
    requirements: 'Rainwater harvesting system to capture at least 750 Litres (2 points) & Reuse provision for harvested water (2 points). Note: For an existing well or borewell the project shall be awarded 4 points.',
    documents: 'Photograph of pits and reuse application.',
    points: 4,
    selectionType: 'multiple',
    options: [
        { label: 'Harvesting (750L)', points: 2 },
        { label: 'Reuse provision', points: 2 },
        { label: 'Existing Well / Borewell', points: 4 },
    ]
  },
  {
    id: 'np-water-saving-fixtures',
    name: 'Water Saving Fixtures',
    type: 'Credit',
    requirements: 'Provide efficient water fixtures: Dual flush cistern (3 pts), Tap with aerators (2 pts), Showers with aerators (2 pts), Health faucet with aerators (1 pt)',
    documents: 'Photographs of fixtures.',
    points: 8,
    selectionType: 'multiple',
    options: [
        { label: 'Dual flush cistern', points: 3 },
        { label: 'Tap with aerators', points: 2 },
        { label: 'Showers with aerators', points: 2 },
        { label: 'Health faucet with aerators', points: 1 },
    ]
  },
  {
    id: 'np-water-metering-controllers',
    name: 'Water Metering, Water Level Controllers',
    type: 'Credit',
    requirements: 'Provide Water metering (1 Point) and Automatic water level controllers for Overhead tank (1 Point)',
    documents: 'Photographs of the meter and controllers.',
    points: 2,
    selectionType: 'multiple',
    options: [
      { label: 'Water Metering', points: 1 },
      { label: 'Automatic water level controllers', points: 1 }
    ]
  },
  {
    id: 'np-efficient-envelope',
    name: 'Efficient Envelope',
    type: 'Credit',
    requirements: 'Use efficient Wall (3 pts) and Roof (2 pts) assemblies.',
    documents: 'Construction photos and roof details.',
    points: { New: 5, Existing: 0 },
    selectionType: 'multiple',
    options: [
        { label: 'Wall Assembly', points: 3 },
        { label: 'Roof Assembly', points: 2 },
    ]
  },
  {
    id: 'np-energy-efficient-appliances',
    name: 'Energy Efficient Appliances',
    type: 'Credit',
    requirements: 'Procure 100% BEE / Energy Certified appliances.',
    documents: 'Photographs of appliances with star ratings.',
    points: { New: 4, Existing: 10 },
    selectionType: 'multiple',
    options: {
      New: [
        { label: 'LED lights', points: 1 },
        { label: '3 Star Energy efficient fans', points: 2 },
        { label: 'Inverter based Refrigerator', points: 1 },
      ],
      Existing: [
        { label: 'LED lights', points: 2 },
        { label: '3 Star Energy efficient fans', points: 3 },
        { label: 'Inverter based Refrigerator', points: 1 },
        { label: '3 Star Inverter Air conditioner', points: 1 },
        { label: '5 Star Inverter Air conditioner', points: 2 },
        { label: 'Any other energy efficient appliances', points: 1 },
      ]
    }
  },
  {
    id: 'np-sun-shades',
    name: 'Sun shades/ Chajjas',
    type: 'Credit',
    requirements: 'All exterior openings must have sun shades of a minimum of 400 mm.',
    documents: 'Photographs of chajjas/sunshades.',
    points: 1,
  },
  {
    id: 'np-alternate-hot-water',
    name: 'Alternate Hot Water system',
    type: 'Credit',
    requirements: 'Provide Solar/LPG/CNG hot water system for 100% of occupants.',
    documents: 'Photographs and technical cutsheets.',
    points: 1,
  },
  {
    id: 'np-renewable-energy',
    name: 'Renewable Energy',
    type: 'Credit',
    requirements: 'Install an on-site renewable solar energy system. 0.5 kW (1 pt), 1.5 kW (3 pts), 2.5 kW (5 pts).',
    documents: 'Purchase invoice and photos of panels.',
    points: 5,
    options: [
        { label: '0.5 kW', points: 1 },
        { label: '1.5 kW', points: 3 },
        { label: '2.5 kW', points: 5 },
    ]
  },
  {
    id: 'np-ev-charging',
    name: 'Electric vehicle charging',
    type: 'Credit',
    requirements: 'Provide an electrical charging socket (min 16A) near parking.',
    documents: 'Photographs of the charging socket.',
    points: 1,
  },
  {
    id: 'np-kitchen-waste-composting',
    name: 'Kitchen waste composting',
    type: 'Credit',
    requirements: 'Provide a khamba/compost pit and utilize the manure.',
    documents: 'Photographs of the compost pit.',
    points: 1,
  },
  {
    id: 'np-green-procurement',
    name: 'Green Procurement - Ecolabelled',
    type: 'Credit',
    requirements: {
      New: 'Use Green certified materials (1 pt each, max 7).',
      Existing: 'Use Green certified materials (1 pt each, max 2).'
    },
    documents: 'Photos, cutsheets, and invoices.',
    points: { New: 7, Existing: 2 },
    options: {
        New: [
            { label: '1 Credit', points: 1 },
            { label: '2 Credits', points: 2 },
            { label: '3 Credits', points: 3 },
            { label: '4 Credits', points: 4 },
            { label: '5 Credits', points: 5 },
            { label: '6 Credits', points: 6 },
            { label: '7 Credits', points: 7 },
        ],
        Existing: [
            { label: '1 Credit', points: 1 },
            { label: '2 Credits', points: 2 },
        ]
    }
  },
  {
    id: 'np-local-materials',
    name: 'Local Materials',
    type: 'Credit',
    requirements: 'Procure materials from manufacturers within 500 KM range. 30% of total cost (1 pt), 40% (2 pts), 50% (3 pts).',
    documents: 'Costing sheet and Google map.',
    points: { New: 3, Existing: 0 },
     options: [
        { label: '30% of total cost', points: 1 },
        { label: '40% of total cost', points: 2 },
        { label: '50% of total cost', points: 3 },
    ]
  },
  {
    id: 'np-daylighting',
    name: 'Daylighting',
    type: 'Credit',
    requirements: 'Ensure 110 Lux daylight in 25% (1 pt) up to 95% (4 pts) of occupied areas.',
    documents: 'Floor plans, photos, and calculation template.',
    points: 4,
    options: [
        { label: '25% of areas', points: 1 },
        { label: '50% of areas', points: 2 },
        { label: '75% of areas', points: 3 },
        { label: '95% of areas', points: 4 },
    ]
  },
  {
    id: 'np-ventilation',
    name: 'Ventilation',
    type: 'Credit',
    requirements: 'Provide openable windows that are 5% (1 pt) up to 10% (3 pts) of the carpet area.',
    documents: 'Floor plans, photos, and calculation template.',
    points: 3,
    options: [
        { label: '5% of carpet area', points: 1 },
        { label: '7.5% of carpet area', points: 2 },
        { label: '10% of carpet area', points: 3 },
    ]
  },
  {
    id: 'np-exhaust-system',
    name: 'Exhaust System',
    type: 'Credit',
    requirements: 'Provide exhaust systems in kitchen and bathrooms: Opening (1 pt) and Fan (1 pt).',
    documents: 'Photographs of openings and fans.',
    points: 2,
    selectionType: 'multiple',
    options: [
      { label: 'Opening provision', points: 1 },
      { label: 'Exhaust Fan', points: 1 },
    ]
  },
  {
    id: 'np-cross-ventilation',
    name: 'Cross Ventilation',
    type: 'Credit',
    requirements: 'Ensure two openings in each space. Living room/Kitchen (1 point), Each Room (1 Point, Max 2)',
    documents: 'Floor plans and photographs of openings.',
    points: 3,
    selectionType: 'multiple',
    options: [
      { label: 'Living room/Kitchen', points: 1 },
      { label: 'Room 1', points: 1 },
      { label: 'Room 2', points: 1 },
    ]
  },
  {
    id: 'np-exterior-views',
    name: 'Exterior Views',
    type: 'Credit',
    requirements: 'Ensure a direct line of sight to the outside from each space. Living room/Kitchen (1 point), Each Room (1 Point, Max 2)',
    documents: 'Photographs of exterior views.',
    points: 3,
    selectionType: 'multiple',
    options: [
      { label: 'Living room/Kitchen', points: 1 },
      { label: 'Room 1', points: 1 },
      { label: 'Room 2', points: 1 },
    ]
  },
  {
    id: 'np-house-automation',
    name: 'House Automation',
    type: 'Credit',
    requirements: 'Install automation devices (1 pt each, max 3 for new, max 2 for existing).',
    documents: 'Technical cutsheets and photographs.',
    points: { New: 3, Existing: 2 },
    selectionType: 'multiple',
    options: [
      { label: 'Lighting Controls', points: 1 },
      { label: 'CCTV', points: 1 },
      { label: 'Solar meter', points: 1 },
      { label: 'Sensors', points: 1 },
    ]
  },
  {
    id: 'np-green-housekeeping-chemicals',
    name: 'Green House Keeping Chemicals',
    type: 'Credit',
    requirements: 'Procure green certified/organic housekeeping chemicals.',
    documents: 'Photographs and purchase invoices.',
    points: { New: 0, Existing: 1 },
  },
  {
    id: 'np-innovation-exemplary',
    name: 'Innovation & Exemplary',
    type: 'Credit',
    requirements: 'Achieve innovative and exemplary performance.',
    documents: 'Supporting proof documents.',
    points: { New: 5, Existing: 3 },
    options: {
      New: [
        { label: '1 Credit', points: 1 },
        { label: '2 Credits', points: 2 },
        { label: '3 Credits', points: 3 },
        { label: '4 Credits', points: 4 },
        { label: '5 Credits', points: 5 },
      ],
      Existing: [
        { label: '1 Credit', points: 1 },
        { label: '2 Credits', points: 2 },
        { label: '3 Credits', points: 3 },
      ],
    },
  },
  {
    id: 'np-igbc-ap',
    name: 'IGBC Accredited Professional / Associate',
    type: 'Credit',
    requirements: 'Involve an IGBC Accredited Professional/AP Associate.',
    documents: 'IGBC AP Certificate.',
    points: 1,
  },
];

const nestCriteria: Criterion[] = [
    // Mandatory
    {
        id: 'n-local-building-regulations',
        name: 'Local Building Regulations',
        type: 'Mandatory',
        requirements: 'Approved Plan from local municipal authority.',
        documents: 'Approved Plans.',
        points: 0,
    },
    {
        id: 'n-waste-segregation',
        name: 'Waste Segregation - Dry & Wet',
        type: 'Mandatory',
        requirements: 'Provide 2 separate bins to collect dry and wet waste.',
        documents: 'Photographs of 2 separate bins.',
        points: 0,
    },
    // Credit
    {
        id: 'n-vegetation-or-indoor-plants',
        name: 'Vegetation or Indoor Plants',
        type: 'Credit',
        requirements: 'Vegetation 30 sq. ft, 50 sq. ft or Indoor Plant - 5 no., 10 no.',
        documents: 'Photographs of vegetation/plants.',
        points: 4,
        options: [
            { label: 'Vegetation 30 sq.ft OR 5 Indoor Plants', points: 2 },
            { label: 'Vegetation 50 sq.ft OR 10 Indoor Plants', points: 4 },
        ],
    },
    {
        id: 'n-white-finish-roof',
        name: 'White finish/Vegetation over Roof',
        type: 'Credit',
        requirements: 'Use white finish or have vegetation over the roof.',
        documents: 'Photograph of the roof area finish.',
        points: 2,
    },
    {
        id: 'n-rainwater-harvesting-reuse',
        name: 'Rainwater Harvesting and Reuse',
        type: 'Credit',
        requirements: 'System to capture rainwater and provision for reuse.',
        documents: 'Photograph of pits and reuse application.',
        points: 2,
    },
    {
        id: 'n-water-saving-fixtures',
        name: 'Water Saving Fixtures',
        type: 'Credit',
        requirements: 'Provide efficient water fixtures.',
        documents: 'Photographs of fixtures.',
        points: 5,
        selectionType: 'multiple',
        options: [
            { label: 'Dual flush cistern (2 pts)', points: 2 },
            { label: 'Tap with aerators (1 pt)', points: 1 },
            { label: 'Showers with aerators (1 pt)', points: 1 },
            { label: 'Health faucet with aerators (1 pt)', points: 1 },
        ]
    },
    {
        id: 'n-water-metering-controllers',
        name: 'Water Metering, Water Level Controllers',
        type: 'Credit',
        requirements: 'Provide Water metering and Automatic water level controllers.',
        documents: 'Photographs of the meter and controllers.',
        points: 2,
        selectionType: 'multiple',
        options: [
            { label: 'Water Metering', points: 1 },
            { label: 'Water Level Controllers', points: 1 },
        ]
    },
    {
        id: 'n-efficient-envelope',
        name: 'Efficient Envelope',
        type: 'Credit',
        requirements: 'Use efficient Wall and Roof assemblies.',
        documents: 'Construction photos and roof details.',
        points: { New: 5, Existing: 0 },
        selectionType: 'multiple',
        options: [
            { label: 'Efficient Wall Assembly', points: 3 },
            { label: 'Efficient Roof Assembly', points: 2 },
        ]
    },
    {
        id: 'n-energy-efficient-appliances',
        name: 'Energy Efficient Appliances',
        type: 'Credit',
        requirements: 'Procure BEE / Energy Certified appliances.',
        documents: 'Photographs of appliances with star ratings.',
        points: { New: 5, Existing: 7 },
        options: {
            New: [
                { label: '0 Credits', points: 0 },
                { label: '1 Credit', points: 1 },
                { label: '2 Credits', points: 2 },
                { label: '3 Credits', points: 3 },
                { label: '4 Credits', points: 4 },
                { label: '5 Credits', points: 5 },
            ],
            Existing: [
                { label: '0 Credits', points: 0 },
                { label: '1 Credit', points: 1 },
                { label: '2 Credits', points: 2 },
                { label: '3 Credits', points: 3 },
                { label: '4 Credits', points: 4 },
                { label: '5 Credits', points: 5 },
                { label: '6 Credits', points: 6 },
                { label: '7 Credits', points: 7 },
            ]
        }
    },
    {
        id: 'n-sunshades-chajjas',
        name: 'Sunshades/ Chajjas',
        type: 'Credit',
        requirements: 'All exterior openings must have sun shades.',
        documents: 'Photographs of chajjas/sunshades.',
        points: { New: 0, Existing: 2 },
    },
    {
        id: 'n-renewable-energy',
        name: 'Renewable Energy',
        type: 'Credit',
        requirements: 'Install on-site renewable energy. 0.5 kW (1 pt), 1 kW (2 pts).',
        documents: 'Purchase invoice and photos of panels.',
        points: 2,
        options: [
            { label: '0.5 kW', points: 1 },
            { label: '1 kW', points: 2 },
        ]
    },
    {
        id: 'n-green-procurement',
        name: 'Green Procurement - Ecolabelled',
        type: 'Credit',
        requirements: "Use Green certified materials.",
        documents: 'Photos, cutsheets, and invoices.',
        points: { New: 5, Existing: 2 },
        options: {
            New: [
                { label: '1 Credit', points: 1 },
                { label: '2 Credits', points: 2 },
                { label: '3 Credits', points: 3 },
                { label: '4 Credits', points: 4 },
                { label: '5 Credits', points: 5 },
            ],
            Existing: [
                { label: '1 Credit', points: 1 },
                { label: '2 Credits', points: 2 },
            ]
        }
    },
    {
        id: 'n-daylighting',
        name: 'Daylighting',
        type: 'Credit',
        requirements: 'Ensure daylight in occupied areas. 25% (2 pts), 50% (4 pts), 75% (6 pts).',
        documents: 'Floor plans, photos, and calculation template.',
        points: 6,
        options: [
            { label: '25% of areas', points: 2 },
            { label: '50% of areas', points: 4 },
            { label: '75% of areas', points: 6 },
        ]
    },
    {
        id: 'n-ventilation',
        name: 'Ventilation',
        type: 'Credit',
        requirements: 'Provide openable windows. 5% (2 pts), 7.5% (4 pts), 10% (6 pts) of carpet area.',
        documents: 'Floor plans, photos, and calculation template.',
        points: 6,
        options: [
            { label: '5% of carpet area', points: 2 },
            { label: '7.5% of carpet area', points: 4 },
            { label: '10% of carpet area', points: 6 },
        ]
    },
    {
        id: 'n-exhaust-system',
        name: 'Exhaust System',
        type: 'Credit',
        requirements: 'Provide exhaust systems in kitchen and bathrooms.',
        documents: 'Photographs of openings and fans.',
        points: 2,
        options: [
            { label: '1 Credit', points: 1 },
            { label: '2 Credits', points: 2 },
        ]
    },
    {
        id: 'n-innovation-exemplary',
        name: 'Innovation & Exemplary',
        type: 'Credit',
        requirements: 'Achieve innovative and exemplary performance.',
        documents: 'Supporting proof documents.',
        points: { New: 3, Existing: 2 },
        options: {
            New: [
                { label: '1 Credit', points: 1 },
                { label: '2 Credits', points: 2 },
                { label: '3 Credits', points: 3 },
            ],
            Existing: [
                { label: '1 Credit', points: 1 },
                { label: '2 Credits', points: 2 },
            ]
        }
    },
    {
        id: 'n-igbc-ap',
        name: 'IGBC Accredited Professional / Associate',
        type: 'Credit',
        requirements: 'Involve an IGBC Accredited Professional/AP Associate.',
        documents: 'IGBC AP Certificate.',
        points: 1,
    },
];

const filterAndGetMaxScore = (criteria: Criterion[], buildingType: 'New' | 'Existing') => {
    const filtered = criteria.filter(c => {
        const points = c.points;
        if (typeof points === 'number') return true;
        // Keep the criterion if it's mandatory OR if it has points for the building type
        if (c.type === 'Mandatory') return true;
        return (points[buildingType] || 0) > 0;
    });

    const maxScore = filtered.reduce((acc, c) => {
        if (c.type === 'Credit') {
            const points = typeof c.points === 'number' ? c.points : c.points[buildingType];
            return acc + (points || 0);
        }
        return acc;
    }, 0);

    return { criteria: filtered, maxScore };
};

const { criteria: nestPlusNewCriteria, maxScore: nestPlusNewMaxScore } = filterAndGetMaxScore(nestPlusCriteria, 'New');
const { criteria: nestPlusExistingCriteria, maxScore: nestPlusExistingMaxScore } = filterAndGetMaxScore(nestPlusCriteria, 'Existing');
const { criteria: nestNewCriteria, maxScore: nestNewMaxScore } = filterAndGetMaxScore(nestCriteria, 'New');
const { criteria: nestExistingCriteria, maxScore: nestExistingMaxScore } = filterAndGetMaxScore(nestCriteria, 'Existing');


export const certificationData: CertificationData = {
    NEST_PLUS: {
        New: {
            criteria: nestPlusNewCriteria,
            maxScore: nestPlusNewMaxScore,
            levels: [
                { level: 'Certified', minScore: 40, color: 'text-green-500' },
                { level: 'Silver', minScore: 50, color: 'text-gray-500' },
                { level: 'Gold', minScore: 65, color: 'text-yellow-500' },
                { level: 'Platinum', minScore: 75, color: 'text-blue-400' },
            ]
        },
        Existing: {
            criteria: nestPlusExistingCriteria,
            maxScore: nestPlusExistingMaxScore,
            levels: [
                { level: 'Certified', minScore: 35, color: 'text-green-500' },
                { level: 'Silver', minScore: 45, color: 'text-gray-500' },
                { level: 'Gold', minScore: 60, color: 'text-yellow-500' },
                { level: 'Platinum', minScore: 70, color: 'text-blue-400' },
            ]
        }
    },
    NEST: {
        New: {
            criteria: nestNewCriteria,
            maxScore: nestNewMaxScore,
            levels: [
                { level: 'Certified', minScore: 20, color: 'text-green-500' },
                { level: 'Silver', minScore: 35, color: 'text-gray-500' },
                { level: 'Gold', minScore: 40, color: 'text-yellow-500' },
                { level: 'Platinum', minScore: 45, color: 'text-blue-400' },
            ]
        },
        Existing: {
            criteria: nestExistingCriteria,
            maxScore: nestExistingMaxScore,
            levels: [
                { level: 'Certified', minScore: 20, color: 'text-green-500' },
                { level: 'Silver', minScore: 30, color: 'text-gray-500' },
                { level: 'Gold', minScore: 35, color: 'text-yellow-500' },
                { level: 'Platinum', minScore: 40, color: 'text-blue-400' },
            ]
        }
    }
};
