
export type BuildingType = 'New' | 'Existing';

export type CriterionOption = {
  label: string;
  points: number;
};

export type Criterion = {
  id: string;
  name: string;
  applicability: Record<BuildingType, boolean>;
  type: 'Mandatory' | 'Credit';
  requirements: string;
  documents: string;
  points: number | Record<BuildingType, number>;
  options?: CriterionOption[] | Record<BuildingType, CriterionOption[]>;
  selectionType?: 'multiple';
};

export type CertificationLevel = {
  level: 'Certified' | 'Silver' | 'Gold' | 'Uncertified';
  minScore: Record<BuildingType, number>;
  color: string;
};

export type ProjectData = {
  registrationNumber: string;
  ownerName: string;
  mobileNumber: string;
  emailAddress: string;
  projectLocation: string;
  fullAddress: string;
  permissionAuthority: string;
  numberOfFloors: number;
  totalSiteArea: number;
  totalBuiltUpArea: number;
  landscapeArea: number;
  projectType: string;
  twoWheelerParking: number;
  buildingType: BuildingType;
};

export type UploadedFile = {
  file: File;
  preview: string;
  dataURL: string;
};
