
"use client";

import type { FC } from "react";
import React, {useCallback} from "react";
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
  Mail,
  Phone,
  Bike,
  Save,
  ArrowLeft,
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


import type { UploadedFile, ProjectData, Criterion } from "@/lib/types";
import { criteria, certificationLevels } from "@/lib/certification-data";
import { getAISuggestions } from "@/app/actions";
import { ImageUploader } from "@/components/image-uploader";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import ultratechLogo from "@/lib/ultratech-logo.png";


const projectSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  emailAddress: z.string().email("Invalid email address"),
  projectLocation: z.string().min(1, "Project location is required"),
  fullAddress: z.string().min(1, "Full address is required"),
  permissionAuthority: z.string().min(1, "Permission authority is required"),
  projectType: z.string().min(1, "Project type is required"),
  numberOfFloors: z.coerce.number().int().min(1, "Number of floors must be at least 1"),
  totalSiteArea: z.coerce.number().min(1, "Total site area must be greater than 0"),
  totalBuiltUpArea: z.coerce.number().min(1, "Total built-up area must be greater than 0"),
  landscapeArea: z.coerce.number().min(0, "Landscape area cannot be negative"),
  twoWheelerParking: z.coerce.number().int().min(0, "Number cannot be negative"),
  buildingType: z.enum(["New", "Existing"]),
});

