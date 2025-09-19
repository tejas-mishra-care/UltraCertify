export type BuildingType = 'New' | 'Existing';

export type Criterion = {
  id: string;
  name: string;
  applicability: Record<BuildingType, boolean>;
  type: 'Mandatory' | 'Credit';
  requirements: string;
  documents: string;
  points: number | Record<BuildingType, number>;
};

export type CertificationLevel = {
  level: 'Certified' | 'Silver' | 'Gold' | 'Uncertified';
  minScore: Record<BuildingType, number>;
  color: string;
};

export type ProjectData = {
  registrationNumber: string;
  ownerName: string;
  projectLocation: string;
  fullAddress: string;
  permissionAuthority: string;
  numberOfFloors: number;
  totalSiteArea: number;
  totalBuiltUpArea: number;
  landscapeArea: number;
  buildingType: BuildingType;
};

export type UploadedFile = {
  file: File;
  preview: string;
  dataURL: string;
};
