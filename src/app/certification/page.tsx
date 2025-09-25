
"use client";

import type { FC } from "react";
import React, { useState, useCallback, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import jsPDF from 'jspdf';
import {
  Building,
  Ruler,
  User,
  MapPin,
  CheckCircle2,
  FileDown,
  Loader2,
  Hash,
  Map,
  Building2,
  Layers,
  Trees,
  Mail,
  Phone,
  Bike,
  Star,
  Home,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { UploadedFile, Criterion, CriterionOption, BuildingType, CertificationStandard } from "@/lib/types";
import { certificationData } from "@/lib/certification-data";
import { ImageUploader } from "@/components/image-uploader";


const projectSchema = z.object({
  certificationStandard: z.enum(["NEST", "NEST_PLUS"]),
  buildingType: z.enum(["New", "Existing"]),
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
});

type FormValues = z.infer<typeof projectSchema>;

const UltraCertifyPage: FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});
  const [step, setStep] = useState(1);

  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();


  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const form = useForm<FormValues>({
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
    },
    mode: 'onChange'
  });

  const certificationStandard = form.watch("certificationStandard");
  const buildingType = form.watch("buildingType");

  const handleNextStep = () => {
    form.trigger(["certificationStandard", "buildingType"]).then(isValid => {
      if (isValid) {
        setStep(2);
      } else {
         toast({
            variant: "destructive",
            title: "Selection Required",
            description: "Please select both a certification standard and a building type to continue.",
        });
      }
    });
  };

  const selectedStandardData = useMemo(() => {
    if (certificationStandard && buildingType) {
      return certificationData[certificationStandard][buildingType];
    }
    return null;
  }, [certificationStandard, buildingType]);


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

  const getCriterionOptions = useCallback((criterion: Criterion): CriterionOption[] | undefined => {
    if (!criterion.options) return undefined;
    if (Array.isArray(criterion.options)) return criterion.options;
    return buildingType ? criterion.options[buildingType] : undefined;
  }, [buildingType]);

  const getCriterionRequirements = useCallback((criterion: Criterion): string => {
    if (typeof criterion.requirements === 'string') {
      return criterion.requirements;
    }
    return buildingType ? criterion.requirements[buildingType] : '';
  }, [buildingType]);


  const getCriterionScore = useCallback((criterion: Criterion) => {
    if (criterion.type !== 'Credit' || !buildingType) return 0;

    const selection = selectedOptions[criterion.id];
    const pointsConfig = criterion.points;
    const maxPoints = typeof pointsConfig === 'number' ? pointsConfig : pointsConfig[buildingType as BuildingType] || 0;
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

  const { currentScore, maxScore, progress, certificationLevel } = useMemo(() => {
     if (!selectedStandardData) {
      return { currentScore: 0, maxScore: 0, progress: 0, certificationLevel: { level: 'Uncertified', color: 'text-gray-500' } };
    }

    let score = 0;
    selectedStandardData.criteria.forEach(criterion => {
      if (criterion.type === 'Credit') {
        score += getCriterionScore(criterion);
      }
    });

    const max = selectedStandardData.maxScore;
    const prog = max > 0 ? (score / max) * 100 : 0;

    const level = [...selectedStandardData.levels]
      .reverse()
      .find((l) => score >= l.minScore) || { level: 'Uncertified', color: 'text-gray-500' };

    return { currentScore: score, maxScore: max, progress: prog, certificationLevel: level };
  }, [selectedStandardData, getCriterionScore]);

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
    const projectDataForPdf = form.getValues();
    if (!selectedStandardData) {
        toast({ variant: "destructive", title: "Cannot generate PDF", description: "Standard data is not loaded." });
        return;
    }
    setIsGeneratingPDF(true);
    toast({
      title: "Generating Report...",
      description: "Please wait while your PDF is being created.",
    });

    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let pageCount = 1;

      // --- Load Logo ---
      let ultratechLogoBase64 = '';
      try {
        const logoImg = new window.Image();
        logoImg.src = '/ultratech-logo.png';
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
        });
        ultratechLogoBase64 = getBase64Image(logoImg);
      } catch (e) {
        console.error("Could not load logo image for PDF.", e);
      }

      const addFooter = () => {
        doc.setFontSize(8);
        const footerText = `Report for ${projectDataForPdf.ownerName} | Generated by UltraCertify on ${new Date().toLocaleDateString()}`;
        doc.text(footerText, margin, pageHeight - 10);
        doc.text(`Page ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      };

      if (ultratechLogoBase64) {
        doc.addImage(ultratechLogoBase64, 'PNG', margin, 10, 40, 15);
      }
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('UltraCertify Report', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const reportTitle = `IGBC's ${certificationStandard?.replace('_', ' ')} - Green Building Certification Summary`;
      doc.text(reportTitle, pageWidth / 2, 22, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(margin, 28, pageWidth - margin, 28);

      let yPos = 38;
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Details', margin, yPos);
      yPos += 12;
      doc.setFontSize(14);

      const details = [
        { label: 'Registration Number', value: projectDataForPdf.registrationNumber },
        { label: 'Owner Name', value: projectDataForPdf.ownerName },
        { label: 'Mobile Number', value: projectDataForPdf.mobileNumber },
        { label: 'Email Address', value: projectDataForPdf.emailAddress },
        { label: 'Building Type', value: projectDataForPdf.buildingType },
        { label: 'Project Type', value: projectDataForPdf.projectType },
        { label: 'Permission Authority', value: projectDataForPdf.permissionAuthority },
        { label: 'Project Location', value: projectDataForPdf.projectLocation },
        { label: 'Full Address', value: projectDataForPdf.fullAddress },
        { label: 'Number of Floors', value: projectDataForPdf.numberOfFloors.toString() },
        { label: 'Two Wheeler Parking', value: projectDataForPdf.twoWheelerParking.toString() },
        { label: 'Total Site Area', value: `${projectDataForPdf.totalSiteArea} sq. m` },
        { label: 'Total Built-up Area', value: `${projectDataForPdf.totalBuiltUpArea} sq. m` },
        { label: 'Landscape Area', value: `${projectDataForPdf.landscapeArea} sq. m` },
      ];

      const col1X = margin;
      const col2X = pageWidth / 2;
      let detailY = yPos;

      details.forEach((detail, index) => {
        const currentX = index % 2 === 0 ? col1X : col2X;
        if (index > 0 && index % 2 === 0) {
          detailY += 10;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`${detail.label}:`, currentX, detailY);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.value || '-', currentX + 60, detailY);
      });

      yPos = detailY + 22;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Certification Summary', margin, yPos);
      yPos += 12;
      doc.setFontSize(16);
      doc.text(`Total Score Achieved: ${currentScore} / ${maxScore}`, margin, yPos);
      yPos += 12;
      doc.text(`Certification Level Attained: ${certificationLevel.level}`, margin, yPos);

      addFooter();

      for (const criterion of selectedStandardData.criteria) {
        const selection = selectedOptions[criterion.id];
        const files = uploadedFiles[criterion.id] || [];

        if (!selection && files.length === 0) continue;

        doc.addPage();
        pageCount++;
        let currentY = margin;
        
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 15, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const titleText = `${criterion.name} (${criterion.type})`;
        const titleLines = doc.splitTextToSize(titleText, pageWidth - (margin * 2) - 10);
        doc.text(titleLines, margin + 5, currentY + 9);
        
        currentY += 20;

        let textY = currentY + 8;

        const addDetail = (label: string, value: string, startY: number) => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(label, margin, startY);
          doc.setFont('helvetica', 'normal');
          const textLines = doc.splitTextToSize(value, pageWidth - margin * 2 - 35);
          doc.text(textLines, margin + 35, startY);
          return startY + textLines.length * 5 + 3;
        };

        let bottomOfText = textY;
        bottomOfText = addDetail('Requirements:', getCriterionRequirements(criterion), bottomOfText);

        let statusText = "Not Attempted";
        if (criterion.type === 'Credit' && buildingType) {
          const criterionScore = getCriterionScore(criterion);
          const pointsConfig = criterion.points;
          const maxPoints = typeof pointsConfig === 'number' ? pointsConfig : pointsConfig[buildingType];
          bottomOfText = addDetail('Points Awarded:', `${criterionScore} / ${maxPoints}`, bottomOfText);

          if (Array.isArray(selection) && selection.length > 0) {
            statusText = `Selected: ${selection.join(', ')}`;
          } else if (typeof selection === 'string' && selection !== 'false' && selection !== 'none') {
            const options = getCriterionOptions(criterion);
            const selectedOption = options?.find(opt => opt.label === selection);
            statusText = selectedOption ? `Selected: ${selectedOption.label}` : "Achieved";
          }
        } else {
          if (files.length > 0) {
            statusText = "Evidence Provided";
          }
        }
        bottomOfText = addDetail('Status:', statusText, bottomOfText);
        
        let imageY = bottomOfText + 5;

        if (files.length > 0) {
           for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (imageY > pageHeight - 80) { 
                addFooter();
                doc.addPage();
                pageCount++;
                imageY = margin;
                doc.setFontSize(12);
                doc.text(`Evidence for: ${criterion.name} (continued)`, pageWidth / 2, imageY, { align: 'center' });
                imageY += 10;
            }

            try {
              const img = new window.Image();
              img.src = file.dataURL;
              await new Promise(resolve => { img.onload = resolve });

              const imgWidth = img.width;
              const imgHeight = img.height;
              const aspectRatio = imgWidth / imgHeight;

              const maxImgWidth = pageWidth - (margin * 2);
              const maxImgHeight = pageHeight - imageY - 25; 

              let finalWidth = maxImgWidth;
              let finalHeight = finalWidth / aspectRatio;

              if (finalHeight > maxImgHeight) {
                finalHeight = maxImgHeight;
                finalWidth = finalHeight * aspectRatio;
              }
              
              const xPos = (pageWidth - finalWidth) / 2;

              const urlMatch = file.dataURL.match(/^data:image\/(jpeg|png);base64,/);
              if (!urlMatch) { throw new Error("Invalid image dataURL format."); }
              const imageType = urlMatch[1].toUpperCase();

              doc.addImage(file.dataURL, imageType, xPos, imageY, finalWidth, finalHeight);
              
              let textY = imageY + finalHeight + 5;
              doc.setFontSize(8);
              
              if (file.description) {
                doc.setFont('helvetica', 'italic');
                const descLines = doc.splitTextToSize(file.description, finalWidth);
                doc.text(descLines, xPos, textY);
                textY += descLines.length * 4;
              }

              if (file.latitude && file.longitude) {
                doc.setFont('helvetica', 'normal');
                const locationText = `Location: ${file.latitude.toFixed(5)}, ${file.longitude.toFixed(5)}`;
                const locationLines = doc.splitTextToSize(locationText, finalWidth);
                doc.text(locationLines, xPos, textY);
                textY += locationLines.length * 4;
              }

              imageY = textY + 5;


            } catch (e) {
              console.error("Error adding image to PDF:", e);
              doc.setFontSize(8);
              doc.setTextColor(150);
              doc.text("[Could not render image]", pageWidth/2, imageY + 40, { align: 'center' });
              doc.setTextColor(0);
              imageY += 50;
            }
          }
        }
        addFooter();
      }

      doc.save(`UltraCertify-${certificationStandard?.replace('_','-')}-Report.pdf`);

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: "An unexpected error occurred. Please check the console for details.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  const renderStep1 = () => (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Start Your Certification</CardTitle>
          <CardDescription>First, select your certification standard and building type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <FormField
              control={form.control}
              name="certificationStandard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>1. Certification Standard</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a standard..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NEST_PLUS">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>NEST PLUS</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="NEST">
                        <div className="flex items-center gap-2">
                           <Home className="h-4 w-4 text-green-500" />
                           <span>NEST</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="buildingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2. Building Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select building type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New Building</SelectItem>
                        <SelectItem value="Existing">Existing Building</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button onClick={handleNextStep} className="w-full">
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
        </CardContent>
      </Card>
  );

  const renderStep2 = () => (
    <>
      <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Fill in the information for your project. This information will be used in the final report.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              </div>
          </CardContent>
        </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certification Criteria</CardTitle>
              <CardDescription>Select the credits you have achieved and upload supporting documents for the <span className="font-bold">{certificationStandard?.replace('_', ' ')} - {buildingType} Building</span> standard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {selectedStandardData?.criteria.map((criterion) => {
                  const isAchieved = (uploadedFiles[criterion.id]?.length || 0) > 0;
                  const options = getCriterionOptions(criterion);
                  const currentPoints = getCriterionScore(criterion);
                  const pointsConfig = criterion.points;
                  const maxPoints = typeof pointsConfig === 'number' ? pointsConfig : (buildingType ? pointsConfig[buildingType as BuildingType] : 0);

                  return (
                    <AccordionItem value={criterion.id} key={criterion.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-4 flex-1 pr-4">
                          <CheckCircle2 className={`h-5 w-5 shrink-0 ${(currentPoints > 0 || (criterion.type === 'Mandatory' && isAchieved)) ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{criterion.name}</h3>
                              <Badge variant={criterion.type === 'Mandatory' ? 'destructive' : 'secondary'}>{criterion.type}</Badge>
                            </div>
                            {criterion.type === 'Credit' && (
                              <p className="text-sm font-medium text-primary mt-1">
                                Points: {currentPoints} / {maxPoints}
                              </p>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-6 p-4">
                          <div className="flex-1 md:col-span-2 space-y-4">
                            <p className="text-sm text-muted-foreground">{getCriterionRequirements(criterion)}</p>
                            <p className="text-sm text-muted-foreground"><strong>Documents:</strong> {criterion.documents}</p>

                            {criterion.type === 'Credit' && (
                              <>
                                {!options && (
                                  <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                      id={`${criterion.id}-achieved`}
                                      checked={selectedOptions[criterion.id] === 'true'}
                                      onCheckedChange={(checked) => handleOptionChange(criterion.id, checked ? 'true' : 'false')}
                                    />
                                    <Label htmlFor={`${criterion.id}-achieved`}>Achieved</Label>
                                  </div>
                                )}

                                {options && criterion.selectionType !== 'multiple' && (
                                  <div className="pt-2">
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
                                  <div className="pt-2 space-y-2">
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
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
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
                {selectedStandardData?.levels.map(level => (
                  <div key={level.level} className="flex justify-between items-center text-sm">
                    <span className={`${level.color}`}>{level.level}</span>
                    <span className="font-medium text-muted-foreground">{level.minScore}+ Points</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent">
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <Button onClick={handleGeneratePDF} variant="outline" disabled={!form.formState.isValid || isGeneratingPDF}>
                {isGeneratingPDF ? <Loader2 className="animate-spin" /> : <FileDown />}
                Generate PDF Report
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );

  return (
    <div className="space-y-8">
     <FormProvider {...form}>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
                {step === 1 ? renderStep1() : renderStep2()}
            </form>
        </Form>
      </FormProvider>
    </div>
  );
};

export default UltraCertifyPage;
