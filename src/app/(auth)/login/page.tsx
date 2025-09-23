
"use client";

import { Github, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithPopup } from "firebase/auth";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);


  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      router.push("/chat");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  if(loading || user) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Choose a login method to join the chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button variant="outline" onClick={handleGoogleLogin}>
              <LogIn className="mr-4 h-4 w-4" /> Login with Google
            </Button>
            <Button variant="outline" disabled>
              <Github className="mr-4 h-4 w-4" /> Login with GitHub (soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
