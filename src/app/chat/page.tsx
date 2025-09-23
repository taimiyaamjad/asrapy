
'use client';

import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  PanelLeft,
  Send,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const projects = [
  { id: 'zenflow', name: 'ZenFlow', avatar: '/zenflow.png' },
  { id: 'zencloud', name: 'ZenCloud', avatar: '/zencloud.png' },
  { id: 'asra-tutor', name: 'Asra-Tutor', avatar: '/asra-tutor.png' },
];

const channels = [
  { id: 'general', name: 'general', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
  { id: 'announcements', name: 'announcements', icon: <ShieldAlert className="h-4 w-4 text-muted-foreground" /> },
  { id: 'code-review', name: 'code-review', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
  { id: 'bugs-issues', name: 'bugs-issues', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
  { id: 'documentation', name: 'documentation', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
  { id: 'off-topic', name: 'off-topic', icon: <MessageSquare className="h-4 w-4 text-muted-foreground" /> },
];

interface Message {
    id: string;
    text: string;
    createdAt: Timestamp;
    userId: string;
    displayName: string | null;
    photoURL: string | null;
}

interface UserProfile {
    role: 'admin' | 'member';
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [userRole, setUserRole] = useState<'admin' | 'member'>('member');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

    useEffect(() => {
        if (!user) return;
        
        // Fetch user role
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (docSnap.exists() && docSnap.data().role) {
                setUserRole(docSnap.data().role);
            }
        });

        const q = query(collection(db, 'channels', activeChannel, 'messages'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [user, activeChannel]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
        }
    }, [messages]);


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    if (activeChannel === 'announcements' && userRole !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'Only admins can post in the announcements channel.',
      });
      return;
    }

    await addDoc(collection(db, 'channels', activeChannel, 'messages'), {
      text: newMessage,
      createdAt: serverTimestamp(),
      userId: user.uid,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL,
    });

    setNewMessage('');
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

  const canPost = activeChannel !== 'announcements' || userRole === 'admin';

  return (
    <>
      {/* Project Workspace Sidebar */}
      <Sidebar
        collapsible="icon"
        className="w-20 bg-background/30 backdrop-blur-sm border-r"
      >
        <SidebarContent className="p-2 flex flex-col items-center">
          <SidebarMenu className="flex-grow">
            {projects.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton
                  tooltip={{
                    children: project.name,
                    side: 'right',
                    align: 'center',
                  }}
                  className="!size-12 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={project.avatar} />
                    <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                  tooltip={{
                    children: 'Settings',
                    side: 'right',
                    align: 'center',
                  }}
                  className="!size-12 rounded-full"
              >
                <Settings />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background/80">
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <div className='flex items-center gap-4'>
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-lg font-semibold">
              <span className="text-muted-foreground">#</span> {activeChannel}
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
             <ScrollArea className="flex-1 p-4">
                <p className='text-sm font-semibold text-muted-foreground mb-2'>TEXT CHANNELS</p>
                 {channels.map(channel => (
                     <Button 
                        key={channel.id} 
                        variant={activeChannel === channel.id ? "secondary" : "ghost"} 
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveChannel(channel.id)}
                    >
                         {channel.icon}
                         {channel.name}
                     </Button>
                 ))}
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
                        This is the beginning of the #{activeChannel} channel.
                    </div>
                 ) : (
                    messages.map(msg => {
                      const displayName = msg.displayName || 'User';
                      const photoURL = msg.photoURL || '';
                      const fallback = (displayName).charAt(0);
                      return (
                        <div key={msg.id} className="flex items-start gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={photoURL} alt={displayName} />
                                <AvatarFallback>{fallback}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{displayName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {msg.createdAt ? format(msg.createdAt.toDate(), 'p') : ''}
                                    </p>
                                </div>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                      )
                    })
                 )}
              </div>
            </ScrollArea>
            <div className="border-t p-4 flex justify-center">
              <div className="w-full max-w-4xl">
                <form onSubmit={handleSendMessage} className="relative">
                    <Input 
                        placeholder={canPost ? `Message #${activeChannel}` : `You cannot post in #${activeChannel}`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="pr-12"
                        disabled={!canPost}
                    />
                    <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-10" disabled={!canPost}>
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
             <ScrollArea className="flex-1 p-4">
                <p className='text-sm font-semibold text-muted-foreground mb-2'>TEXT CHANNELS</p>
                 {channels.map(channel => (
                     <Button 
                        key={channel.id} 
                        variant={activeChannel === channel.id ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveChannel(channel.id)}
                    >
                         {channel.icon}
                         {channel.name}
                     </Button>
                 ))}
             </ScrollArea>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
