"use client";

import type { FC } from "react";
import React, { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  FileText
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

import type { UploadedFile } from "@/lib/types";
import { criteria, certificationLevels } from "@/lib/certification-data";
import { getAISuggestions } from "@/app/actions";
import { ImageUploader } from "@/components/image-uploader";
import { ReportTemplate } from "@/components/report-template";
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
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

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

  const handleFileChange = useCallback((criterionId: string, file: UploadedFile | null) => {
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      if (file) {
        newFiles[criterionId] = file;
      } else {
        delete newFiles[criterionId];
      }
      return newFiles;
    });
  }, []);

  const { currentScore, maxScore, progress, certificationLevel } = useMemo(() => {
    const applicableCriteria = criteria.filter(c => c.applicability[buildingType]);
    
    const score = Object.keys(uploadedFiles).reduce((acc, criterionId) => {
      const criterion = applicableCriteria.find((c) => c.id === criterionId);
      if (criterion && criterion.type === 'Credit') {
        const points = typeof criterion.points === 'number' ? criterion.points : criterion.points[buildingType];
        return acc + (points || 0);
      }
      return acc;
    }, 0);

    const max = applicableCriteria.reduce((acc, c) => {
        if (c.type === 'Credit') {
            const points = typeof c.points === 'number' ? c.points : c.points[buildingType];
            return acc + points;
        }
        return acc;
    }, 0);
    
    const prog = max > 0 ? (score / max) * 100 : 0;

    const level = [...certificationLevels]
      .reverse()
      .find((l) => score >= l.minScore[buildingType]) || { level: 'Uncertified', color: 'text-gray-500', minScore: { New: 0, Existing: 0 } };

    return { currentScore: score, maxScore: max, progress: prog, certificationLevel: level };
  }, [uploadedFiles, buildingType]);

  const handleSuggestCredits = async () => {
    const images = Object.values(uploadedFiles).map(file => file.dataURL);
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

  const handlePrint = async () => {
    await form.trigger();
    const allFieldsFilled = form.formState.isValid;
    if (!allFieldsFilled) {
      toast({
        variant: "destructive",
        title: "Incomplete Project Details",
        description: "Please fill in all project details before generating the report.",
      });
      // Trigger validation to show error messages
      Object.keys(form.getValues()).forEach((key) => {
        form.trigger(key as keyof z.infer<typeof projectSchema>);
      });
      return;
    }
    
    toast({
      title: "Generating Report",
      description: "Your report is being prepared. The print dialog will open shortly.",
    });

    setTimeout(() => {
        window.print();
    }, 500);
  };

  const visibleCriteria = useMemo(() => {
    return criteria.filter(c => c.applicability[buildingType]);
  }, [buildingType]);

  return (
    <>
      <main id="main-content" className="min-h-screen bg-secondary/50 p-4 sm:p-6 lg:p-8 print:hidden">
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
                  <CardDescription>Upload required documents for each criterion you have met.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[1200px] pr-4">
                    <div className="space-y-4">
                      {visibleCriteria.map((criterion, index) => (
                        <React.Fragment key={criterion.id}>
                          <div className="flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-secondary/50">
                            <CheckCircle2 className={`mt-1 h-5 w-5 shrink-0 ${uploadedFiles[criterion.id] ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{criterion.name}</h3>
                                <Badge variant={criterion.type === 'Mandatory' ? 'destructive' : 'secondary'}>{criterion.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{criterion.requirements}</p>
                              <p className="text-sm text-muted-foreground mt-1"><strong>Documents:</strong> {criterion.documents}</p>
                              {criterion.type === 'Credit' && (
                                <p className="text-sm font-medium text-primary mt-1">Points: {typeof criterion.points === 'number' ? criterion.points : criterion.points[buildingType]}</p>
                              )}
                            </div>
                            <ImageUploader
                              criterionId={criterion.id}
                              onFileChange={handleFileChange}
                            />
                          </div>
                          {index < visibleCriteria.length - 1 && <Separator />}
                        </React.Fragment>
                      ))}
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
                    <Button onClick={handlePrint} variant="outline">
                      <FileDown className="mr-2 h-4 w-4" />
                      Generate PDF Report
                    </Button>
                 </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <div id="print-content" className="hidden print:block p-8">
        <ReportTemplate
          projectData={projectData}
          files={uploadedFiles}
          score={currentScore}
          maxScore={maxScore}
          level={certificationLevel.level}
        />
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
