
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
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText,
  Github,
  Home,
  MessageSquare,
  Package,
  PanelLeft,
  Settings,
  Users,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const projects = [
  { id: 'zenflow', name: 'ZenFlow', avatar: '/zenflow.png' },
  { id: 'zencloud', name: 'ZenCloud', avatar: '/zencloud.png' },
  { id: 'asra-tutor', name: 'Asra-Tutor', avatar: '/asra-tutor.png' },
];

const channels = [
  { id: 'general', name: 'general' },
  { id: 'code-review', name: 'code-review' },
  { id: 'bugs-issues', name: 'bugs-issues' },
  { id: 'documentation', name: 'documentation' },
  { id: 'off-topic', name: 'off-topic' },
];

export default function ChatPage() {
  const { user, loading } = useAuth();

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
              <span className="text-muted-foreground">#</span> general
            </h2>
          </div>
          <div>{/* Header Actions */}</div>
        </header>

        <main className="flex-1 flex flex-row overflow-hidden">
          {/* Channel List */}
          <div className="hidden md:flex flex-col w-64 border-r">
             <div className="p-4 border-b">
                <h2 className="text-xl font-bold">ZenFlow</h2>
             </div>
             <ScrollArea className="flex-1 p-4">
                <p className='text-sm font-semibold text-muted-foreground mb-2'>TEXT CHANNELS</p>
                 {channels.map(channel => (
                     <Button key={channel.id} variant="ghost" className="w-full justify-start gap-2">
                         <MessageSquare className="h-4 w-4 text-muted-foreground" />
                         {channel.name}
                     </Button>
                 ))}
             </ScrollArea>
             <div className='p-2 border-t flex items-center gap-2'>
                {user && (
                    <>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'user'} />
                            <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <p className="font-semibold">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                    </>
                )}
             </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="text-center text-muted-foreground">
                This is the beginning of the #general channel.
              </div>
            </div>
            <div className="border-t p-4">
              <Input placeholder="Message #general" />
            </div>
          </div>
        </main>
      </div>

       {/* Mobile Sidebar (for channels) */}
      <Sidebar side="left" collapsible="offcanvas" className='md:hidden'>
        <SidebarHeader>
           <h2 className="text-xl font-bold">ZenFlow</h2>
        </SidebarHeader>
        <SidebarContent>
             <ScrollArea className="flex-1 p-4">
                <p className='text-sm font-semibold text-muted-foreground mb-2'>TEXT CHANNELS</p>
                 {channels.map(channel => (
                     <Button key={channel.id} variant="ghost" className="w-full justify-start gap-2">
                         <MessageSquare className="h-4 w-4 text-muted-foreground" />
                         {channel.name}
                     </Button>
                 ))}
             </ScrollArea>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
