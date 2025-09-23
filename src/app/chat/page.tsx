
"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 text-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mt-4 text-muted-foreground">You must be logged in to view the chat.</p>
        <Button asChild className="mt-8">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Chat Room
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Welcome to the AsraPy chat, {user.displayName}!
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a placeholder for the chat interface. More features coming soon!
        </p>
      </div>
    </div>
  );
}
