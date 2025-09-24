
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CameraCaptureProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCapture: (dataUrl: string, location: { latitude: number; longitude: number } | null) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ isOpen, onOpenChange, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const getCameraPermission = async () => {
      if (isOpen) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      }
    };
    
    getCameraPermission();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if(videoRef.current) {
          videoRef.current.srcObject = null;
      }
    };
  }, [isOpen, toast]);
  
  const getLocation = (): Promise<{ latitude: number, longitude: number } | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            toast({
                variant: 'destructive',
                title: 'Geolocation Not Supported',
                description: 'Your browser does not support geolocation.',
            });
            resolve(null);
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast({
                        variant: 'destructive',
                        title: 'Location Access Denied',
                        description: 'Could not retrieve your location. Please enable location services.',
                    });
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    });
  };

  const handleCapture = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const location = await getLocation();

      if(context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl, location);
      }
      setIsCapturing(false);
    }
  }, [onCapture, toast]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
          <DialogDescription>
            Position the subject in the frame and click capture. We will also capture your current location.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          </div>
          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser to use this feature. You may need to refresh the page after granting permission.
              </AlertDescription>
            </Alert>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter>
          <Button onClick={handleCapture} disabled={!hasCameraPermission || isCapturing}>
            {isCapturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
            {isCapturing ? 'Capturing...' : 'Capture'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
