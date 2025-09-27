
'use client';

import React from 'react';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black">
      {children}
    </div>
  );
}
