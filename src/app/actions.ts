
"use server";

import { adminAuth, adminDb } from '@/lib/firebase/server';
import { doc, getDoc, updateDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface UserProfile {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string | null;
    roles: string[];
    bio?: string;
    isBanned?: boolean;
    timeoutUntil?: Timestamp | null;
}

// Helper to get user profile without token verification
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(adminDb, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user:", error);
    throw new Error('Failed to retrieve user profile.');
  }
}

export async function banUser(idToken: string, userId: string) {
  // Identity and role checks are removed as per user request.
  // Trusting client-side logic to only show this option to authorized users.
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

export async function timeoutUser(idToken: string, userId: string, durationMinutes: number) {
  // Identity and role checks are removed as per user request.
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

export async function unbanUser(idToken: string, userId: string) {
  // Identity and role checks are removed as per user request.
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

export async function updateUserRoles(idToken: string, userId: string, newRoles: string[]) {
    // Identity and role checks are removed as per user request.
    
    // Ensure 'member' is always present if no other roles are selected
    if (newRoles.length === 0) {
        newRoles = ['member'];
    } else if (!newRoles.includes('member')){
        newRoles.push('member');
    }

    try {
        const userDocRef = doc(adminDb, 'users', userId);
        await updateDoc(userDocRef, {
            roles: newRoles
        });
        revalidatePath('/chat');
        return { success: true, message: "User roles updated successfully." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
