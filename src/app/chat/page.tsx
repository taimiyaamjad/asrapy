
'use client';

import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
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
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, storage, auth } from '@/lib/firebase/client';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { banUser, timeoutUser, unbanUser } from '../actions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const projects = [
  { id: 'asrapy', name: 'AsraPy', avatar: '/asra-tutor.png' },
  { id: 'zencloud', name: 'ZenCloud', avatar: '/zencloud.png' },
  { id: 'zenflow', name: 'ZenFlow', avatar: '/zenflow.png' },
];

const announcementChannels = [
    { id: 'announcements', name: 'announcements', icon: <Megaphone className="h-4 w-4 text-muted-foreground" /> },
];

const textChannels = [
  { id: 'general', name: 'general', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
  { id: 'code-review', name: 'code-review', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
  { id: 'bugs-issues', name: 'bugs-issues', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
  { id: 'documentation', name: 'documentation', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
  { id: 'off-topic', name: 'off-topic', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
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

interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    role: 'admin' | 'member';
    isBanned?: boolean;
    timeoutUntil?: Timestamp | null;
}

interface ActiveChannelInfo {
    id: string;
    name: string;
    type: 'channel' | 'dm';
}

export default function ChatPage() {
  const { user, loading } = useAuth();
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

    useEffect(() => {
        if (!user) return;
        
        // Fetch user profile for role and moderation status
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            }
        });

        // Fetch all users for DM list
        const usersCollectionRef = collection(db, 'users');
        getDocs(usersCollectionRef).then(querySnapshot => {
            const usersList = querySnapshot.docs
                .map(doc => ({...doc.data(), uid: doc.id} as UserProfile))
                .filter(u => u.uid !== user.uid); // Exclude current user
            setAllUsers(usersList);
        });
        
        // Subscribe to messages for the active channel/DM
        const collectionPath = activeChannel.type === 'channel' 
            ? ['channels', activeChannel.id, 'messages'] 
            : ['dms', activeChannel.id, 'messages'];

        const q = query(collection(db, ...collectionPath), orderBy('createdAt', 'asc'));
        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
        }, (error) => {
             console.error("Error fetching messages:", error);
             setMessages([]); // Clear messages on error
        });

        return () => {
            unsubscribeUser();
            unsubscribeMessages();
        };
    }, [user, activeChannel]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
        }
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

    // Check for ban or timeout
    if (userProfile.isBanned) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'You are banned and cannot send messages.' });
        return;
    }
    if (userProfile.timeoutUntil && userProfile.timeoutUntil.toDate() > new Date()) {
        const timeLeft = formatDistanceToNow(userProfile.timeoutUntil.toDate(), { addSuffix: true });
        toast({ variant: 'destructive', title: 'Action Failed', description: `You are in a timeout. You can send messages again ${timeLeft}.` });
        return;
    }

    if (activeChannel.type === 'channel' && activeChannel.id === 'announcements' && userProfile.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'Only admins can post in the announcements channel.',
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
             // Simulate progress for now as uploadBytes does not provide it
            setUploadProgress(100);
        } catch (error) {
            console.error("Image upload error:", error);
            toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the image." });
            setIsUploading(false);
            return;
        }
    }
    
    const collectionPath = activeChannel.type === 'channel' 
        ? ['channels', activeChannel.id, 'messages']
        : ['dms', activeChannel.id, 'messages'];

    await addDoc(collection(db, ...collectionPath), {
      text: newMessage.trim() || null,
      imageUrl: imageUrl,
      createdAt: serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL,
    });

    setNewMessage('');
    clearImagePreview();
    setIsUploading(false);
  };
  
  const handleChannelSelect = (id: string, name: string) => {
      setActiveChannel({ id, name, type: 'channel' });
  };

  const handleDMSelect = (peer: UserProfile) => {
      if (!user) return;
      // Create a consistent channel ID for the two users
      const dmChannelId = [user.uid, peer.uid].sort().join('_');
      setActiveChannel({ id: dmChannelId, name: peer.displayName, type: 'dm' });
  };
  
  const handleModerationAction = async (action: 'ban' | 'timeout' | 'unban', targetUserId: string, duration?: number) => {
    try {
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error("Not authenticated");
        
        let result;
        if (action === 'ban') {
            result = await banUser(targetUserId);
        } else if (action === 'timeout' && duration) {
            result = await timeoutUser(targetUserId, duration);
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


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 text-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mt-4 text-muted-foreground">
          You must be logged in to view the chat.
        </p>
        <Button asChild className="mt-8">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const canPost = activeChannel.type === 'dm' || (activeChannel.id !== 'announcements' || userProfile?.role === 'admin');
  const placeholderText = canPost 
    ? (activeChannel.type === 'channel' ? `Message #${activeChannel.name}` : `Message ${activeChannel.name}`)
    : `You cannot post in #${activeChannel.name}`;

  return (
    <>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background/80">
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <div className='flex items-center gap-4'>
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-lg font-semibold">
              {activeChannel.type === 'channel' && <span className="text-muted-foreground">#</span>}
              {activeChannel.name}
            </h2>
          </div>
          <div>{/* Header Actions */}</div>
        </header>

        <main className="flex-1 flex flex-row overflow-hidden">
          {/* Channel List */}
          <div className="hidden md:flex flex-col w-64 border-r">
             <div className="p-4 border-b">
                <h2 className="text-xl font-bold">AsraPy</h2>
             </div>
             <ScrollArea className="flex-1 p-4 space-y-4">
                <div>
                    <p className='text-sm font-semibold text-muted-foreground mb-2 px-2'>ANNOUNCEMENTS</p>
                    {announcementChannels.map(channel => (
                        <Button 
                            key={channel.id} 
                            variant={activeChannel.id === channel.id ? "secondary" : "ghost"} 
                            className="w-full justify-start gap-2"
                            onClick={() => handleChannelSelect(channel.id, channel.name)}
                        >
                            {channel.icon}
                            {channel.name}
                        </Button>
                    ))}
                </div>
                <div>
                    <p className='text-sm font-semibold text-muted-foreground mb-2 px-2'>TEXT CHANNELS</p>
                    {textChannels.map(channel => (
                        <Button 
                            key={channel.id} 
                            variant={activeChannel.id === channel.id ? "secondary" : "ghost"} 
                            className="w-full justify-start gap-2"
                            onClick={() => handleChannelSelect(channel.id, channel.name)}
                        >
                            {channel.icon}
                            {channel.name}
                        </Button>
                    ))}
                </div>
                 <div>
                    <p className='text-sm font-semibold text-muted-foreground mb-2 px-2'>DIRECT MESSAGES</p>
                    {allUsers.map(dmUser => (
                        <Button 
                            key={dmUser.uid} 
                            variant={activeChannel.type === 'dm' && activeChannel.name === dmUser.displayName ? "secondary" : "ghost"} 
                            className="w-full justify-start gap-2"
                            onClick={() => handleDMSelect(dmUser)}
                        >
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={dmUser.photoURL || undefined} alt={dmUser.displayName} />
                                <AvatarFallback>{(dmUser.displayName || 'U').charAt(0)}</AvatarFallback>
                            </Avatar>
                            {dmUser.displayName}
                        </Button>
                    ))}
                </div>
             </ScrollArea>
             <div className='p-2 border-t flex items-center gap-2'>
                {user && (
                    <>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'user'} />
                            <AvatarFallback>{(user.displayName || user.email || 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <p className="font-semibold">{user.displayName || user.email}</p>
                            <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                    </>
                )}
             </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
              <div className="flex flex-col gap-4">
                 {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground mt-8">
                        This is the beginning of your conversation.
                    </div>
                 ) : (
                    messages.map(msg => {
                      const displayName = msg.displayName || 'User';
                      const photoURL = msg.photoURL || '';
                      const fallback = (displayName).charAt(0);
                      
                      const canModerate = userProfile?.role === 'admin' && msg.userId !== user.uid;
                      const targetUser = allUsers.find(u => u.uid === msg.userId);

                      return (
                        <div key={msg.id} className="flex items-start gap-3">
                            <div className="relative group">
                              <Avatar className="h-9 w-9">
                                  <AvatarImage src={photoURL} alt={displayName} />
                                  <AvatarFallback>{fallback}</AvatarFallback>
                              </Avatar>
                              {canModerate && targetUser && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                      <button className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <MoreVertical className="h-5 w-5 text-white" />
                                      </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48 p-2">
                                      <div className="flex flex-col gap-1">
                                          {targetUser.isBanned || targetUser.timeoutUntil ? (
                                              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleModerationAction('unban', msg.userId)}>
                                                  <ShieldOff className="mr-2 h-4 w-4" /> Unban
                                              </Button>
                                          ) : (
                                            <>
                                              <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700" onClick={() => handleModerationAction('ban', msg.userId)}>
                                                  <Ban className="mr-2 h-4 w-4" /> Ban User
                                              </Button>
                                              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleModerationAction('timeout', msg.userId, 5)}>
                                                  <Clock className="mr-2 h-4 w-4" /> Timeout 5m
                                              </Button>
                                              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleModerationAction('timeout', msg.userId, 60)}>
                                                  <Clock className="mr-2 h-4 w-4" /> Timeout 1h
                                              </Button>
                                              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleModerationAction('timeout', msg.userId, 1440)}>
                                                  <Clock className="mr-2 h-4 w-4" /> Timeout 1d
                                              </Button>
                                            </>
                                          )}
                                      </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{displayName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {msg.createdAt ? format(msg.createdAt.toDate(), 'p') : ''}
                                    </p>
                                </div>
                                {msg.text && <p className="text-sm">{msg.text}</p>}
                                {msg.imageUrl && (
                                    <div className="mt-2">
                                        <Image src={msg.imageUrl} alt="Uploaded image" width={300} height={200} className="rounded-md object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                      )
                    })
                 )}
              </div>
            </ScrollArea>
            <div className="border-t p-4 flex justify-center">
              <div className="w-full max-w-4xl">
                 {imagePreview && (
                  <div className="relative mb-2 w-fit">
                    <Image src={imagePreview} alt="Preview" width={100} height={100} className="rounded-md object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={clearImagePreview}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {isUploading && <Progress value={uploadProgress} className="w-full h-2 mb-2" />}
                <form onSubmit={handleSendMessage} className="relative">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-10"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!canPost || isUploading}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input 
                        placeholder={placeholderText}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="pl-12 pr-12"
                        disabled={!canPost || isUploading}
                    />
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        className="hidden"
                        accept="image/*"
                     />
                    <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10" disabled={!canPost || isUploading || (!newMessage.trim() && !imageFile)}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

       {/* Mobile Sidebar (for channels) */}
      <Sidebar side="left" collapsible="offcanvas" className='md:hidden'>
        <SidebarHeader>
           <h2 className="text-xl font-bold">AsraPy</h2>
        </SidebarHeader>
        <SidebarContent>
             <ScrollArea className="flex-1 p-4 space-y-4">
                <div>
                    <p className='text-sm font-semibold text-muted-foreground mb-2'>ANNOUNCEMENTS</p>
                    {announcementChannels.map(channel => (
                        <Button 
                            key={channel.id} 
                            variant={activeChannel.id === channel.id ? "secondary" : "ghost"} 
                            className="w-full justify-start gap-2"
                            onClick={() => handleChannelSelect(channel.id, channel.name)}
                        >
                            {channel.icon}
                            {channel.name}
                        </Button>
                    ))}
                </div>
                <div>
                    <p className='text-sm font-semibold text-muted-foreground mb-2'>TEXT CHANNELS</p>
                    {textChannels.map(channel => (
                        <Button 
                            key={channel.id} 
                            variant={activeChannel.id === channel.id ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                             onClick={() => handleChannelSelect(channel.id, channel.name)}
                        >
                            {channel.icon}
                            {channel.name}
                        </Button>
                    ))}
                </div>
                 <div>
                    <p className='text-sm font-semibold text-muted-foreground mb-2'>DIRECT MESSAGES</p>
                    {allUsers.map(dmUser => (
                        <Button 
                            key={dmUser.uid} 
                            variant={activeChannel.type === 'dm' && activeChannel.name === dmUser.displayName ? "secondary" : "ghost"} 
                            className="w-full justify-start gap-2"
                            onClick={() => handleDMSelect(dmUser)}
                        >
                             <Avatar className="h-6 w-6">
                                <AvatarImage src={dmUser.photoURL || undefined} alt={dmUser.displayName} />
                                <AvatarFallback>{(dmUser.displayName || 'U').charAt(0)}</AvatarFallback>
                            </Avatar>
                            {dmUser.displayName}
                        </Button>
                    ))}
                </div>
             </ScrollArea>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
