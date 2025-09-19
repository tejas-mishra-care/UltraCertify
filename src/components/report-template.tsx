import React from 'react';
import Image from 'next/image';
import type { ProjectData, UploadedFile } from '@/lib/types';
import { criteria } from '@/lib/certification-data';
import { CheckCircle2, Circle } from 'lucide-react';

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
  const buildingType = projectData.buildingType;
  const achievedCriteria = criteria.filter(c => files[c.id] && c.applicability[buildingType]);

  return (
    <div className="bg-white text-black p-8 font-sans">
      <header className="border-b-2 border-gray-800 pb-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">UltraCertify Report</h1>
        <p className="text-lg text-gray-600">IGBC's NEST PLUS Ver 1.0 - Green Building Certification Summary</p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4 text-gray-700">Project Details</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div><strong className="text-gray-600">Registration Number:</strong> {projectData.registrationNumber}</div>
          <div><strong className="text-gray-600">Owner Name:</strong> {projectData.ownerName}</div>
          <div><strong className="text-gray-600">Building Type:</strong> {projectData.buildingType}</div>
          <div><strong className="text-gray-600">Permission Authority:</strong> {projectData.permissionAuthority}</div>
          <div><strong className="text-gray-600">Project Location:</strong> {projectData.projectLocation}</div>
          <div><strong className="text-gray-600">Address:</strong> {projectData.fullAddress}</div>
          <div><strong className="text-gray-600">Number of Floors:</strong> {projectData.numberOfFloors}</div>
          <div><strong className="text-gray-600">Total Site Area:</strong> {projectData.totalSiteArea} sq. m</div>
          <div><strong className="text-gray-600">Total Built-up Area:</strong> {projectData.totalBuiltUpArea} sq. m</div>
          <div><strong className="text-gray-600">Landscape Area:</strong> {projectData.landscapeArea} sq. m</div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4 text-gray-700">Certification Summary</h2>
        <div className="bg-gray-100 p-6 rounded-lg flex justify-around items-center">
          <div>
            <div className="text-gray-600">Total Score</div>
            <div className="text-4xl font-bold text-gray-800">{score} / {maxScore}</div>
          </div>
          <div className="w-px h-16 bg-gray-300"></div>
          <div>
            <div className="text-gray-600">Certification Level</div>
            <div className="text-4xl font-bold text-blue-800">{level}</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4 text-gray-700">Achieved Criteria</h2>
        <div className="space-y-6">
          {achievedCriteria.length > 0 ? (
            achievedCriteria.map(criterion => (
              <div key={criterion.id} className="p-4 border rounded-lg bg-gray-50 break-inside-avoid">
                <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        {criterion.type === 'Mandatory' ? <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" /> : <CheckCircle2 className="w-5 h-5 text-blue-600 mr-2" />}
                        {criterion.name}
                     </h3>
                     <p className="text-xs font-semibold text-gray-500 uppercase">{criterion.type}</p>
                     <p className="text-gray-600 mt-1 text-sm">{criterion.requirements}</p>
                     {criterion.type === 'Credit' && (
                       <p className="text-sm font-semibold text-blue-800 mt-1">Points Awarded: {typeof criterion.points === 'number' ? criterion.points : criterion.points[buildingType]}</p>
                     )}
                  </div>
                  {files[criterion.id] && (
                    <div className="w-32 h-32 ml-4 relative shrink-0">
                      <Image
                        src={files[criterion.id].preview}
                        alt={`Evidence for ${criterion.name}`}
                        fill
                        className="object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No criteria have been met.</p>
          )}
        </div>
      </section>

      <footer className="mt-12 pt-4 text-center text-xs text-gray-500 border-t">
        Report generated by UltraCertify on {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
};
