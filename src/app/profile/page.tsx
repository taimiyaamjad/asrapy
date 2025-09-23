
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ProfilePage() {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
        await updateProfile(auth.currentUser!, { photoURL });

        // Update Firestore user document
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { photoURL });
        
        setUploadProgress(100);

        // This is a bit of a hack to force a state update in the auth context
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
         // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-3.5rem)]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Your Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback className="text-4xl">{(user.displayName || 'U').charAt(0)}</AvatarFallback>
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
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={user.displayName || ''} disabled />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user.email || ''} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
