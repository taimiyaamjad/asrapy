
"use client";

import { Github, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithPopup } from "firebase/auth";
import { auth, db, googleAuthProvider } from "@/lib/firebase/client";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !loading) {
      router.push("/chat");
    }
  }, [user, loading, router]);


  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
       // Create a user document in Firestore, or merge if it already exists
       // This prevents errors on subsequent logins.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        roles: ['member'],
        isBanned: false,
        timeoutUntil: null,
        bio: "",
        friends: [],
        friendRequests: {},
      }, { merge: true });
      router.push("/chat");
    } catch (error) {
      console.error("Google login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: "Could not log in with Google." });
    }
  };

  if(loading || user) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome</CardTitle>
          <CardDescription>
            Join the chat by signing in with your favorite provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" onClick={handleGoogleLogin}>
              <LogIn className="mr-2 h-4 w-4" /> Continue with Google
            </Button>
            <Button variant="outline" disabled>
              <Github className="mr-2 h-4 w-4" /> Continue with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
