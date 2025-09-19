import type { Criterion, CertificationLevel } from './types';

export const criteria: Criterion[] = [
  {
    id: 'sustainable-sites',
    name: 'Sustainable Sites',
    description: 'Credit for selecting a site that reduces environmental impact.',
    points: 10,
  },
  {
    id: 'water-efficiency',
    name: 'Water Efficiency',
    description: 'Credit for using water-efficient landscaping and plumbing fixtures.',
    points: 10,
  },
  {
    id: 'energy-atmosphere',
    name: 'Energy & Atmosphere',
    description: 'Credit for optimizing energy performance and using renewable energy.',
    points: 20,
  },
  {
    id: 'materials-resources',
    name: 'Materials & Resources',
    description: 'Credit for using sustainable building materials and reducing waste.',
    points: 15,
  },
  {
    id: 'indoor-quality',
    name: 'Indoor Environmental Quality',
    description: 'Credit for improving indoor air quality and providing daylight and views.',
    points: 15,
  },
  {
    id: 'innovation',
    name: 'Innovation',
    description: 'Credit for innovative performance in green building categories.',
    points: 5,
  },
  {
    id: 'regional-priority',
    name: 'Regional Priority',
    description: 'Credit for addressing geographically-specific environmental priorities.',
    points: 5,
  },
];

export const certificationLevels: CertificationLevel[] = [
  { level: 'Certified', minScore: 40, color: 'text-blue-500' },
  { level: 'Silver', minScore: 50, color: 'text-gray-500' },
  { level: 'Gold', minScore: 60, color: 'text-yellow-500' },
  { level: 'Platinum', minScore: 80, color: 'text-teal-500' },
];
