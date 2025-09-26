
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Camera, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { UploadedFile } from '@/lib/types';
import { CameraCapture } from './camera-capture';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Textarea } from './ui/textarea';

interface ImageUploaderProps {
  criterionId: string;
  files: UploadedFile[];
  onFileChange: (criterionId: string, file: UploadedFile[] | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ criterionId, files: uploadedFiles, onFileChange }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFilesPromises = acceptedFiles.map(async file => {
      const preview = URL.createObjectURL(file);
      const dataURL = await fileToDataURL(file);
      return { file, preview, dataURL, description: '' };
    });
    const newFiles = await Promise.all(newFilesPromises);
    const updatedFiles = [...uploadedFiles, ...newFiles];
    onFileChange(criterionId, updatedFiles);
  }, [criterionId, onFileChange, uploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: true,
  });

  const removeFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    onFileChange(criterionId, updatedFiles.length > 0 ? updatedFiles : null);
  };
  
  const handleDescriptionChange = (index: number, description: string) => {
    const updatedFiles = [...uploadedFiles];
    if(updatedFiles[index]) {
      updatedFiles[index].description = description;
      onFileChange(criterionId, updatedFiles);
    }
  };

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview.startsWith('blob:')) {
            URL.revokeObjectURL(file.preview)
        }
      });
    };
  }, [uploadedFiles]);

  const handleCapture = (dataURL: string, location: { latitude: number; longitude: number } | null) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `capture-${criterionId}-${Date.now()}.jpg`, { type: mimeString });

    const preview = URL.createObjectURL(file);
    const newFile: UploadedFile = { 
        file, 
        preview, 
        dataURL, 
        description: '',
        latitude: location?.latitude,
        longitude: location?.longitude
    };
    const updatedFiles = [...uploadedFiles, newFile];
    onFileChange(criterionId, updatedFiles);
    setIsCameraOpen(false);
  }

  return (
    <>
      <div className="w-full h-auto flex flex-col gap-2">
        {uploadedFiles.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max space-x-4 p-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="space-y-2 flex-shrink-0 w-48">
                   <div className="relative w-full aspect-video group">
                      <Image
                        src={file.preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => removeFile(e, index)}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      </div>
                    </div>
                    <Textarea
                        placeholder="Add a description..."
                        value={file.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        className="text-sm"
                        rows={2}
                      />
                    {file.latitude && file.longitude && (
                       <div className="flex items-center text-xs text-muted-foreground gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {file.latitude.toFixed(4)}, {file.longitude.toFixed(4)}
                          </span>
                       </div>
                    )}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        <div
          {...getRootProps()}
          className={cn(
            'flex-grow w-full border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
            uploadedFiles.length > 0 ? "min-h-[60px] h-auto" : "min-h-48 h-full"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
            <UploadCloud className="w-6 h-6" />
            <span>{isDragActive ? 'Drop here' : 'Drag or click to upload'}</span>
          </div>
          <span className="text-xs text-muted-foreground my-1">or</span>
          <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true)}}>
            <Camera className="mr-1 h-3 w-3" /> Use Camera
          </Button>
        </div>
      </div>
      <CameraCapture 
        isOpen={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onCapture={handleCapture}
      />
    </>
  );
};
