'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Trash2, UploadCloud, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { UploadedFile } from '@/lib/types';
import { CameraCapture } from './camera-capture';
import { ScrollArea } from './ui/scroll-area';

interface ImageUploaderProps {
  criterionId: string;
  onFileChange: (criterionId: string, file: UploadedFile[] | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ criterionId, onFileChange }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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
      return { file, preview, dataURL };
    });
    const newFiles = await Promise.all(newFilesPromises);
    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
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
    setUploadedFiles(updatedFiles);
    onFileChange(criterionId, updatedFiles.length > 0 ? updatedFiles : null);
  };
  
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [uploadedFiles]);

  const handleCapture = (dataURL: string) => {
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
    const newFile = { file, preview, dataURL };
    const updatedFiles = [...uploadedFiles, newFile];
    setUploadedFiles(updatedFiles);
    onFileChange(criterionId, updatedFiles);
    setIsCameraOpen(false);
  }

  return (
    <>
      <div className="w-full h-48 flex flex-col">
        {uploadedFiles.length > 0 ? (
          <ScrollArea className="flex-1 h-32 mb-2">
            <div className="grid grid-cols-2 gap-2 pr-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative w-full aspect-square group">
                  <Image
                    src={file.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                    <Button variant="destructive" size="icon" className="h-7 w-7" onClick={(e) => removeFile(e, index)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : null}

        <div
          {...getRootProps()}
          className={cn(
            'flex-grow w-full border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
            uploadedFiles.length > 0 ? "min-h-[60px] h-auto" : "h-full"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
            <UploadCloud className="w-6 h-6" />
            <span>{isDragActive ? 'Drop here' : 'Drag or click'}</span>
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
