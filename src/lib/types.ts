
export type BuildingType = 'New' | 'Existing';
export type CertificationStandard = 'NEST' | 'NEST_PLUS';

export type CriterionOption = {
  label: string;
  points: number;
};

export type Criterion = {
  id: string;
  name: string;
  type: 'Mandatory' | 'Credit';
  requirements: string;
  documents: string;
  points: number | Record<BuildingType, number>;
  options?: CriterionOption[] | Record<BuildingType, CriterionOption[]>;
  selectionType?: 'multiple';
};

export type CertificationLevel = {
  level: 'Certified' | 'Silver' | 'Gold' | 'Platinum' | 'Uncertified';
  minScore: number;
  color: string;
};

export type StandardData = {
  criteria: Criterion[];
  levels: CertificationLevel[];
  maxScore: number;
};

export type CertificationData = {
  [key in CertificationStandard]: {
    [key in BuildingType]: StandardData;
  };
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
  certificationStandard: CertificationStandard;
};

export type UploadedFile = {
  file: File;
  preview: string;
  dataURL: string;
  description: string;
  latitude?: number;
  longitude?: number;
};
