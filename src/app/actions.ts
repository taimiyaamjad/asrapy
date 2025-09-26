
"use server";

import { adminAuth, adminDb } from '@/lib/firebase/server';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { headers } from 'next/headers';
import { User } from 'firebase/auth';
import { revalidatePath } from 'next/cache';

// Helper to get admin user from request
async function getAdminUser(): Promise<FirebaseAuthUser | null> {
  const authorization = headers().get('Authorization');
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const userDoc = await getDoc(doc(adminDb, 'users', decodedToken.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        const user = await adminAuth.getUser(decodedToken.uid);
        return user;
      }
    } catch (error) {
      console.error("Error verifying token or getting user:", error);
    }
  }
  return null;
}

export async function banUser(userId: string) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  if (adminUser.uid === userId) {
    throw new Error('Admins cannot ban themselves.');
  }

  try {
    const userDocRef = doc(adminDb, 'users', userId);
    await updateDoc(userDocRef, {
      isBanned: true,
    });
    revalidatePath('/chat');
    return { success: true, message: 'User has been banned.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function timeoutUser(userId: string, durationMinutes: number) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }
  
  if (adminUser.uid === userId) {
    throw new Error('Admins cannot timeout themselves.');
  }

  try {
    const timeoutUntil = Timestamp.fromMillis(Date.now() + durationMinutes * 60 * 1000);
    const userDocRef = doc(adminDb, 'users', userId);
    await updateDoc(userDocRef, {
      timeoutUntil,
    });
    revalidatePath('/chat');
    return { success: true, message: `User has been timed out for ${durationMinutes} minutes.` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function unbanUser(userId: string) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    throw new Error('Unauthorized: You must be an admin to perform this action.');
  }

  try {
    const userDocRef = doc(adminDb, 'users', userId);
    await updateDoc(userDocRef, {
      isBanned: false,
      timeoutUntil: null,
    });
    revalidatePath('/chat');
    return { success: true, message: 'User has been unbanned.' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
