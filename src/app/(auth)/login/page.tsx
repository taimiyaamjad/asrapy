
"use client";

import { Github, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, googleAuthProvider } from "@/lib/firebase/client";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const signUpSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register: registerSignUp, handleSubmit: handleSignUpSubmit, formState: { errors: signUpErrors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user && !loading) {
      router.push("/chat");
    }
  }, [user, loading, router]);


  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
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

  const onSignUp = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: data.displayName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: data.displayName,
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

    } catch (error: any) {
        toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const onLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        router.push("/chat");
    } catch (error: any) {
        toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
        setIsSubmitting(false);
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
                Join the chat by signing in or creating an account.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="login">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <Input id="login-email" type="email" placeholder="m@example.com" {...registerLogin("email")} />
                                {loginErrors.email && <p className="text-xs text-destructive">{loginErrors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <Input id="login-password" type="password" {...registerLogin("password")} />
                                 {loginErrors.password && <p className="text-xs text-destructive">{loginErrors.password.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </TabsContent>
                    <TabsContent value="signup">
                        <form onSubmit={handleSignUpSubmit(onSignUp)} className="space-y-4 pt-4">
                             <div className="space-y-2">
                                <Label htmlFor="signup-name">Display Name</Label>
                                <Input id="signup-name" placeholder="John Doe" {...registerSignUp("displayName")} />
                                {signUpErrors.displayName && <p className="text-xs text-destructive">{signUpErrors.displayName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <Input id="signup-email" type="email" placeholder="m@example.com" {...registerSignUp("email")} />
                                {signUpErrors.email && <p className="text-xs text-destructive">{signUpErrors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <Input id="signup-password" type="password" {...registerSignUp("password")} />
                                {signUpErrors.password && <p className="text-xs text-destructive">{signUpErrors.password.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Signing up...' : 'Sign Up'}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>

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
