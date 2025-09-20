
"use client";

import type { FC } from "react";
import React, { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import jsPDF from 'jspdf';
import {
  Building,
  Ruler,
  User,
  MapPin,
  CheckCircle2,
  Lightbulb,
  FileDown,
  Loader2,
  Sparkles,
  Award,
  Hash,
  Map,
  Building2,
  Layers,
  Trees,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


import type { UploadedFile, ProjectData, CriterionOption, Criterion } from "@/lib/types";
import { criteria, certificationLevels } from "@/lib/certification-data";
import { getAISuggestions } from "@/app/actions";
import { ImageUploader } from "@/components/image-uploader";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  projectLocation: z.string().min(1, "Project location is required"),
  fullAddress: z.string().min(1, "Full address is required"),
  permissionAuthority: z.string().min(1, "Permission authority is required"),
  numberOfFloors: z.coerce.number().int().min(1, "Number of floors must be at least 1"),
  totalSiteArea: z.coerce.number().min(1, "Total site area must be greater than 0"),
  totalBuiltUpArea: z.coerce.number().min(1, "Total built-up area must be greater than 0"),
  landscapeArea: z.coerce.number().min(0, "Landscape area cannot be negative"),
  buildingType: z.enum(["New", "Existing"]),
});

const UltraCertifyPage: FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});

  const { toast } = useToast();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      registrationNumber: "",
      ownerName: "",
      projectLocation: "",
      fullAddress: "",
      permissionAuthority: "",
      numberOfFloors: 1,
      totalSiteArea: 1,
      totalBuiltUpArea: 1,
      landscapeArea: 0,
      buildingType: "New",
    },
    mode: 'onChange'
  });

  const projectData = form.watch();
  const buildingType = form.watch("buildingType");

  const handleFileChange = useCallback((criterionId: string, files: UploadedFile[] | null) => {
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      if (files && files.length > 0) {
        newFiles[criterionId] = files;
      } else {
        delete newFiles[criterionId];
      }
      return newFiles;
    });
  }, []);

  const handleOptionChange = useCallback((criterionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [criterionId]: value
    }));
  }, []);

  const handleCheckboxChange = useCallback((criterionId: string, optionLabel: string, checked: boolean) => {
    setSelectedOptions(prev => {
      const currentSelection = prev[criterionId] || [];
      const newSelection = Array.isArray(currentSelection) ? [...currentSelection] : [];
      if (checked) {
        if (!newSelection.includes(optionLabel)) {
          newSelection.push(optionLabel);
        }
      } else {
        const index = newSelection.indexOf(optionLabel);
        if (index > -1) {
          newSelection.splice(index, 1);
        }
      }
      return {
        ...prev,
        [criterionId]: newSelection
      };
    });
  }, []);

  const getCriterionOptions = useCallback((criterion: Criterion) => {
      if (!criterion.options) return undefined;
      return Array.isArray(criterion.options) ? criterion.options : criterion.options[buildingType];
  }, [buildingType]);


  const getCriterionScore = useCallback((criterion: Criterion) => {
      if (criterion.type !== 'Credit') return 0;

      const selection = selectedOptions[criterion.id];
      const maxPoints = typeof criterion.points === 'number' ? criterion.points : criterion.points[buildingType];
      const options = getCriterionOptions(criterion);

      if (criterion.selectionType === 'multiple' && Array.isArray(selection) && options) {
          const calculatedPoints = selection.reduce((acc, sel) => {
              const option = options?.find(opt => opt.label === sel);
              return acc + (option?.points || 0);
          }, 0);
          return Math.min(calculatedPoints, maxPoints);
      }
      
      if (typeof selection === 'string' && options) {
          const selectedOption = options.find(opt => opt.label === selection);
          return selectedOption?.points || 0;
      }
      
      if (!criterion.options && selection === 'true') {
          return maxPoints || 0;
      }

      return 0;
  }, [selectedOptions, getCriterionOptions, buildingType]);

  const visibleCriteria = useMemo(() => {
    return criteria.filter(c => c.applicability[buildingType]);
  }, [buildingType]);

  const { currentScore, maxScore, progress, certificationLevel } = useMemo(() => {
    const score = visibleCriteria.reduce((acc, criterion) => {
        return acc + getCriterionScore(criterion);
    }, 0);

    const max = visibleCriteria.reduce((acc, c) => {
        if (c.type === 'Credit') {
            const points = typeof c.points === 'number' ? c.points : c.points[buildingType];
            return acc + (points || 0);
        }
        return acc;
    }, 0);
    
    const prog = max > 0 ? (score / max) * 100 : 0;

    const level = [...certificationLevels]
      .reverse()
      .find((l) => score >= l.minScore[buildingType]) || { level: 'Uncertified', color: 'text-gray-500', minScore: { New: 0, Existing: 0 } };

    return { currentScore: score, maxScore: max, progress: prog, certificationLevel: level };
  }, [visibleCriteria, getCriterionScore, buildingType]);


  const handleSuggestCredits = async () => {
    const images = Object.values(uploadedFiles).flat().map(file => file.dataURL);
    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "No Images Uploaded",
        description: "Please upload at least one image to get AI suggestions.",
      });
      return;
    }

    setIsAISuggesting(true);
    try {
      const result = await getAISuggestions(images);
      setAISuggestions(result.suggestedCredits);
      setIsSuggestionModalOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not get suggestions. Please try again later.",
      });
    } finally {
      setIsAISuggesting(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    toast({
        title: "Generating Report...",
        description: "Please wait while your PDF is being created.",
    });

    try {
        const doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let pageCount = 1;

        const addFooter = () => {
            doc.setFontSize(8);
            doc.text(`Report generated by UltraCertify on ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
            doc.text(`Page ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };
        
        // --- PDF Header ---
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('UltraCertify Report', pageWidth / 2, margin + 5, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text("IGBC's NEST PLUS Ver 1.0 - Green Building Certification Summary", pageWidth / 2, margin + 15, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

        // --- Project Details ---
        let yPos = margin + 30;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Details', margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        
        const details = [
            { label: 'Registration Number', value: projectData.registrationNumber },
            { label: 'Owner Name', value: projectData.ownerName },
            { label: 'Building Type', value: projectData.buildingType },
            { label: 'Permission Authority', value: projectData.permissionAuthority },
            { label: 'Project Location', value: projectData.projectLocation },
            { label: 'Full Address', value: projectData.fullAddress },
            { label: 'Number of Floors', value: projectData.numberOfFloors.toString() },
            { label: 'Total Site Area', value: `${projectData.totalSiteArea} sq. m` },
            { label: 'Total Built-up Area', value: `${projectData.totalBuiltUpArea} sq. m` },
            { label: 'Landscape Area', value: `${projectData.landscapeArea} sq. m` },
        ];
        
        const col1X = margin;
        const col2X = pageWidth / 2;
        let detailY = yPos;

        details.forEach((detail, index) => {
            const currentX = index % 2 === 0 ? col1X : col2X;
            if (index > 0 && index % 2 === 0) {
                detailY += 7;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(`${detail.label}:`, currentX, detailY);
            doc.setFont('helvetica', 'normal');
            doc.text(detail.value || '-', currentX + 50, detailY);
        });

        yPos = detailY + 15;

        // --- Certification Summary ---
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Certification Summary', margin, yPos);
        yPos += 8;
        doc.setFontSize(12);
        doc.text(`Total Score Achieved: ${currentScore} / ${maxScore}`, margin, yPos);
        yPos += 8;
        doc.text(`Certification Level Attained: ${certificationLevel.level}`, margin, yPos);
        
        addFooter();
        
        for (const criterion of visibleCriteria) {
            doc.addPage();
            pageCount++;
            yPos = margin;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(criterion.name, pageWidth / 2, yPos, { align: 'center' });
            yPos += 8;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`(${criterion.type})`, pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            doc.setLineWidth(0.2);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Requirements:', margin, yPos);
            doc.setFont('helvetica', 'normal');
            const reqText = doc.splitTextToSize(criterion.requirements, pageWidth - margin * 2);
            doc.text(reqText, margin, yPos + 5);
            yPos += reqText.length * 4 + 10;

            let statusText = "Not Attempted";
            const selection = selectedOptions[criterion.id];
            const hasFiles = (uploadedFiles[criterion.id] || []).length > 0;

            if (criterion.type === 'Credit') {
                const points = getCriterionScore(criterion);
                const maxPoints = typeof criterion.points === 'number' ? criterion.points : criterion.points[buildingType];
                doc.setFont('helvetica', 'bold');
                doc.text(`Points Awarded: ${points} / ${maxPoints}`, margin, yPos);
                yPos += 8;

                if (Array.isArray(selection) && selection.length > 0) {
                   statusText = `Selected: ${selection.join(', ')}`;
                } else if (typeof selection === 'string' && selection !== 'false' && selection !== 'none') {
                    const options = getCriterionOptions(criterion);
                    const selectedOption = options?.find(opt => opt.label === selection);
                    statusText = selectedOption ? `Selected: ${selectedOption.label}` : "Achieved";
                }
            } else { // Mandatory
                if (hasFiles) {
                    statusText = "Evidence Provided";
                }
            }
             
            doc.setFont('helvetica', 'bold');
            doc.text('Status:', margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(statusText, margin + 20, yPos);
            yPos += 10;

            if (hasFiles) {
                doc.setFont('helvetica', 'bold');
                doc.text('Evidence:', margin, yPos);
                yPos += 8;
                const files = uploadedFiles[criterion.id] || [];
                for(const file of files) {
                    try {
                        const imgProps = doc.getImageProperties(file.dataURL);
                        const availableWidth = pageWidth - margin * 2;
                        const availableHeight = pageHeight - yPos - margin - 15; // Space left on page

                        let imgWidth = imgProps.width;
                        let imgHeight = imgProps.height;
                        const aspectRatio = imgWidth / imgHeight;

                        imgWidth = availableWidth * 0.7; // Occupy 70% of width
                        imgHeight = imgWidth / aspectRatio;
                        
                        if (imgHeight > availableHeight) {
                            doc.addPage();
                            pageCount++;
                            yPos = margin;
                            imgHeight = pageHeight - margin * 2 - 15;
                            imgWidth = imgHeight * aspectRatio;
                        }

                        const xOffset = (pageWidth - imgWidth) / 2;
                        doc.addImage(file.dataURL, 'JPEG', xOffset, yPos, imgWidth, imgHeight);
                        yPos += imgHeight + 5;

                    } catch (e) {
                        console.error("Error adding image to PDF:", e);
                         yPos += 5;
                        doc.text("Error rendering image.", margin, yPos);
                    }
                }
            } else {
                doc.setFont('helvetica', 'bold');
                doc.text('Evidence:', margin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text('No Evidence Uploaded', margin + 20, yPos);
            }

            addFooter();
        }
        
        doc.save('UltraCertify-Report.pdf');

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({
            variant: "destructive",
            title: "PDF Generation Failed",
            description: "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsGeneratingPDF(false);
    }
  };


  return (
    <>
      <main id="main-content" className="min-h-screen bg-secondary/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary font-headline">UltraCertify</h1>
              <p className="text-muted-foreground">IGBC's NEST PLUS Ver 1.0 (Individual Green Home)</p>
            </div>
             <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                <span className="font-semibold text-lg">Certification Tool</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certification Criteria</CardTitle>
                  <CardDescription>Select the credits you have achieved and upload supporting documents.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[1200px] pr-4">
                    <div className="space-y-4">
                      {visibleCriteria.map((criterion, index) => {
                        const isAchieved = (uploadedFiles[criterion.id]?.length || 0) > 0;
                        const options = getCriterionOptions(criterion);

                        const currentPoints = getCriterionScore(criterion);
                        const maxPoints = typeof criterion.points === 'number' ? criterion.points : criterion.points[buildingType];
                        
                        return (
                        <React.Fragment key={criterion.id}>
                          <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 p-4 rounded-lg transition-colors hover:bg-secondary/50">
                            <CheckCircle2 className={`mt-1 h-5 w-5 shrink-0 ${currentPoints > 0 || (criterion.type === 'Mandatory' && isAchieved) ? 'text-green-500' : 'text-muted-foreground/50'} hidden md:block`} />
                            <div className="flex-1 md:col-span-2">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{criterion.name}</h3>
                                <Badge variant={criterion.type === 'Mandatory' ? 'destructive' : 'secondary'}>{criterion.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{criterion.requirements}</p>
                              <p className="text-sm text-muted-foreground mt-1"><strong>Documents:</strong> {criterion.documents}</p>
                               {criterion.type === 'Credit' && (
                                <>
                                  <p className="text-sm font-medium text-primary mt-2">
                                    Points: {currentPoints} / {maxPoints}
                                  </p>

                                  {!options && (
                                     <div className="flex items-center space-x-2 mt-2">
                                        <Checkbox
                                            id={`${criterion.id}-achieved`}
                                            checked={selectedOptions[criterion.id] === 'true'}
                                            onCheckedChange={(checked) => handleOptionChange(criterion.id, checked ? 'true' : 'false')}
                                        />
                                        <Label htmlFor={`${criterion.id}-achieved`}>Achieved</Label>
                                    </div>
                                  )}
                                  
                                  {options && criterion.selectionType !== 'multiple' && (
                                     <div className="mt-2">
                                        <Select onValueChange={(value) => handleOptionChange(criterion.id, value)} value={selectedOptions[criterion.id] as string || 'none'}>
                                            <SelectTrigger className="w-full md:w-[280px]">
                                                <SelectValue placeholder="Select achieved level..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Not Achieved (0 pts)</SelectItem>
                                                {options.map(opt => (
                                                    <SelectItem key={opt.label} value={opt.label}>{opt.label} ({opt.points} pts)</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                     </div>
                                  )}

                                  {options && criterion.selectionType === 'multiple' && (
                                    <div className="mt-2 space-y-2">
                                      {options.map(opt => (
                                        <div key={opt.label} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`${criterion.id}-${opt.label}`}
                                            checked={(selectedOptions[criterion.id] as string[] || []).includes(opt.label)}
                                            onCheckedChange={(checked) => handleCheckboxChange(criterion.id, opt.label, !!checked)}
                                          />
                                          <Label htmlFor={`${criterion.id}-${opt.label}`}>{opt.label} ({opt.points} pts)</Label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                               )}
                            </div>
                            <ImageUploader
                              criterionId={criterion.id}
                              onFileChange={handleFileChange}
                            />
                          </div>
                          {index < visibleCriteria.length - 1 && <Separator />}
                        </React.Fragment>
                      )})}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-medium text-primary">Progress</span>
                       <span className={`text-lg font-bold ${certificationLevel.color}`}>{certificationLevel.level}</span>
                    </div>
                    <Progress value={progress} className="w-full h-3" />
                    <p className="text-right mt-1 text-lg font-bold">
                      {currentScore} / {maxScore} Points
                    </p>
                  </div>
                   <Separator />
                   <div className="space-y-2">
                     {certificationLevels.map(level => (
                       <div key={level.level} className="flex justify-between items-center text-sm">
                         <span className={`${level.color}`}>{level.level}</span>
                         <span className="font-medium text-muted-foreground">{level.minScore[buildingType]}+ Points</span>
                       </div>
                     ))}
                   </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>Fill in the information for your project.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form className="space-y-4">
                      <FormField control={form.control} name="buildingType" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Building Type</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select building type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Existing">Existing</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={form.control} name="registrationNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Registration Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="e.g., NEST-12345" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="ownerName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Name</FormLabel>
                           <FormControl>
                            <div className="relative">
                               <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="Jane Doe" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                       <FormField control={form.control} name="projectLocation" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="e.g., Eco City" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="fullAddress" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Address with Pincode</FormLabel>
                           <FormControl>
                            <div className="relative">
                               <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="123 Green Way, Eco City, 123456" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="permissionAuthority" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Permission Authority</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="e.g., Local Municipal Authority" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                       <FormField control={form.control} name="numberOfFloors" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Floors</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input type="number" placeholder="2" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="totalSiteArea" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Site Area (sq. m)</FormLabel>
                           <FormControl>
                            <div className="relative">
                               <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input type="number" placeholder="200" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                       <FormField control={form.control} name="totalBuiltUpArea" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Built-up Area (sq. m)</FormLabel>
                           <FormControl>
                            <div className="relative">
                               <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input type="number" placeholder="150" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                       <FormField control={form.control} name="landscapeArea" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Landscape Area (sq. m)</FormLabel>
                           <FormControl>
                            <div className="relative">
                               <Trees className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input type="number" placeholder="50" {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card>
                 <CardHeader>
                    <CardTitle>Actions</CardTitle>
                 </CardHeader>
                 <CardContent className="grid grid-cols-1 gap-4">
                    <Button onClick={handleSuggestCredits} disabled={isAISuggesting}>
                      {isAISuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Lightbulb className="mr-2 h-4 w-4" />
                      )}
                      Suggest Applicable Credits
                    </Button>
                    <Button onClick={handleGeneratePDF} variant="outline" disabled={isGeneratingPDF}>
                      {isGeneratingPDF ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                          <FileDown className="mr-2 h-4 w-4" />
                      )}
                      Generate PDF Report
                    </Button>
                 </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isSuggestionModalOpen} onOpenChange={setIsSuggestionModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI-Suggested Credits
            </DialogTitle>
            <DialogDescription>
              Based on your uploaded images, you might be able to earn these credits.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto pr-2">
            <ul className="list-disc pl-5 space-y-2 text-sm">
                {aiSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UltraCertifyPage;


    