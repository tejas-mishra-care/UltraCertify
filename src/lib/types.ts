export type Criterion = {
  id: string;
  name: string;
  description: string;
  points: number;
};

export type CertificationLevel = {
  level: 'Certified' | 'Silver' | 'Gold' | 'Platinum' | 'Uncertified';
  minScore: number;
  color: string;
};

export type ProjectData = {
  projectName: string;
  projectAddress: string;
  ownerName: string;
  totalArea: number;
};

export type UploadedFile = {
  file: File;
  preview: string;
  dataURL: string;
};