const UltraCertifyPage: FC = () => {
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, UploadedFile[]>>({});
  const [isAISuggesting, setIsAISuggesting] = React.useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [aiSuggestions, setAISuggestions] = React.useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string | string[]>>({});

  const { toast } = useToast();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      registrationNumber: "",
      ownerName: "",
      mobileNumber: "",
      emailAddress: "",
      projectLocation: "",
      fullAddress: "",
      permissionAuthority: "",
      projectType: "Residential Building",
      numberOfFloors: 1,
      totalSiteArea: 1,
      totalBuiltUpArea: 1,
      landscapeArea: 0,
      twoWheelerParking: 0,
      buildingType: "New",
    },
    mode: 'onChange'
  });

  const projectData = form.watch();
  const buildingType = form.watch("buildingType");

  const handleFileChange = React.useCallback((criterionId: string, files: UploadedFile[] | null) => {
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

  const handleOptionChange = React.useCallback((criterionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [criterionId]: value
    }));
  }, []);

  const handleCheckboxChange = React.useCallback((criterionId: string, optionLabel: string, checked: boolean) => {
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

  const getCriterionOptions = React.useCallback((criterion: Criterion) => {
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
        return maxPoints;
    }

    return 0;
  }, [selectedOptions, getCriterionOptions, buildingType]);

  const visibleCriteria = React.useMemo(() => {
    return criteria.filter(c => c.applicability[buildingType]);
  }, [buildingType]);

  const { currentScore, maxScore, progress, certificationLevel } = React.useMemo(() => {
    let score = 0;
    visibleCriteria.forEach(criterion => {
        if (criterion.type === 'Credit') {
            score += getCriterionScore(criterion);
        }
    });

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

  const getBase64Image = (img: HTMLImageElement): string => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          return dataURL;
      }
      return '';
  };

 const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    toast({
        title: "Generating Report...",
        description: "Please wait while your PDF is being created.",
    });

    try {
        const logoImg = document.createElement('img');
        logoImg.src = ultratechLogo.src;
        await new Promise(resolve => { logoImg.onload = resolve });
        const ultratechLogoBase64 = getBase64Image(logoImg);

        const doc = new jsPDF('l', 'mm', 'a4'); 
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
        if (ultratechLogoBase64) {
            doc.addImage(ultratechLogoBase64, 'PNG', margin, margin - 5, 40, 15);
        }
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
            { label: 'Mobile Number', value: projectData.mobileNumber },
            { label: 'Email Address', value: projectData.emailAddress },
            { label: 'Building Type', value: projectData.buildingType },
            { label: 'Project Type', value: projectData.projectType },
            { label: 'Permission Authority', value: projectData.permissionAuthority },
            { label: 'Project Location', value: projectData.projectLocation },
            { label: 'Full Address', value: projectData.fullAddress },
            { label: 'Number of Floors', value: projectData.numberOfFloors.toString() },
            { label: 'Two Wheeler Parking', value: projectData.twoWheelerParking.toString() },
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
            let currentY = margin;

            // Header section for the criterion
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`(${criterion.type})`, pageWidth - margin, currentY, { align: 'right' });
            
            doc.setFillColor(230, 230, 230); // Light grey background for title
            doc.rect(margin, currentY + 5, 80, 20, 'F');
            doc.setTextColor(0,0,0);
            doc.setFontSize(16);
            const titleLines = doc.splitTextToSize(criterion.name, 75);
            doc.text(titleLines, margin + 5, currentY + 5 + (20 - titleLines.length * 5)/2 + 4);

            const textContentX = margin + 95;
            const contentWidth = pageWidth - textContentX - margin;
            
            let textY = currentY + 8;
            
            const addDetail = (label: string, value: string) => {
              if (textY > pageHeight - 20) { // Check if new page is needed for text
                addFooter();
                doc.addPage();
                pageCount++;
                textY = margin;
              }
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              doc.text(label, textContentX, textY);
              doc.setFont('helvetica', 'normal');
              const textLines = doc.splitTextToSize(value, contentWidth - 30);
              doc.text(textLines, textContentX + 35, textY);
              textY += textLines.length * 5 + 3;
            };
            
            addDetail('Requirements:', criterion.requirements);

            let statusText = "Not Attempted";
            const selection = selectedOptions[criterion.id];
            
            if (criterion.type === 'Credit') {
                const criterionScore = getCriterionScore(criterion);
                const maxPoints = typeof criterion.points === 'number' ? criterion.points : criterion.points[buildingType];
                addDetail('Points Awarded:', `${criterionScore} / ${maxPoints}`);

                if (Array.isArray(selection) && selection.length > 0) {
                   statusText = `Selected: ${selection.join(', ')}`;
                } else if (typeof selection === 'string' && selection !== 'false' && selection !== 'none') {
                    const options = getCriterionOptions(criterion);
                    const selectedOption = options?.find(opt => opt.label === selection);
                    statusText = selectedOption ? `Selected: ${selectedOption.label}` : "Achieved";
                }
            } else { // Mandatory
                if ((uploadedFiles[criterion.id] || []).length > 0) {
                    statusText = "Evidence Provided";
                }
            }
             
            addDetail('Status:', statusText);

            const files = uploadedFiles[criterion.id] || [];
            currentY = textY + 5; // Y position for images

            if (files.length > 0) {
              const availableHeight = pageHeight - currentY - 15;
              const imgWidth = 80;
              const imgHeight = 60;
              const descHeight = 20;
              const totalBlockHeight = imgHeight + descHeight;
              const gap = 5;
              const imagesPerRow = 3;
              let currentX = margin;

              for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (currentY + totalBlockHeight > pageHeight - 15) {
                   addFooter();
                   doc.addPage();
                   pageCount++;
                   currentY = margin;
                   currentX = margin;
                   doc.setFontSize(12);
                   doc.text(`Evidence for: ${criterion.name} (continued)`, pageWidth/2, currentY, {align: 'center'});
                   currentY += 10;
                }

                try {
                  doc.addImage(file.dataURL, 'JPEG', currentX, currentY, imgWidth, imgHeight);
                  doc.setFontSize(8);
                  doc.setFont('helvetica', 'normal');
                  const descLines = doc.splitTextToSize(file.description || 'No description provided.', imgWidth);
                  doc.text(descLines, currentX, currentY + imgHeight + 4);
                } catch (e) {
                  console.error("Error adding image:", e);
                  doc.text("Error rendering image.", currentX + 5, currentY + 10);
                }

                currentX += imgWidth + gap;
                if ((i + 1) % imagesPerRow === 0) {
                  currentY += totalBlockHeight + gap;
                  currentX = margin;
                }
              }
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

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    // Simulate API call
    setTimeout(() => {
        toast({
            title: "Draft Saved",
            description: "Your project progress has been saved.",
        });
        setIsSavingDraft(false);
    }, 1500);
  }


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certification Criteria</CardTitle>
              <CardDescription>Select the credits you have achieved and upload supporting documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[80vh] pr-4">
                <div className="space-y-4">
                  {visibleCriteria.map((criterion, index) => {
                    const isAchieved = (uploadedFiles[criterion.id]?.length || 0) > 0;
                    const options = getCriterionOptions(criterion);

                    const currentPoints = getCriterionScore(criterion);
                    const maxPoints = typeof criterion.points === 'number' ? criterion.points : criterion.points[buildingType];
                    
                    return (
                    <React.Fragment key={criterion.id}>
                      <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 p-4 rounded-lg transition-colors hover:bg-secondary/50">
                        <CheckCircle2 className={`mt-1 h-5 w-5 shrink-0 ${(currentPoints > 0 || (criterion.type === 'Mandatory' && isAchieved)) ? 'text-green-500' : 'text-muted-foreground/50'} hidden md:block`} />
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
                  <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                       <FormControl>
                        <div className="relative">
                           <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="e.g., 9876543210" {...field} className="pl-9" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="emailAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                       <FormControl>
                        <div className="relative">
                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="jane.doe@example.com" {...field} className="pl-9" />
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
                   <FormField control={form.control} name="projectType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="e.g., Residential Building" {...field} className="pl-9" />
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
                   <FormField control={form.control} name="twoWheelerParking" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Two Wheeler Parking (Nos)</FormLabel>
                       <FormControl>
                        <div className="relative">
                           <Bike className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input type="number" placeholder="1" {...field} className="pl-9" />
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
                <Button onClick={handleSaveDraft} disabled={isSavingDraft}>
                  {isSavingDraft ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Draft
                </Button>
                <Button onClick={handleSuggestCredits} disabled={isAISuggesting}>
                  {isAISuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lightbulb className="mr-2 h-4 w-4" />
                  )}
                  Suggest Applicable Credits
                </Button>
                <Button onClick={handleGeneratePDF} variant="outline" disabled={!form.formState.isValid || isGeneratingPDF}>
                  {isGeneratingPDF ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Generate PDF Report
                </Button>
                <Button variant="link" onClick={() => window.location.href='/drafts'}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Drafts
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>

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
