
'use client';

import React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {children}
      </div>
    </SidebarProvider>
  );
}
