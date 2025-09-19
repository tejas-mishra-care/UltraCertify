'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { UploadedFile } from '@/lib/types';

interface ImageUploaderProps {
  criterionId: string;
  onFileChange: (criterionId: string, file: UploadedFile | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ criterionId, onFileChange }) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      const dataURL = await fileToDataURL(file);
      const newFile = { file, preview, dataURL };
      setUploadedFile(newFile);
      onFileChange(criterionId, newFile);
    }
  }, [criterionId, onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: false,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    onFileChange(criterionId, null);
  };
  
  useEffect(() => {
    return () => {
      if (uploadedFile) {
        URL.revokeObjectURL(uploadedFile.preview);
      }
    };
  }, [uploadedFile]);

  return (
    <div className="w-32 h-32">
      {uploadedFile ? (
        <div className="relative w-full h-full group">
          <Image
            src={uploadedFile.preview}
            alt="Preview"
            fill
            className="object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
            <Button variant="destructive" size="icon" onClick={removeFile}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'w-full h-full border-2 border-dashed rounded-md flex items-center justify-center text-center p-2 cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
            <UploadCloud className="w-6 h-6" />
            <span>{isDragActive ? 'Drop here' : 'Drag or click'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
