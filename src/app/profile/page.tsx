
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useMemo } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';
import { doc, updateDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Camera, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { addDays, formatDistanceToNow, isBefore } from 'date-fns';

const MAX_NAME_CHANGES = 2;
const NAME_CHANGE_WINDOW_DAYS = 14;

export default function ProfilePage() {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);

  const [lastChanged, setLastChanged] = useState<Timestamp | null>(null);
  const [changeCount, setChangeCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.displayName || '');
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLastChanged(data.displayNameLastChanged || null);
          setChangeCount(data.displayNameChangeCount || 0);
        }
      });
    }
  }, [user, loading, router]);
  
  const { canChangeName, nextChangeDate } = useMemo(() => {
    if (!lastChanged) return { canChangeName: true, nextChangeDate: null };

    const windowEndDate = addDays(lastChanged.toDate(), NAME_CHANGE_WINDOW_DAYS);
    
    if (isBefore(new Date(), windowEndDate)) {
      // We are within the 14-day window
      return {
        canChangeName: changeCount < MAX_NAME_CHANGES,
        nextChangeDate: windowEndDate,
      };
    }
    
    // We are past the 14-day window
    return { canChangeName: true, nextChangeDate: null };
  }, [lastChanged, changeCount]);


  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 2MB.',
        });
        return;
      }
      
      setIsUploading(true);
      setUploadProgress(30);

      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        setUploadProgress(70);
        const photoURL = await getDownloadURL(snapshot.ref);

        // Update Firebase Auth profile
        if(auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL });
        }

        // Update Firestore user document
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { photoURL });
        
        setUploadProgress(100);

        await refreshAuth();

        toast({
          title: 'Success',
          description: 'Your profile picture has been updated.',
        });

      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: 'There was an error updating your profile picture.',
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleNameChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canChangeName || isSavingName || !displayName.trim() || displayName.trim() === user.displayName) {
      return;
    }

    setIsSavingName(true);
    const newName = displayName.trim();
    const userDocRef = doc(db, 'users', user.uid);

    try {
       // Determine new count and timestamp
       const isPastWindow = nextChangeDate ? isBefore(nextChangeDate, new Date()) : true;
       const newCount = isPastWindow ? 1 : changeCount + 1;

       // Update Firestore first
       await updateDoc(userDocRef, {
         displayName: newName,
         displayNameLastChanged: serverTimestamp(),
         displayNameChangeCount: newCount,
       });

       // Then update Auth
       if (auth.currentUser) {
         await updateProfile(auth.currentUser, { displayName: newName });
       }

       // Finally, refresh local state
       await refreshAuth();
       setChangeCount(newCount);
       setLastChanged(Timestamp.now());

       toast({
        title: 'Success!',
        description: 'Your display name has been updated.',
      });

    } catch (error) {
      console.error('Error updating display name:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was an error updating your display name.',
      });
      // Revert local state if update fails
      setDisplayName(user.displayName || '');
    } finally {
      setIsSavingName(false);
    }
  };


  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-3.5rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  const nameChanged = user.displayName !== displayName.trim();

  return (
    <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Your Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback className="text-4xl">{(displayName || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-0 h-full w-full bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity"
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                <Camera className="h-8 w-8" />
                <span className="sr-only">Change picture</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                disabled={isUploading}
              />
            </div>
            {isUploading && <Progress value={uploadProgress} className="w-32 h-2" />}
            <h2 className="text-2xl font-bold">{user.displayName}</h2>
          </div>
          <div className="space-y-4">
             <form onSubmit={handleNameChangeSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="displayName" 
                            value={displayName} 
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={!canChangeName || isSavingName}
                            maxLength={50}
                        />
                        <Button 
                            type="submit"
                            size="icon"
                            disabled={!canChangeName || isSavingName || !nameChanged || !displayName.trim()}
                        >
                            <Save className="h-4 w-4" />
                            <span className="sr-only">Save</span>
                        </Button>
                    </div>
                     {!canChangeName && nextChangeDate && (
                      <p className="text-sm text-muted-foreground">
                        You have reached your name change limit. You can change it again {formatDistanceToNow(nextChangeDate, { addSuffix: true })}.
                      </p>
                    )}
                </div>
             </form>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user.email || ''} disabled />
            </div>
          </div>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
              You can change your name {MAX_NAME_CHANGES} times every {NAME_CHANGE_WINDOW_DAYS} days.
            </p>
         </CardFooter>
      </Card>
    </div>
  );
}
