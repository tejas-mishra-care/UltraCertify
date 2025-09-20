// This file is no longer used for PDF generation and can be removed or kept for reference.
// The PDF is now generated programmatically in src/app/page.tsx using the jsPDF library.
// This new method allows for higher quality, text-selectable PDFs and better control over the layout.

import React from 'react';
import type { ProjectData, UploadedFile } from '@/lib/types';
import { criteria } from '@/lib/certification-data';

interface ReportTemplateProps {
  projectData: ProjectData;
  files: Record<string, UploadedFile>;
  score: number;
  maxScore: number;
  level: string;
}

export const ReportTemplate: React.FC<ReportTemplateProps> = ({
  projectData,
  files,
  score,
  maxScore,
  level,
}) => {
  return (
    <div>
        This component is a placeholder and is not actively used for PDF generation. 
        The PDF generation logic has been moved to the main page component for a more robust implementation.
    </div>
  );
};

    