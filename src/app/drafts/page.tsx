
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { PlusCircle, Trash2, Edit, Building, Sun } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';


// Mock data for drafts - in a real app, this would come from Firestore
const initialDrafts = [
  { id: 1, name: "My First Home", type: "New", lastSaved: "2024-09-21" },
  { id: 2, name: "Office Retrofit", type: "Existing", lastSaved: "2024-09-20" },
];

export default function DraftsPage() {
    const [drafts, setDrafts] = React.useState(initialDrafts);
    const [isNewDraftDialogOpen, setIsNewDraftDialogOpen] = React.useState(false);
    const [newBuildingType, setNewBuildingType] = React.useState<"New" | "Existing">("New");
    const router = useRouter();

    const handleCreateDraft = () => {
        if (drafts.length >= 3) {
            // In a real app, you'd show a toast or a more prominent error.
            alert("You can only have a maximum of 3 drafts. Please delete one to create a new one.");
            return;
        }
        // For now, just navigate. In a real app, you'd create the draft in the backend.
        router.push("/");
        setIsNewDraftDialogOpen(false);
    }

    const handleDeleteDraft = (id: number) => {
        setDrafts(drafts.filter(draft => draft.id !== id));
    }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Drafts</h1>
          <p className="text-muted-foreground">
            Manage your saved projects or start a new one.
          </p>
        </div>
        <AlertDialog open={isNewDraftDialogOpen} onOpenChange={setIsNewDraftDialogOpen}>
            <AlertDialogTrigger asChild>
                 <Button disabled={drafts.length >= 3}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project Draft
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Create a New Project Draft</AlertDialogTitle>
                <AlertDialogDescription>
                    Please select the building type for your new project. This will determine the applicable certification criteria.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Select onValueChange={(value: "New" | "Existing") => setNewBuildingType(value)} defaultValue={newBuildingType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select building type..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="New">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    <span>New Building</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Existing">
                                <div className="flex items-center gap-2">
                                    <Sun className="h-4 w-4" />
                                    <span>Existing Building</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreateDraft}>Create Draft</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </div>
      
      {drafts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No Drafts Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Click "New Project Draft" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
            <Card key={draft.id}>
                <CardHeader>
                <CardTitle>{draft.name}</CardTitle>
                <CardDescription>Type: {draft.type} Building</CardDescription>
                </CardHeader>
                <CardContent>
                <p className="text-sm text-muted-foreground">
                    Last Saved: {draft.lastSaved}
                </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push('/')}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            project draft.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteDraft(draft.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}
