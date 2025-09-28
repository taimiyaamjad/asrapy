
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { acceptFriendRequest, removeFriend } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, UserX, ArrowLeft } from 'lucide-react';
import type { UserProfile } from '../page';


export default function FriendRequestsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            }
        });

        const usersCollectionRef = collection(db, 'users');
        const unsubscribeAllUsers = onSnapshot(usersCollectionRef, (querySnapshot) => {
             const usersList = querySnapshot.docs
                .map(doc => ({...doc.data(), uid: doc.id} as UserProfile))
            setAllUsers(usersList);
        });

        return () => {
            unsubscribeUser();
            unsubscribeAllUsers();
        };

    }, [user, loading, router]);
    
    const friendRequesters = useMemo(() => {
        if (!userProfile || !userProfile.friendRequests) return [];
        const requesterIds = Object.entries(userProfile.friendRequests)
            .filter(([, status]) => status === 'received')
            .map(([id]) => id);
        
        return allUsers.filter(u => requesterIds.includes(u.uid));

    }, [userProfile, allUsers]);

    const handleAccept = async (requesterId: string) => {
        if (!user) return;
        const result = await acceptFriendRequest(user.uid, requesterId);
         if (result.success) {
            toast({ title: "Success", description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };

    const handleDecline = async (requesterId: string) => {
         if (!user) return;
        const result = await removeFriend(user.uid, requesterId);
        if (result.success) {
            toast({ title: "Request Declined" });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    };

    if (loading || !user || !userProfile) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-background-tertiary text-white">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background-primary text-gray-200 font-sans">
             <div className="w-full max-w-2xl mx-auto flex flex-col">
                <header className="h-16 flex items-center justify-between border-b border-background-tertiary px-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <h2 className="text-lg font-semibold text-white">Friend Requests</h2>
                    </div>
                </header>
                 <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {friendRequesters.length === 0 ? (
                            <p className="text-center text-muted-foreground mt-8">You have no pending friend requests.</p>
                        ) : (
                            friendRequesters.map(requester => (
                                <div key={requester.uid} className="flex items-center justify-between p-2 rounded-lg hover:bg-background-secondary">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={requester.photoURL || undefined} alt={requester.displayName}/>
                                            <AvatarFallback>{(requester.displayName || 'U').charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-white">{requester.displayName}</p>
                                            <p className="text-sm text-muted-foreground">Incoming Friend Request</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => handleAccept(requester.uid)}>
                                            <UserCheck className="h-5 w-5" />
                                        </Button>
                                         <Button size="icon" variant="destructive" onClick={() => handleDecline(requester.uid)}>
                                            <UserX className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
