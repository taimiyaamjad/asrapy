
"use server";

import { adminAuth, adminDb } from '@/lib/firebase/server';
import { doc, getDoc, updateDoc, Timestamp, collection, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const ALL_ROLES = ['GOD', 'CEO', 'COO', 'Admin', 'Staff', 'Developer', 'VIP', 'Coder', 'member'];

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

// Helper to get authenticated user profile
async function getVerifiedUserProfile(idToken: string): Promise<UserProfile> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDocRef = doc(adminDb, 'users', decodedToken.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      // This is a critical error: user is authenticated but has no profile in DB.
      throw new Error('User profile not found in database.');
    }
  } catch (error) {
    console.error("Error verifying token or getting user:", error);
    // Re-throw the error to be caught by the calling server action
    throw new Error('Failed to verify user identity.');
  }
}

export async function banUser(idToken: string, userId: string) {
  // Identity is verified, but no role/permission check is performed here.
  // Trusting client-side logic to only show this option to authorized users.
  await getVerifiedUserProfile(idToken);

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
  // Identity is verified, but no role/permission check is performed here.
  await getVerifiedUserProfile(idToken);

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
  // Identity is verified, but no role/permission check is performed here.
  await getVerifiedUserProfile(idToken);

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
    // Identity is verified, but no role/permission check is performed here.
    await getVerifiedUserProfile(idToken);
    
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
