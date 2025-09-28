
'use client';

import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  Send,
  Paperclip,
  X,
  Megaphone,
  Ban,
  Clock,
  MoreVertical,
  ShieldOff,
  Search,
  Inbox,
  HelpCircle,
  Users,
  Settings,
  Mic,
  Headphones,
  BadgeCheck,
  Menu,
  Crown,
  Shield,
  UserCog,
  UserPlus,
  UserCheck,
  UserX,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { FormEvent, useEffect, useRef, useState, useMemo } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp, doc, getDoc, getDocs, updateDoc, FieldValue } from 'firebase/firestore';
import { db, storage, auth } from '@/lib/firebase/client';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { banUser, timeoutUser, unbanUser, updateUserRoles, sendFriendRequest, acceptFriendRequest, removeFriend } from '../actions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const ALL_ROLES = ['GOD', 'CEO', 'COO', 'Admin', 'Staff', 'Developer', 'VIP', 'Coder', 'member'];

const announcementChannels = [
    { id: 'announcements', name: 'announcements', icon: <Megaphone className="h-5 w-5 text-muted-foreground" /> },
];

const textChannels = [
  { id: 'general', name: 'general', icon: <span className="text-muted-foreground text-xl">#</span> },
  { id: 'code-review', name: 'code-review', icon: <span className="text-muted-foreground text-xl">#</span> },
  { id: 'bugs-issues', name: 'bugs-issues', icon: <span className="text-muted-foreground text-xl">#</span> },
  { id: 'documentation', name: 'documentation', icon: <span className="text-muted-foreground text-xl">#</span> },
  { id: 'off-topic', name: 'off-topic', icon: <span className="text-muted-foreground text-xl">#</span> },
];

interface Message {
    id: string;
    text: string | null;
    imageUrl: string | null;
    createdAt: Timestamp;
    userId: string;
    displayName: string | null;
    photoURL: string | null;
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    roles: string[];
    bio?: string;
    isBanned?: boolean;
    timeoutUntil?: Timestamp | null;
    unreadDMs?: { [key: string]: number };
    friends?: string[];
    friendRequests?: { [key: string]: 'sent' | 'received' };
}

interface ActiveChannelInfo {
    id: string;
    name: string;
    type: 'channel' | 'dm';
}

const getHighestRole = (roles: string[]): string => {
    const userRoles = roles || ['member'];
    for (const role of ALL_ROLES) {
        if (userRoles.includes(role)) {
            return role;
        }
    }
    return 'member';
};

const getHighestRoleRank = (roles: string[] | string): number => {
    let safeRoles: string[];
    if (Array.isArray(roles)) {
        safeRoles = roles;
    } else if (typeof roles === 'string') {
        safeRoles = [roles];
    } else {
        safeRoles = ['member'];
    }

    const ranks = safeRoles.map(role => ALL_ROLES.indexOf(role)).filter(rank => rank !== -1);
    if (ranks.length === 0) return ALL_ROLES.length -1; // Default to lowest rank (member)
    return Math.min(...ranks);
};


const hasAdminPower = (roles: string[]): boolean => {
    return (roles || []).some(role => ['GOD', 'CEO', 'COO', 'Admin'].includes(role));
};

const UserProfileCard = ({ userProfile, currentUser }: { userProfile: UserProfile, currentUser: UserProfile }) => {
    const { toast } = useToast();
    const friendshipStatus = useMemo(() => {
        if (currentUser.friends?.includes(userProfile.uid)) {
            return 'friends';
        }
        if (currentUser.friendRequests?.[userProfile.uid] === 'sent') {
            return 'sent';
        }
        if (currentUser.friendRequests?.[userProfile.uid] === 'received') {
            return 'received';
        }
        return 'none';
    }, [currentUser, userProfile]);

    const handleFriendAction = async () => {
        if (!currentUser) return;

        let result;
        try {
            if (friendshipStatus === 'none') {
                result = await sendFriendRequest(currentUser.uid, userProfile.uid);
            } else if (friendshipStatus === 'received') {
                result = await acceptFriendRequest(currentUser.uid, userProfile.uid);
            } else if (friendshipStatus === 'friends') {
                // Consider adding a confirmation dialog here
                result = await removeFriend(currentUser.uid, userProfile.uid);
            }
            if (result?.success) {
                toast({ title: "Success", description: result.message });
            } else {
                throw new Error(result?.message || 'An unknown error occurred.');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    return (
        <div className="bg-background-tertiary rounded-lg overflow-hidden">
            <div className="h-20 bg-accent" />
            <div className="p-4 relative">
                <Avatar className="absolute -top-10 left-4 h-20 w-20 border-4 border-background-tertiary">
                    <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.displayName} />
                    <AvatarFallback>{userProfile.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="pt-10">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        {userProfile.displayName}
                        {hasAdminPower(userProfile.roles) && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                    </h3>
                </div>
            </div>
            <Separator className="bg-background-secondary" />
            <div className="p-4 space-y-4">
                <div>
                    <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">About Me</h4>
                    <p className="text-sm text-gray-300">{userProfile.bio || 'Hey, I\'m a user of AsraPy'}</p>
                </div>
                 <div>
                    <h4 className="font-bold text-xs uppercase text-muted-foreground mb-2">Roles</h4>
                    <div className="flex flex-wrap gap-2">
                         {(userProfile.roles || ['member']).map(role => (
                            <div key={role} className="text-xs bg-gray-600 px-2 py-1 rounded-md capitalize">{role}</div>
                         ))}
                    </div>
                </div>
                {currentUser.uid !== userProfile.uid && (
                    <div>
                        <Button className="w-full" onClick={handleFriendAction}>
                            {friendshipStatus === 'none' && <><UserPlus className="mr-2 h-4 w-4" /> Add Friend</>}
                            {friendshipStatus === 'sent' && <>Request Sent</>}
                            {friendshipStatus === 'received' && <><UserCheck className="mr-2 h-4 w-4" /> Accept Request</>}
                            {friendshipStatus === 'friends' && <><UserX className="mr-2 h-4 w-4" /> Remove Friend</>}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ModerationPopoverContent = ({ targetUser, onAction }: { targetUser: UserProfile, onAction: (action: 'ban' | 'timeout' | 'unban', userId: string, payload?: any) => void }) => {
    
    return (
        <PopoverContent className="w-56 p-2 bg-background-tertiary border-none text-white">
            <div className="flex flex-col gap-1">
                {targetUser.isBanned || (targetUser.timeoutUntil && targetUser.timeoutUntil.toDate() > new Date()) ? (
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onAction('unban', targetUser.uid)}>
                        <ShieldOff className="mr-2 h-4 w-4" /> Remove Ban/Timeout
                    </Button>
                ) : (
                    <>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-900/20" onClick={() => onAction('ban', targetUser.uid)}>
                            <Ban className="mr-2 h-4 w-4" /> Ban User
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onAction('timeout', targetUser.uid, 5)}>
                            <Clock className="mr-2 h-4 w-4" /> Timeout 5m
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onAction('timeout', targetUser.uid, 60)}>
                            <Clock className="mr-2 h-4 w-4" /> Timeout 1h
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onAction('timeout', targetUser.uid, 1440)}>
                            <Clock className="mr-2 h-4 w-4" /> Timeout 1d
                        </Button>
                    </>
                )}
            </div>
        </PopoverContent>
    );
};


export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeChannel, setActiveChannel] = useState<ActiveChannelInfo>({ id: 'general', name: 'general', type: 'channel' });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isChannelsOpen, setChannelsOpen] = useState(false);
  const [isUsersOpen, setUsersOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data() as UserProfile;
                 if (userData.isBanned) {
                    toast({ variant: 'destructive', title: 'Account Banned', description: 'Your account has been permanently banned.' });
                    auth.signOut();
                    router.push('/login');
                    return;
                }
                if (userData.timeoutUntil && userData.timeoutUntil.toDate() > new Date()) {
                    const timeLeft = formatDistanceToNow(userData.timeoutUntil.toDate(), { addSuffix: true });
                    toast({
                        variant: 'destructive',
                        title: 'Account in Timeout',
                        description: `You can use the app again ${timeLeft}.`,
                    });
                    auth.signOut();
                    router.push('/login');
                    return;
                }
                setUserProfile(userData);
            }
        });

        const usersCollectionRef = collection(db, 'users');
        const unsubscribeAllUsers = onSnapshot(usersCollectionRef, (querySnapshot) => {
             const usersList = querySnapshot.docs
                .map(doc => ({...doc.data(), uid: doc.id} as UserProfile))
            setAllUsers(usersList);
        });
        
        const collectionPath = activeChannel.type === 'channel' 
            ? `channels/${activeChannel.id}/messages` 
            : `dms/${activeChannel.id}/messages`;

        const q = query(collection(db, collectionPath), orderBy('createdAt', 'asc'));
        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
        }, (error) => {
             console.error("Error fetching messages:", error);
             setMessages([]);
        });

        return () => {
            unsubscribeUser();
            unsubscribeMessages();
            unsubscribeAllUsers();
        };
    }, [user, loading, router, activeChannel, toast]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imageFile) || !user || !userProfile) return;

    if (userProfile.isBanned) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'You are banned and cannot send messages.' });
        return;
    }
    if (userProfile.timeoutUntil && userProfile.timeoutUntil.toDate() > new Date()) {
        const timeLeft = formatDistanceToNow(userProfile.timeoutUntil.toDate(), { addSuffix: true });
        toast({ variant: 'destructive', title: 'Action Failed', description: `You are in a timeout. You can send messages again ${timeLeft}.` });
        return;
    }

    if (activeChannel.type === 'channel' && activeChannel.id === 'announcements' && !hasAdminPower(userProfile.roles)) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to post in announcements.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let imageUrl: string | null = null;
    const uploadPath = activeChannel.type === 'channel' ? `chat_images/${activeChannel.id}` : `dm_images/${activeChannel.id}`;

    if (imageFile) {
        const storageRef = ref(storage, `${uploadPath}/${Date.now()}_${imageFile.name}`);
        try {
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
            setUploadProgress(100);
        } catch (error) {
            console.error("Image upload error:", error);
            toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the image." });
            setIsUploading(false);
            return;
        }
    }
    
    const collectionPath = activeChannel.type === 'channel' 
        ? `channels/${activeChannel.id}/messages`
        : `dms/${activeChannel.id}/messages`;

    const messageData = {
      text: newMessage.trim() || null,
      imageUrl: imageUrl,
      createdAt: serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL,
    };

    await addDoc(collection(db, collectionPath), messageData);

    if (activeChannel.type === 'dm') {
        const peerId = activeChannel.id.replace(user.uid, '').replace('_', '');
        const peerDocRef = doc(db, 'users', peerId);
        const peerDoc = await getDoc(peerDocRef);
        if (peerDoc.exists()) {
            const peerData = peerDoc.data() as UserProfile;
            const currentUnread = peerData.unreadDMs?.[activeChannel.id] || 0;
            await updateDoc(peerDocRef, {
                [`unreadDMs.${activeChannel.id}`]: currentUnread + 1
            });
        }
    }

    setNewMessage('');
    clearImagePreview();
    setIsUploading(false);
  };
  
  const handleChannelSelect = (id: string, name: string) => {
      setActiveChannel({ id, name, type: 'channel' });
      if (isMobile) setChannelsOpen(false);
  };

  const handleDMSelect = async (peer: UserProfile) => {
      if (!user) return;
      const dmChannelId = [user.uid, peer.uid].sort().join('_');
      setActiveChannel({ id: dmChannelId, name: peer.displayName, type: 'dm' });

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
          [`unreadDMs.${dmChannelId}`]: 0
      });

      if (isMobile) setChannelsOpen(false);
  };
  
  const handleModerationAction = async (action: 'ban' | 'timeout' | 'unban', targetUserId: string, payload?: any) => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to perform this action." });
      return;
    }
    
    try {
        let result;
        if (action === 'ban') {
            result = await banUser(targetUserId);
        } else if (action === 'timeout') {
            result = await timeoutUser(targetUserId, payload as number);
        } else if (action === 'unban') {
            result = await unbanUser(targetUserId);
        }

        if (result?.success) {
            toast({ title: "Success", description: result.message });
        } else {
            throw new Error(result?.message || 'An unknown error occurred.');
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Moderation Failed", description: error.message });
    }
  };

  const groupMessages = useMemo(() => {
    if (messages.length === 0) return [];
    
    const grouped: (Message | {type: 'date_divider', date: string})[][] = [];
    let lastDate: string | null = null;
    let lastUserId: string | null = null;
    let messageGroup: Message[] = [];

    messages.forEach((msg, index) => {
        const messageDate = msg.createdAt ? msg.createdAt.toDate() : new Date();
        const formattedDate = format(messageDate, 'MMMM d, yyyy');

        if (formattedDate !== lastDate) {
            if (messageGroup.length > 0) {
                grouped.push(messageGroup);
                messageGroup = [];
            }
            grouped.push([{ type: 'date_divider', date: formattedDate }]);
            lastDate = formattedDate;
            lastUserId = null; // Reset user grouping on new day
        }

        const timeSinceLastMessage = index > 0 && messages[index-1].createdAt
            ? (messageDate.getTime() - messages[index-1].createdAt.toDate().getTime()) / (1000 * 60)
            : Infinity;

        if (msg.userId === lastUserId && timeSinceLastMessage < 5) {
            messageGroup.push(msg);
        } else {
            if (messageGroup.length > 0) {
                grouped.push(messageGroup);
            }
            messageGroup = [msg];
            lastUserId = msg.userId;
        }
    });

    if (messageGroup.length > 0) {
        grouped.push(messageGroup);
    }
    
    return grouped;
  }, [messages]);

  const groupedUsersByRole = useMemo(() => {
    const onlineUsers = allUsers.filter(u => u.uid !== user?.uid);
    const groups: { [key: string]: UserProfile[] } = {};

    onlineUsers.forEach(u => {
        const highestRole = getHighestRole(u.roles);
        if (!groups[highestRole]) {
            groups[highestRole] = [];
        }
        groups[highestRole].push(u);
    });

    // Order groups by role rank
    const orderedGroups: {role: string, users: UserProfile[]}[] = [];
    for (const role of ALL_ROLES) {
        if (groups[role]) {
            orderedGroups.push({ role, users: groups[role]});
        }
    }

    return orderedGroups;

  }, [allUsers, user]);

  const friends = useMemo(() => {
      if (!userProfile || !userProfile.friends) return [];
      return allUsers.filter(u => userProfile.friends!.includes(u.uid));
  }, [userProfile, allUsers]);

  const pendingRequestsCount = useMemo(() => {
    if (!userProfile?.friendRequests) return 0;
    return Object.values(userProfile.friendRequests).filter(status => status === 'received').length;
  }, [userProfile]);

  if (loading || !user || !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background-tertiary text-white">
        <p>Loading...</p>
      </div>
    );
  }

  const canPost = activeChannel.type === 'dm' || (activeChannel.id !== 'announcements' || hasAdminPower(userProfile.roles));
  const placeholderText = canPost 
    ? (activeChannel.type === 'channel' ? `Message #${activeChannel.name}` : `Message @${activeChannel.name}`)
    : `You cannot post in #${activeChannel.name}`;
    
  const dmUnreadCounts = userProfile?.unreadDMs || {};

  const ChannelsComponent = () => (
    <div className="w-full bg-background-secondary flex flex-col h-full">
        <header className="p-4 h-16 flex items-center shadow-md z-10 shrink-0">
            <h1 className="font-bold text-white">AsraPy - CodingBeyondI...</h1>
        </header>
        <ScrollArea className="flex-1 p-2">
             <div className="px-2 space-y-1">
                <Button 
                    variant="channel"
                    className="w-full justify-start gap-2 relative"
                    onClick={() => router.push('/chat/requests')}
                >
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                    Friend Requests
                    {pendingRequestsCount > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                            {pendingRequestsCount}
                        </div>
                    )}
                </Button>
            </div>
             <div className="px-2 space-y-1 mt-4">
                <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 mt-4'>Announcements</p>
                {announcementChannels.map(channel => (
                    <Button 
                        key={channel.id} 
                        variant={activeChannel.id === channel.id ? "channel-active" : "channel"} 
                        className="w-full justify-start gap-2"
                        onClick={() => handleChannelSelect(channel.id, channel.name)}
                    >
                        {channel.icon}
                        {channel.name}
                    </Button>
                ))}
            </div>
            <div className="px-2 space-y-1 mt-4">
                <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>Text Channels</p>
                {textChannels.map(channel => (
                    <Button 
                        key={channel.id} 
                        variant={activeChannel.id === channel.id ? "channel-active" : "channel"} 
                        className="w-full justify-start gap-2"
                        onClick={() => handleChannelSelect(channel.id, channel.name)}
                    >
                        {channel.icon}
                        {channel.name}
                    </Button>
                ))}
            </div>
             <div className="px-2 mt-4 space-y-1">
                <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2'>Friends</p>
                {friends.map(friend => (
                    <Button 
                        key={friend.uid} 
                        variant={activeChannel.type === 'dm' && activeChannel.name === friend.displayName ? "channel-active" : "channel"} 
                        className="w-full justify-start gap-2 relative"
                        onClick={() => handleDMSelect(friend)}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={friend.photoURL || undefined} alt={friend.displayName} />
                            <AvatarFallback>{(friend.displayName || 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{friend.displayName}</span>
                        {dmUnreadCounts[[user!.uid, friend.uid].sort().join('_')] > 0 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                                {dmUnreadCounts[[user!.uid, friend.uid].sort().join('_')]}
                            </div>
                        )}
                    </Button>
                ))}
            </div>
        </ScrollArea>
         <div className='p-2 bg-[#232428] flex items-center justify-between shrink-0'>
            {user && (
                <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'user'} />
                        <AvatarFallback>{(user.displayName || user.email || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                        <p className="font-semibold text-white truncate">{user.displayName || user.email}</p>
                        <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                </div>
            )}
            <div className="flex items-center text-gray-400">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/profile')}><Settings className="h-5 w-5"/></Button>
            </div>
         </div>
    </div>
  );

  const UsersComponent = () => (
    <div className="w-full bg-background-secondary p-3 flex flex-col h-full">
        <ScrollArea className="flex-1">
            <div className="space-y-4">
                {groupedUsersByRole.map(({ role, users }) => (
                     <div key={role}>
                        <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2 px-1 capitalize">{role} — {users.length}</h3>
                        {users.map(u => (
                             <Popover key={u.uid}>
                                <PopoverTrigger asChild>
                                    <div className="flex items-center gap-2 p-1 rounded-md hover:bg-background-modifier-hover cursor-pointer">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={u.photoURL || undefined} />
                                            <AvatarFallback>{(u.displayName || 'A').charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-white font-medium">{u.displayName}</span>
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent side="left" className="w-80 p-0 border-none bg-transparent">
                                    <UserProfileCard userProfile={u} currentUser={userProfile} />
                                </PopoverContent>
                            </Popover>
                        ))}
                    </div>
                ))}
            </div>
        </ScrollArea>
    </div>
  );
  
  return (
    <div className="flex h-screen bg-background-primary text-gray-200 font-sans">
      {isMobile ? (
        <Sheet open={isChannelsOpen} onOpenChange={setChannelsOpen}>
            <SheetContent side="left" className="p-0 w-64 bg-background-secondary border-none">
                <ChannelsComponent />
            </SheetContent>
        </Sheet>
      ) : (
         <div className="w-64 flex-shrink-0">
            <ChannelsComponent />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-background-tertiary px-4 shadow-md shrink-0">
            <div className='flex items-center gap-2'>
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setChannelsOpen(true)} className="text-white">
                    <Menu className="h-6 w-6"/>
                </Button>
              )}
              {activeChannel.type === 'channel' ? (
                <span className="text-muted-foreground text-2xl font-light">#</span>
              ) : (
                <span className="text-muted-foreground text-2xl font-light">@</span>
              )}
              <h2 className="text-lg font-semibold text-white">
                {activeChannel.name}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
                <div className="hidden md:flex items-center gap-4">
                    <Search className="h-5 w-5" />
                    <Inbox className="h-5 w-5" />
                    <HelpCircle className="h-5 w-5" />
                </div>
                {isMobile && (
                    <Button variant="ghost" size="icon" onClick={() => setUsersOpen(true)} className="text-white">
                        <Users className="h-6 w-6"/>
                    </Button>
                )}
            </div>
          </header>

          <main className="flex-1 flex flex-row overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="px-4 md:px-6 pt-6 pb-2 flex flex-col gap-0">
                   {groupMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground mt-8">
                          <p>This is the beginning of your conversation in {activeChannel.type === 'channel' ? '#' : '@'}{activeChannel.name}.</p>
                      </div>
                   ) : (
                      groupMessages.map((group, groupIndex) => {
                        if ('type' in group[0] && group[0].type === 'date_divider') {
                            return (
                                <div key={groupIndex} className="relative text-center my-6">
                                    <Separator className="bg-gray-700" />
                                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background-primary px-3 text-xs font-semibold text-gray-400">
                                        {group[0].date}
                                    </span>
                                </div>
                            )
                        }

                        const messages = group as Message[];
                        const firstMessage = messages[0];
                        const displayName = firstMessage.displayName || 'User';
                        const photoURL = firstMessage.photoURL || '';
                        const fallback = (displayName).charAt(0);

                        const targetUser = allUsers.find(u => u.uid === firstMessage.userId);
                        const moderatorRoles = userProfile?.roles || [];
                        const targetRoles = targetUser?.roles || ['member'];

                        const moderatorRank = getHighestRoleRank(moderatorRoles);
                        const targetRank = getHighestRoleRank(targetRoles);
                        
                        const canModerate = userProfile && targetUser && userProfile.uid !== targetUser.uid && moderatorRank < targetRank;

                        return (
                            <div key={groupIndex} className="flex items-start gap-4 py-1.5 hover:bg-gray-900/40 px-2 -mx-2 rounded-md">
                                <div className="w-10 pt-1">
                                    { (groupIndex === 0 || !(groupMessages[groupIndex-1][0] as Message).userId || ((groupMessages[groupIndex-1][0] as Message).userId !== firstMessage.userId)) &&
                                        <div className="relative group">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Avatar className="h-10 w-10 cursor-pointer">
                                                        <AvatarImage src={photoURL} alt={displayName} />
                                                        <AvatarFallback>{fallback}</AvatarFallback>
                                                    </Avatar>
                                                </PopoverTrigger>
                                                {targetUser && (
                                                <PopoverContent side="top" className="w-80 p-0 border-none bg-transparent">
                                                    <UserProfileCard userProfile={targetUser} currentUser={userProfile} />
                                                </PopoverContent>
                                                )}
                                           </Popover>
                                          
                                          {canModerate && targetUser && (
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                  <button className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                      <MoreVertical className="h-5 w-5 text-white" />
                                                  </button>
                                              </PopoverTrigger>
                                              <ModerationPopoverContent 
                                                targetUser={targetUser} 
                                                onAction={handleModerationAction}
                                              />
                                            </Popover>
                                          )}
                                        </div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    {(groupIndex === 0 || !messages[0].createdAt || !groupMessages[groupIndex-1][0] || !('createdAt' in groupMessages[groupIndex-1][0]) || ((groupMessages[groupIndex-1][0] as Message).userId !== firstMessage.userId)) &&
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-white">{displayName}</p>
                                            {targetUser && hasAdminPower(targetUser.roles) && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                                            <p className="text-xs text-muted-foreground">
                                                {firstMessage.createdAt ? format(firstMessage.createdAt.toDate(), 'p') : ''}
                                            </p>
                                        </div>
                                    }
                                    <div className="flex flex-col">
                                        {messages.map(msg => (
                                          <div key={msg.id} className="text-gray-300">
                                            {msg.text && <p>{msg.text}</p>}
                                            {msg.imageUrl && (
                                                <div className="mt-2 max-w-xs">
                                                    <Image src={msg.imageUrl} alt="Uploaded image" width={300} height={200} className="rounded-md object-cover" />
                                                </div>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                      })
                   )}
                   <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="px-4 md:px-6 pb-6">
                <div className="w-full bg-background-modifier-accent rounded-lg">
                   {imagePreview && (
                    <div className="relative p-4 border-b border-background-tertiary">
                      <div className="relative w-fit">
                        <Image src={imagePreview} alt="Preview" width={80} height={80} className="rounded-md object-cover" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={clearImagePreview}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {isUploading && <Progress value={uploadProgress} className="w-full h-1 rounded-t-lg" />}
                  <form onSubmit={handleSendMessage} className="relative flex items-center">
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="m-2 text-gray-300 hover:bg-background-modifier-hover"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!canPost || isUploading}
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Input 
                          placeholder={placeholderText}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="bg-transparent border-none text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-200 placeholder-gray-500"
                          disabled={!canPost || isUploading}
                      />
                       <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          className="hidden"
                          accept="image/*"
                       />
                      <Button type="submit" size="icon" variant="ghost" className="m-2 text-gray-300 hover:bg-background-modifier-hover" disabled={!canPost || isUploading || (!newMessage.trim() && !imageFile)}>
                          <Send className="h-5 w-5" />
                      </Button>
                  </form>
                </div>
              </div>
            </div>

            <div className="hidden md:block w-64 flex-shrink-0">
                <UsersComponent />
            </div>
          </main>
      </div>

       {isMobile && (
        <Sheet open={isUsersOpen} onOpenChange={setUsersOpen}>
            <SheetContent side="right" className="p-0 w-64 bg-background-secondary border-none">
                <UsersComponent />
            </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
